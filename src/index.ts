import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { AskRequest, AskResponse, AskResponseData, QuestionType } from './requests.js';
import { z } from 'zod';
import { completeChat } from './openai.js';
import { classifyQuestion, translateQuestion } from './llmservice.js';

export interface MyEnv {
	SUPABASE_SERVICE_ROLE_KEY: string;
	SUPABASE_ANON_KEY: string;
	AWS_ACCESS_KEY: string;
	AWS_SECRET_ACCESS_KEY: string;
	OPENAI_API_KEY: string;
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
		} else {
			responseData = {
				questionType: QuestionType.TO_DESTINATION,
				data: {
					direction_next_station: '제기동역',
					instructions: ['서울역까지 1호선 타세요.', 'GPT says: ' + questionClassification],
				},
			};
		}

		const response: AskResponse = {
			success: true,
			...responseData,
		};
		return c.json(response);
	});

export type AppType = typeof routes;

export default app;
