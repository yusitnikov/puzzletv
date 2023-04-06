export const loop = (value: number, limit: number) => limit === 0 ? 0 : (value % limit + limit) % limit;

export const sum = (values: number[]) => {
    let sum = 0;
    for (const value of values) {
        sum += value;
    }
    return sum;
};

export const average = (values: number[]) => values.length ? sum(values) / values.length : 0;
