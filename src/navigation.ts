import { findNearest, getDistance } from 'geolib';
import stationsJson from '../data/stations.json';
import { ConfirmDirectionResult, Coordinates, JSONStation, LastCoordinates, Station } from './types.js';
import { extractDestination } from './llmservice.js';
import { MyEnv } from './index.js';
import { throwInline } from './util.js';
import { pick } from 'remeda';

const getStations = () =>
	(stationsJson as JSONStation[]).map((station, idx) => ({
		line: station.line,
		name: station.name.split('역')[0] + '역',
		code: station.code,
		latitude: station.lat,
		longitude: station.lng,
		index: idx,
	}));

export function findNearestStations(coordinates: Coordinates) {
	const lineThreeStations = getStations().filter((station) => station.line === '03호선');
	const closestStation = findNearest(coordinates, lineThreeStations) as unknown as Station;
	const closestStationIndex = lineThreeStations.findIndex(
		(station) => station.code === closestStation.code && station.line === closestStation.line
	);
	const stations = {
		nearest: closestStation,
		left: lineThreeStations.at(closestStationIndex - 1),
		right: lineThreeStations.at(closestStationIndex + 1),
	};
	return stations;
}

export async function findNextStation(question: string, coordinates: Coordinates, deps: { env: MyEnv }) {
	const nearestStations = findNearestStations(coordinates);
	const destinationStationName = await extractDestination(question, deps);

	const stations = getStations().filter((station) => station.line === '03호선');
	const destinationStationIndex = stations.findIndex((station) => station.name === destinationStationName);
	if (destinationStationIndex === -1) {
		throwInline(`Could not find station with name ${destinationStationName} in 3호선`);
	}
	const destinationStation = stations[destinationStationIndex];
	if (destinationStation.name === nearestStations.nearest.name) {
		return {
			directionNextStation: destinationStation.name,
			instructions: [`이미 ${destinationStation.name}입니다.`],
		};
	}

	const nextStation = destinationStation.index > nearestStations.nearest.index ? nearestStations.right! : nearestStations.left!;
	return {
		directionNextStation: nextStation.name,
		instructions: [`${nextStation.name.split('역')[0]}으로 가는 열차를 타세요.`],
		destinationCoordinates: pick(destinationStation, ['latitude', 'longitude']),
	};
}

export function storeLastcoordinates(lastCoordinates: LastCoordinates, deps: { env: MyEnv }) {
	return deps.env.COORDINATES_KV.put('lastCoordinates', JSON.stringify(lastCoordinates));
}

export async function getLastCoordinates(deps: { env: MyEnv }) {
	return JSON.parse((await deps.env.COORDINATES_KV.get('lastCoordinates')) || '{}') as LastCoordinates | {};
}

export function confirmDirection(coordinates: { previous: Coordinates; current: Coordinates; destination: Coordinates }) {
	const previous = coordinates.previous;
	const current = coordinates.current;
	const destination = coordinates.destination;

	// Check if current is closer than previous to destination using geolib
	const previousDistance = getDistance(previous, destination);
	const currentDistance = getDistance(current, destination);
	const difference = previousDistance - currentDistance;

	// Didn't move
	if (Math.abs(difference) < 350) {
		return { result: ConfirmDirectionResult.UNKNOWN, instruction: '시작 위치와 현재 위치가 너무 비슷합니다.' };
	} else if (currentDistance < previousDistance) {
		return { result: ConfirmDirectionResult.RIGHT_DIRECTION, instruction: '잘 가고 계십니다.' };
	} else {
		return { result: ConfirmDirectionResult.WRONG_DIRECTION, instruction: '잘못된 방향입니다. 얼른 내리세요.' };
	}
}
