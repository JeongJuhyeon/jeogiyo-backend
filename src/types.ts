export interface Coordinates {
	latitude: number;
	longitude: number;
}

export interface JSONStation {
	line: string; // 03호선
	name: string;
	code: number;
	lat: number;
	lng: number;
}

export interface Station {
	line: string;
	name: string;
	code: number;
	latitude: number;
	longitude: number;
	index: number;
}

export interface LastCoordinates {
	user: Coordinates;
	destination: Coordinates;
}

export enum ConfirmDirectionResult {
	UNKNOWN = 'UNKNOWN',
	RIGHT_DIRECTION = 'RIGHT_DIRECTION',
	WRONG_DIRECTION = 'WRONG_DIRECTION',
}
