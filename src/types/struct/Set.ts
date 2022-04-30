export class Set<ItemT> {
    private cache: Record<string, any> = {};

    constructor(
        public readonly items: ItemT[] = [],
        private comparer: (item1: ItemT, item2: ItemT) => boolean = (item1, item2) => JSON.stringify(item1) === JSON.stringify(item2),
        private cloner: (item: ItemT) => ItemT = item => JSON.parse(JSON.stringify(item))
    ) {
    }

    public get size() {
        return this.items.length;
    }

    public contains(item: ItemT) {
        return this.items.some(i => this.comparer(i, item));
    }

    public equals(set: Set<ItemT>) {
        return this.size === set.size && this.items.every(item => set.contains(item));
    }

    public at(index: number) {
        return this.items[index < 0 ? this.size + index : index];
    }

    public first() {
        return this.items[0];
    }

    public last() {
        return this.items.length ? this.items[this.items.length - 1] : undefined;
    }

    public cached<T>(key: string, getter: () => T): T {
        if (!(key in this.cache)) {
            this.cache[key] = getter();
        }

        return this.cache[key];
    }

    public sorted() {
        return this.cached("sorted", () => this.set([...this.items].sort()));
    }

    public set(items: ItemT[]) {
        return new Set(items, this.comparer);
    }

    public clear() {
        return this.set([]);
    }

    public clone() {
        return this.set(this.items.map(this.cloner));
    }

    public remove(item: ItemT) {
        return this.set(this.items.filter(i => !this.comparer(i, item)));
    }

    public add(item: ItemT) {
        return this.set([...this.remove(item).items, item]);
    }

    public toggle(item: ItemT, forcedEnable?: boolean) {
        const enable = forcedEnable ?? !this.contains(item);
        return enable ? this.add(item) : this.remove(item);
    }
}
