import { MyEnv } from './index.js';
import { execute } from './openai.js';
import { classificationQuery, extractDestinationQuery, prepQuery, translationQuery } from './prompts.js';
import { contentIsStation, stringContainsKorean } from './util.js';

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
	// If question has no whitespace and ends in "역", it's a destination question
	if (contentIsStation(question)) {
		return 'HOW_TO_GET_TO_STATION';
	}

	const query = classificationQuery;
	const prompt = query.prompt(question);
	const preppedQuery = prepQuery(query, prompt);
	const classification = await execute(preppedQuery, { env: deps.env });
	return classification;
}

export async function extractDestination(question: string, deps: { env: MyEnv }) {
	const query = extractDestinationQuery;
	const prompt = query.prompt(question);
	const preppedQuery = prepQuery(query, prompt);
	const classification = await execute(preppedQuery, { env: deps.env });
	return classification;
}
