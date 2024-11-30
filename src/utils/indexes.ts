export const indexes = (n: number, inclusive = false) =>
    Array(n + (inclusive ? 1 : 0))
        .fill(0)
        .map((_, index) => index);

export const indexesFromTo = (from: number, to: number, inclusive = false) =>
    indexes(to - from, inclusive).map((i) => from + i);
