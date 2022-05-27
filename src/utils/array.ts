export const splitArrayIntoChunks = <T>(array: T[], chunkSize: number): T[][] => {
    const result: T[][] = [];

    for (let offset = 0; offset < array.length; offset += chunkSize) {
        result.push(array.slice(offset, offset + chunkSize));
    }

    return result;
};
