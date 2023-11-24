import {GivenDigitsMap} from "../types/sudoku/GivenDigitsMap";
import {indexes, indexesFromTo} from "./indexes";
import {Position} from "../types/layout/Position";

export type RandomGenerator = () => number;

// "mulberry32" - see https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
export const createRandomGenerator = (seed: number): RandomGenerator => () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

export const getDailyRandomGeneratorSeed = (typeSeed: number) => {
    const date = new Date();

    return typeSeed * 1000000 + date.getUTCFullYear() * 10000 + date.getUTCMonth() * 100 + date.getUTCDate();
};

export const generateRandomPuzzleDigits = (fieldSize: number, regionWidth: number, randomOrSeed: number): GivenDigitsMap<number> => {
    const random = createRandomGenerator(randomOrSeed);

    while (true) {
        const initialDigits = tryGenerateRandomPuzzleDigits(fieldSize, regionWidth, random);

        if (initialDigits !== undefined) {
            return initialDigits;
        }
    }
};

export const shuffleArray = <T>(array: T[], random: RandomGenerator): T[] => {
    const shuffled = [...array];

    for (let i = 0; i < array.length; i++) {
        const i2 = i + Math.floor((array.length - i) * random());

        // Check just for safety
        if (i2 < array.length) {
            const t = shuffled[i];
            shuffled[i] = shuffled[i2];
            shuffled[i2] = t;
        }
    }

    return shuffled;
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
                shuffleArray(indexesFromTo(1, fieldSize, true), random)
            );
        }
    }

    const putRandomDigit = (rowIndex: number, columnIndex: number): boolean => {
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

        const candidatesToRemove: Position[] = indexes(fieldSize).flatMap(index => [
            {
                top: rowIndex,
                left: index,
            },
            {
                top: index,
                left: columnIndex,
            },
            {
                top: boxRowIndex + index % regionHeight,
                left: boxColumnIndex + Math.floor(index / regionHeight),
            },
        ]);

        for (const {top, left} of candidatesToRemove) {
            digitOptions[top][left].delete(digit);
        }

        for (const {top, left} of candidatesToRemove) {
            if (digitOptions[top][left].size <= 1) {
                return putRandomDigit(top, left);
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
