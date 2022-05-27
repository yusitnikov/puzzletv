type Comparer<ItemT> = (item1: ItemT, item2: ItemT) => boolean;
type Cloner<ItemT> = (item: ItemT) => ItemT;
type Serializer<ItemT> = (item: ItemT) => any;
type Unserializer<ItemT> = (object: any) => ItemT;

const defaultComparer: Comparer<any> = (item1, item2) => JSON.stringify(item1) === JSON.stringify(item2);
const defaultCloner: Cloner<any> = item => JSON.parse(JSON.stringify(item));
const defaultSerializer: Serializer<any> = item => item;
const defaultUnserializer: Unserializer<any> = item => item;

export class Set<ItemT> {
    private cache: Record<string, any> = {};

    constructor(
        public readonly items: ItemT[] = [],
        private comparer: Comparer<ItemT> = defaultComparer,
        private cloner: Cloner<ItemT> = defaultCloner,
        private serializer: Serializer<ItemT> = defaultSerializer
    ) {
    }

    public get size() {
        return this.items.length;
    }

    public contains(item: ItemT) {
        return this.items.some(i => this.comparer(i, item));
    }

    public containsOneOf(items: ItemT[]) {
        return items.some(item => this.contains(item));
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
        return new Set(items, this.comparer, this.cloner, this.serializer);
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

    public toggleAll(items: ItemT[], forcedEnable?: boolean) {
        let result: Set<ItemT> = this;
        for (const item of items) {
            result = result.toggle(item, forcedEnable);
        }
        return result;
    }

    public serialize() {
        return this.items.map(this.serializer);
    }

    public static merge<ItemT>(...sets: Set<ItemT>[]): Set<ItemT> {
        if (!sets.length) {
            return new Set();
        }

        return sets.reduce((previousValue, currentValue) => previousValue.toggleAll(currentValue.items, true));
    }

    public static unserialize<ItemT>(
        value: any,
        comparer: Comparer<ItemT> = defaultComparer,
        cloner: Cloner<ItemT> = defaultCloner,
        serializer: Serializer<ItemT> = defaultSerializer,
        unserializer: Unserializer<ItemT> = defaultUnserializer
    ) {
        return new Set(
            (value as any[]).map(unserializer),
            comparer,
            cloner,
            serializer
        );
    }
}
