import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { AskRequest, AskResponse, AskResponseData, QuestionType } from './requests.js';
import { z } from 'zod';
import { completeChat } from './openai.js';
import { classifyQuestion, translateQuestion } from './llmservice.js';
import { confirmDirection, findNextStation, getLastCoordinates, storeLastcoordinates } from './navigation.js';
import { throwInline } from './util.js';
import { Coordinates } from './types.js';
import { pick } from 'remeda';

export interface MyEnv {
	SUPABASE_SERVICE_ROLE_KEY: string;
	SUPABASE_ANON_KEY: string;
	AWS_ACCESS_KEY: string;
	AWS_SECRET_ACCESS_KEY: string;
	OPENAI_API_KEY: string;
	COORDINATES_KV: KVNamespace;
}
export type HonoEnv = { Bindings: MyEnv; Variables: {} };
const app = new Hono<HonoEnv>();
app.use(
	'*',
	cors({
		origin: '*',
		allowMethods: ['GET', 'POST', 'OPTIONS'],
	})
);

const routes = app
	.get('/health', (c) => {
		return c.json({ success: true });
	})
	.post('/api/ask', zValidator('json', AskRequest), async (c) => {
		const reqBody = c.req.valid('json');
		const englishSpokenText = await translateQuestion(reqBody.spokenText, c);
		console.log('English spoken text:', englishSpokenText);
		const questionClassification = await classifyQuestion(englishSpokenText, c);
		let responseData: AskResponseData;
		if (questionClassification === 'REPEAT_LAST_RESPONSE') {
			responseData = {
				questionType: QuestionType.REPEAT_LAST_RESPONSE,
				data: {},
			};
		} else if (questionClassification === 'OTHER') {
			responseData = {
				questionType: QuestionType.UNKNOWN,
				data: {},
			};
		} else if (questionClassification === 'HOW_TO_GET_TO_STATION') {
			const nextStationData = await findNextStation(englishSpokenText, reqBody.coordinates, c);
			responseData = {
				questionType: QuestionType.TO_DESTINATION,
				data: pick(nextStationData, ['directionNextStation', 'instructions']),
			};
			if ('destinationCoordinates' in nextStationData) {
				await storeLastcoordinates({ user: reqBody.coordinates, destination: nextStationData.destinationCoordinates! }, c);
			}
		} else if (questionClassification === 'CONFIRM_CURRENT_DIRECTION') {
			const lastCoordinates = await getLastCoordinates(c);
			if (!('user' in lastCoordinates)) {
				return c.json({
					success: false,
					error: 'No previous coordinates found. 적어도 한번 어디 가고 싶은지 물어봐줬어야 해요.',
				});
			}

			const result = confirmDirection({
				current: reqBody.coordinates,
				previous: lastCoordinates.user,
				destination: lastCoordinates.destination,
			});
			responseData = {
				questionType: QuestionType.CONFIRM_DIRECTION,
				data: result,
			};
		} else {
			throwInline(`Invalid question classification: ${questionClassification}`);
		}

		const response: AskResponse = {
			success: true,
			...responseData,
		};
		return c.json(response);
	});

export type AppType = typeof routes;

export default app;
