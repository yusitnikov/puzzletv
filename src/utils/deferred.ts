export class Deferred<T = void> {
    public readonly promise: Promise<T>;
    private _resolve: (value: T) => void = () => {};
    private _reject: (reason: unknown) => void = () => {};

    constructor() {
        this.promise = new Promise<T>((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
        })
    }

    public resolve(value: T) {
        this._resolve(value);
    }

    public reject(reason: unknown) {
        this._reject(reason);
    }
}
