export type MergeStateAction<S> = Partial<S> | ((prevState: S) => Partial<S>);
