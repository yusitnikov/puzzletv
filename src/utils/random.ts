import {GivenDigitsMap} from "../types/sudoku/GivenDigitsMap";
import {indexes, indexesFromTo} from "./indexes";

export type RandomGenerator = () => number;

// "mulberry32" - see https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
export const createRandomGenerator = (seed: number): RandomGenerator => () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

export const getDailyRandomGeneratorSeed = () => {
    const date = new Date();

    return date.getUTCFullYear() * 10000 + date.getUTCMonth() * 100 + date.getUTCDate();
};

export const generateRandomPuzzleDigits = (fieldSize: number, regionWidth: number, randomOrSeed: RandomGenerator | number = Math.random): GivenDigitsMap<number> => {
    const random = typeof randomOrSeed === "function"
        ? randomOrSeed
        : createRandomGenerator(randomOrSeed);

    while (true) {
        const initialDigits = tryGenerateRandomPuzzleDigits(fieldSize, regionWidth, random);

        if (initialDigits !== undefined) {
            return initialDigits;
        }
    }
};

const tryGenerateRandomPuzzleDigits = (fieldSize: number, regionWidth: number, random: RandomGenerator): GivenDigitsMap<number> | undefined => {
    const regionHeight = fieldSize / regionWidth;

    const initialDigits: GivenDigitsMap<number> = {};
    const digitOptions: GivenDigitsMap<Set<number>> = {};
    for (const rowIndex of indexes(fieldSize)) {
        initialDigits[rowIndex] = {};
        digitOptions[rowIndex] = {};

        for (const columnIndex of indexes(fieldSize)) {
            digitOptions[rowIndex][columnIndex] = new Set(
                indexesFromTo(1, fieldSize, true).sort(() => random() < 0.5 ? 1 : -1)
            );
        }
    }

    const putRandomDigit = (rowIndex: number, columnIndex: number) => {
        if (initialDigits[rowIndex][columnIndex]) {
            return true;
        }

        const digit = digitOptions[rowIndex][columnIndex].values().next().value;
        if (!digit) {
            return false;
        }

        initialDigits[rowIndex][columnIndex] = digit;

        const boxRowIndex = rowIndex - rowIndex % regionHeight;
        const boxColumnIndex = columnIndex - columnIndex % regionWidth;
        for (const index of indexes(fieldSize)) {
            if (!removeCandidates(
                [
                    [rowIndex, index],
                    [index, columnIndex],
                    [boxRowIndex + index % regionHeight, boxColumnIndex + Math.floor(index / regionHeight)],
                ],
                digit
            )) {
                return false;
            }
        }

        return true;
    };

    const removeCandidates = (candidates: [rowIndex: number, columnIndex: number][], digit: number) => {
        for (const [rowIndex, columnIndex] of candidates) {
            digitOptions[rowIndex][columnIndex].delete(digit);
        }

        for (const [rowIndex, columnIndex] of candidates) {
            if (digitOptions[rowIndex][columnIndex].size <= 1) {
                return putRandomDigit(rowIndex, columnIndex);
            }
        }

        return true;
    };

    for (const boxLeft of indexes(fieldSize / regionHeight)) {
        const boxRowOffset = boxLeft * regionHeight;

        for (const boxTop of indexes(fieldSize / regionWidth)) {
            const boxColumnOffset = (boxTop + boxLeft) * regionWidth % fieldSize;

            for (const index of indexes(fieldSize)) {
                if (!putRandomDigit(
                    boxRowOffset + index % regionHeight,
                    boxColumnOffset + Math.floor(index / regionHeight)
                )) {
                    return undefined;
                }
            }
        }
    }

    return initialDigits;
};
