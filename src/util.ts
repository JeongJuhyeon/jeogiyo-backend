import { z } from 'zod';

export const stringContainsKorean = (str: string): boolean => {
	const korean = /[\u3131-\uD79D]/;
	return korean.test(str);
};

export function indent(str: string, level: number = 1): string {
	const indent = ' '.repeat(level * 2);
	return str.replace(/^/gm, indent);
}

export const wrapTags = (tag: string, text: string, indentText = false) =>
	`<${tag}>\n${indentText ? indent(text) : text}\n</${tag.split(' ')[0]}>`;

export const tagsRegex = (tag: string) => new RegExp(`<${tag}>(.*?)</${tag}>`, 's');

export const createTagValidator = (tag: string) => {
	const regex = tagsRegex(tag);
	return z
		.string()
		.refine(
			(val) => regex.test(val),
			(s) => ({
				message: `Expected a string that contains a single <${tag}>...</${tag}> tag, got ${s}`,
			})
		)
		.transform((val) => val.match(regex)![1].trim());
};

export function throwInline(message: string): never {
	throw new Error(message);
}

export function contentIsStation(content: string): boolean {
	// Korean: No whitespace and ends in "역"
	if (!content.includes(' ') && content.endsWith('역')) {
		return true;
	}
	// English: Two words, first word has a capital, second word is "Station"
	if (content.match(/^[A-Z][a-z]+ [sS]tation$/)) {
		return true;
	}
	return false;
}
