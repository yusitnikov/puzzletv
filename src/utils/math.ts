export const loop = (value: number, limit: number) => (limit === 0 ? 0 : ((value % limit) + limit) % limit);

export const roundToStep = (value: number, step?: number) => (step ? Math.round(value / step) * step : value);

export const sum = (values: number[]) => {
    let sum = 0;
    for (const value of values) {
        sum += value;
    }
    return sum;
};

export const average = (values: number[]) => (values.length ? sum(values) / values.length : 0);

export const averageMode = (values: number[]) => {
    const { length } = values;
    if (length === 0) return 0;

    const middle = Math.floor(length / 2);
    values = [...values].sort();
    return length % 2 ? values[middle] : (values[middle - 1] + values[middle]) / 2;
};
