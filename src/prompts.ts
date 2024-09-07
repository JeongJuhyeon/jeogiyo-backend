import { z, ZodType } from 'zod';
import { completeChat } from './openai.js';
import { createTagValidator, wrapTags } from './util.js';

interface Shot {
	input: string;
	output: string;
}

export type Prompt = (validatedInput: string) => string;
export interface Query<T extends ZodType> {
	prompt: Prompt;
	outputValidator: T;
}
export interface PreppedQuery<T extends ZodType> {
	prompt: string;
	outputValidator: T;
}

export const prepQuery = <T extends ZodType>(query: Query<T>, content: string) => {
	const prompt = query.prompt(content);
	return { prompt, outputValidator: query.outputValidator } as PreppedQuery<T>;
};

// Prompt for translating a Korean sentence to English

const translationPrompt: Prompt = (content: string) => `Translate the following text to English within <output> tags: 

${wrapTags('input', content)}

`;
export const translationQuery = {
	prompt: translationPrompt,
	outputValidator: createTagValidator('output'),
};

const classificationValues = ['HOW_TO_GET_TO_STATION', 'REPEAT_LAST_RESPONSE', 'OTHER'] as const;
// Prompt to classify the type of question. Options: 1. Ask how to get to a subway station 2. Ask to repeat the last response 3. Anything else
const classificationPrompt: Prompt = (
	content: string
) => `Classify the following text into one of the following categories within <output> tags:

1. Ask how to get to a subway station (HOW_TO_GET_TO_STATION)
2. Ask to repeat the last response (REPEAT_LAST_RESPONSE)
3. Anything else (OTHER)

${wrapTags('input', content)}

`;
export const classificationQuery = {
	prompt: classificationPrompt,
	outputValidator: createTagValidator('output').superRefine((val, ctx): val is (typeof classificationValues)[number] => {
		const parseResult = z.enum(['HOW_TO_GET_TO_STATION', 'REPEAT_LAST_RESPONSE', 'OTHER']).safeParse(val);
		if (parseResult.success === false) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Invalid question classification: Expected one of ${classificationValues.join(', ')}, got ${val}`,
			});
		}
		return z.NEVER;
	}),
};
