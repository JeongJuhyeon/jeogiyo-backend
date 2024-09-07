import { MyEnv } from './index.js';
import { execute } from './openai.js';
import { classificationQuery, prepQuery, translationQuery } from './prompts.js';
import { stringContainsKorean } from './util.js';

export async function translateQuestion(content: string, deps: { env: MyEnv }): Promise<string> {
	let englishQuestion: string;
	if (stringContainsKorean(content)) {
		const query = translationQuery;
		const prompt = query.prompt(content);
		englishQuestion = await execute(prepQuery(query, prompt), { env: deps.env });
	} else {
		englishQuestion = content;
	}
	return englishQuestion;
}

export async function classifyQuestion(question: string, deps: { env: MyEnv }) {
	const query = classificationQuery;
	const prompt = query.prompt(question);
	const s = prepQuery(query, prompt);
	const classification = await execute(s, { env: deps.env });
	return classification;
}
