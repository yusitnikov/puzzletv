export const lazy = <TResult>(func: () => TResult) => {
    let cache: TResult | null = null;

    return (): TResult => {
        if (cache === null) {
            cache = func();
        }
        return cache;
    };
};
