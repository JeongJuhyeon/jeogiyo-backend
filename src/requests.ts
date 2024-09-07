import { z } from 'zod';

export const AskRequest = z.object({
	spokenText: z.string(),
	coordinates: z.object({
		latitude: z.number(),
		longitude: z.number(),
	}),
});

export enum QuestionType {
	UNKNOWN = 'UNKNOWN',
	TO_DESTINATION = 'TO_DESTINATION',
	REPEAT_LAST_RESPONSE = 'REPEAT_LAST_RESPONSE',
}

const ToDestinationResponseData = z.object({
	direction_next_station: z.string(),
	instructions: z.array(z.string()),
});
const RepeatLastResponseData = z.object({});
const UnknownResponseData = z.object({});

export type ToDestinationResponseData = z.infer<typeof ToDestinationResponseData>;

const BaseResponse = z.object({
	success: z.boolean(),
});
export const AskResponseData = z.discriminatedUnion('questionType', [
	z.object({
		questionType: z.literal(QuestionType.TO_DESTINATION),
		data: ToDestinationResponseData,
	}),
	z.object({
		questionType: z.literal(QuestionType.REPEAT_LAST_RESPONSE),
		data: RepeatLastResponseData,
	}),
	z.object({
		questionType: z.literal(QuestionType.UNKNOWN),
		data: UnknownResponseData,
	}),
]);
export type AskResponseData = z.infer<typeof AskResponseData>;

export const AskResponse = AskResponseData.and(BaseResponse);
export type AskResponse = z.infer<typeof AskResponse>;
