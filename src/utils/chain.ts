export class Chain {
    private promise = Promise.resolve();

    public then(callback: () => void | PromiseLike<void>) {
        this.promise = this.promise.then(callback).catch((reason) => console.error(reason));
        return this;
    }
}
