type Comparer<ItemT> = (item1: ItemT, item2: ItemT) => boolean;
type Cloner<ItemT> = (item: ItemT) => ItemT;
type Serializer<ItemT> = (item: ItemT) => any;
type Hasher<ItemT> = (item: ItemT) => string;

const defaultComparer: Comparer<any> = (item1, item2) =>
    typeof item1 === "object" ? JSON.stringify(item1) === JSON.stringify(item2) : item1 === item2;
const defaultCloner: Cloner<any> = (item) => (typeof item === "object" ? JSON.parse(JSON.stringify(item)) : item);
const defaultSerializer: Serializer<any> = (item) => item;
const defaultHasher =
    (serializer: Serializer<any>): Hasher<any> =>
    (item) =>
        serializer(item).toString();

export interface SetInterface<ItemT, AlternativeItemsArrayT = never> {
    readonly items: ItemT[];
    readonly size: number;

    contains(item: ItemT): boolean;

    containsOneOf(items: ItemT[]): boolean;

    find(item: ItemT): ItemT | undefined;

    equals(set: SetInterface<ItemT>): boolean;

    at(index: number): ItemT | undefined;

    first(): ItemT | undefined;

    last(): ItemT | undefined;

    cached<T>(key: string, getter: () => T): T;

    sorted(): this;

    set(items: ItemT[] | AlternativeItemsArrayT): this;

    clear(): this;

    clone(): this;

    remove(item: ItemT): this;

    bulkRemove(items: ItemT[]): this;

    add(item: ItemT): this;

    bulkAdd(items: ItemT[]): this;

    toggle(item: ItemT, forcedEnable?: boolean): this;

    toggleAll(items: ItemT[], forcedEnable?: boolean): this;

    filter(callback: (item: ItemT) => boolean): this;

    map(callback: (item: ItemT) => ItemT): this;

    serialize(): any;
}

export abstract class Set<ItemT, AlternativeItemsArrayT = never>
    implements SetInterface<ItemT, AlternativeItemsArrayT>
{
    private cache: Record<string, any> = {};

    protected constructor(
        public readonly cloner: Cloner<ItemT> = defaultCloner,
        public readonly comparer: Comparer<ItemT> = defaultComparer,
        public readonly serializer: Serializer<ItemT> = defaultSerializer,
    ) {}

    abstract get items(): ItemT[];

    get size() {
        return this.items.length;
    }

    abstract contains(item: ItemT): boolean;

    abstract find(item: ItemT): ItemT | undefined;

    abstract set(items: ItemT[] | AlternativeItemsArrayT): this;

    abstract remove(item: ItemT): this;

    abstract bulkRemove(items: ItemT[]): this;

    containsOneOf(items: ItemT[]) {
        return items.some((item) => this.contains(item));
    }

    equals(set: SetInterface<ItemT>) {
        return (
            this.size === set.size &&
            this.items.every((item) => {
                const matchingItem = set.find(item);
                return matchingItem !== undefined && this.comparer(item, matchingItem);
            })
        );
    }

    at(index: number) {
        return this.items[index < 0 ? this.size + index : index];
    }

    first() {
        return this.at(0);
    }

    last() {
        return this.at(-1);
    }

    cached<T>(key: string, getter: () => T): T {
        if (!(key in this.cache)) {
            this.cache[key] = getter();
        }

        return this.cache[key];
    }

    sorted() {
        return this.cached("sorted", () => this.set([...this.items].sort()));
    }

    clear() {
        return this.set([]);
    }

    clone() {
        return this.map(this.cloner);
    }

    add(item: ItemT) {
        return this.set([...this.remove(item).items, item]);
    }

    bulkAdd(items: ItemT[]) {
        return this.set([...this.bulkRemove(items).items, ...items]);
    }

    toggle(item: ItemT, forcedEnable?: boolean) {
        const enable = forcedEnable ?? !this.contains(item);
        return enable ? this.add(item) : this.remove(item);
    }

    toggleAll(items: ItemT[], forcedEnable?: boolean) {
        if (forcedEnable === true) {
            return this.bulkAdd(items);
        }

        if (forcedEnable === false) {
            return this.bulkRemove(items);
        }

        let result = this;
        for (const item of items) {
            result = result.toggle(item, forcedEnable);
        }
        return result;
    }

    filter(callback: (item: ItemT) => boolean): this {
        return this.set(this.items.filter(callback));
    }

    map(callback: (item: ItemT) => ItemT): this {
        return this.set(this.items.map(callback));
    }

    serialize() {
        return this.items.map(this.serializer);
    }

    public static merge<ItemT>(...sets: SetInterface<ItemT>[]): SetInterface<ItemT> {
        if (!sets.length) {
            return new HashSet<ItemT>();
        }

        return sets.reduce((previousValue, currentValue) => previousValue.bulkAdd(currentValue.items));
    }
}

