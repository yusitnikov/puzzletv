export const loop = (value: number, limit: number) => limit === 0 ? 0 : (value % limit + limit) % limit;
