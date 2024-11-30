import { loop } from "./math";

export const splitArrayIntoChunks = <T>(array: T[], chunkSize: number): T[][] => {
    const result: T[][] = [];

    for (let offset = 0; offset < array.length; offset += chunkSize) {
        result.push(array.slice(offset, offset + chunkSize));
    }

    return result;
};

export const joinListSemantically = (list: string[], lastSeparator: string) => {
    if (list.length < 2) {
        return list.join(", ");
    }

    return list.slice(0, -1).join(", ") + " " + lastSeparator + " " + list[list.length - 1];
};

export const areSameArrays = <T>(a1: T[], a2: T[]) =>
    a1.length === a2.length && a1.every((value, index) => value === a2[index]);

export const incrementArrayItemByIndex = <T>(array: T[], currentIndex: number, increment = 1) =>
    array[loop(currentIndex + increment, array.length)];

export const incrementArrayItem = <T>(array: T[], currentItem: T | ((item: T) => boolean), increment = 1) =>
    incrementArrayItemByIndex(
        array,
        typeof currentItem === "function"
            ? array.findIndex(currentItem as (item: T) => boolean)
            : array.indexOf(currentItem),
        increment,
    );

export const getReverseIndexMap = (indexes: number[]) => {
    const result = Array(indexes.length);

    for (const [index1, index2] of indexes.entries()) {
        result[index2] = index1;
    }

    return result;
};