export class HashSet<ItemT>
    extends Set<ItemT, Record<string, ItemT>>
    implements SetInterface<ItemT, Record<string, ItemT>>
{
    public readonly hasher: Hasher<ItemT>;

    private _items: ItemT[] | undefined;
    private readonly _map: Record<string, ItemT> = {};

    constructor(
        items: ItemT[] | Record<string, ItemT> = [],
        {
            cloner = defaultCloner,
            serializer = defaultSerializer,
            hasher = defaultHasher(serializer),
            comparer = (item1, item2) => hasher(item1) === hasher(item2),
        }: {
            cloner?: Cloner<ItemT>;
            serializer?: Serializer<ItemT>;
            hasher?: Hasher<ItemT>;
            comparer?: Comparer<ItemT>;
        } = {},
    ) {
        super(cloner, comparer, serializer);

        this.hasher = hasher;

        if (items instanceof Array) {
            let hasDuplicates = false;
            for (const item of items) {
                const key = this.hasher(item);
                if (key in this._map) {
                    hasDuplicates = true;
                }
                this._map[key] = item;
            }
            if (!hasDuplicates) {
                this._items = items;
            }
        } else {
            this._map = items;
        }
    }

    get items() {
        return (this._items = this._items ?? Object.values(this._map));
    }

    contains(item: ItemT) {
        return this.hasher(item) in this._map;
    }

    find(item: ItemT): ItemT | undefined {
        return this._map[this.hasher(item)];
    }

    set(items: ItemT[] | Record<string, ItemT>): this {
        return new HashSet(items, this) as this;
    }

    clone() {
        return this.set(Object.fromEntries(Object.entries(this._map).map(([key, value]) => [key, this.cloner(value)])));
    }

    remove(item: ItemT) {
        const hash = this.hasher(item);

        const map = { ...this._map };
        if (hash in map) {
            delete map[hash];
        }

        return this.set(map);
    }

    bulkRemove(items: ItemT[]) {
        const map = { ...this._map };

        for (const item of items) {
            const hash = this.hasher(item);
            if (hash in map) {
                delete map[hash];
            }
        }

        return this.set(map);
    }

    add(item: ItemT) {
        const hash = this.hasher(item);

        const map = { ...this._map };
        if (hash in map) {
            delete map[hash];
        }
        map[hash] = item;

        return this.set(map);
    }

    bulkAdd(items: ItemT[]) {
        const map = { ...this._map };

        for (const item of items) {
            const hash = this.hasher(item);
            if (hash in map) {
                delete map[hash];
            }
            map[hash] = item;
        }

        return this.set(map);
    }

    filter(callback: (item: ItemT) => boolean): this {
        return this.set(Object.fromEntries(Object.entries(this._map).filter(([, item]) => callback(item))));
    }
}

export class PlainValueSet<ItemT extends string | number> extends HashSet<ItemT> {
    static unserialize<ItemT extends string | number>(items: any) {
        return new PlainValueSet<ItemT>(items as ItemT[]);
    }
}

export const setComparer = <T>(a: SetInterface<T>, b: SetInterface<T>) => a.equals(b);
