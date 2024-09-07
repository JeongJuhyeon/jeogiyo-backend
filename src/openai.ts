import OpenAI from 'openai';
import { ChatCompletionMessageParam, ChatCompletionUserMessageParam } from 'openai/resources/index.mjs';
import { MyEnv } from './index.js';
import { throwInline } from './util.js';
import { PreppedQuery } from './prompts.js';
import { z, ZodType } from 'zod';

const accountId = '56158a1d1b03441dbc68b73fe1b88b62';
const gatewayId = 'fuji';
const baseURL = `https://gateway.ai.cloudflare.com/v1/${accountId}/${gatewayId}/openai`;

async function completeChat(prompt: string, deps: { env: MyEnv }) {
	const openai = new OpenAI({
		baseURL,
		apiKey: deps.env.OPENAI_API_KEY,
	});

	const messages: ChatCompletionMessageParam[] = [{ role: 'user', content: prompt }];
	const maxTokens = 200;

	const chatCompletion = await openai.chat.completions.create({
		model: 'gpt-4o-2024-08-06',
		messages,
		max_tokens: maxTokens,
	});

	const response = chatCompletion.choices[0].message.content;
	return response ?? throwInline('No response from OpenAI (NULL)');
}

export async function execute<T extends ZodType>(preppedQuery: PreppedQuery<T>, deps: { env: MyEnv }) {
	const response = await completeChat(preppedQuery.prompt, deps);
	return preppedQuery.outputValidator.parse(response) as z.infer<T>;
}
