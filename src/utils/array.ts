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
