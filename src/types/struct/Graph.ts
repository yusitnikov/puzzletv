export type Graph<Key extends string | number | symbol, Value = boolean> = Partial<
    Record<Key, Partial<Record<Key, Value>>>
>;
