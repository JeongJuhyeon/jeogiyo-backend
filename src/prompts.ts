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

const translationPrompt: Prompt = (
	content: string
) => `Translate the following text to English within <output> tags in the context of public transit navigation: 

${wrapTags('input', content.split('?')[0] + '?')}

`;
export const translationQuery = {
	prompt: translationPrompt,
	outputValidator: createTagValidator('output'),
};
const classificationValues = ['HOW_TO_GET_TO_STATION', 'REPEAT_LAST_RESPONSE', 'CONFIRM_CURRENT_DIRECTION', 'OTHER'] as const;

// Prompt to classify the type of question. Options: 1. Ask how to get to a subway station 2. Ask to repeat the last response 3. Anything else
const classificationPrompt: Prompt = (
	content: string
) => `Classify the following text into one of the following categories within <output> tags:

1. Ask if they're currently going the right way (CONFIRM_CURRENT_DIRECTION)
2. Ask how to get to a subway station (HOW_TO_GET_TO_STATION)
3. Ask to repeat the last response (REPEAT_LAST_RESPONSE)
4. Anything else (OTHER)

${wrapTags('input', content)}

`;

export const classificationQuery = {
	prompt: classificationPrompt,
	outputValidator: createTagValidator('output').superRefine((val, ctx): val is (typeof classificationValues)[number] => {
		const parseResult = z.enum(classificationValues).safeParse(val);
		if (parseResult.success === false) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: `Invalid question classification: Expected one of ${classificationValues.join(', ')}, got ${val}`,
			});
		}
		return z.NEVER;
	}),
};

// Prompt to extract the Korean destination station from a question asking how to get to a station
const destinationPrompt: Prompt = (content: string) => `Your task is to determine the destination Seoul subway station from a piece of text.
Here are some examples:

<example>
${wrapTags('input', 'How do I get to Seoul Station?')}
${wrapTags('output', '서울역')}
</example>

<example>
${wrapTags('input', '동대문 가는 방법 알려주세요')}
${wrapTags('output', '동대문역')}
</example>

Now perform the task for the following text, putting the Korean name of the station, including 역, in <output> tags:

${wrapTags('input', content)}

`;
export const extractDestinationQuery = {
	prompt: destinationPrompt,
	outputValidator: createTagValidator('output').refine((val) => val.endsWith('역')),
};
