import {SudokuTypeManager} from "./SudokuTypeManager";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {AnyPTM} from "./PuzzleTypeMap";

type ReplaceFieldStateEx<T extends AnyPTM, FieldStateEx> = Omit<T, "fieldStateEx"> & {fieldStateEx: FieldStateEx};
type AddFieldStateEx<T extends AnyPTM, FieldStateEx> = ReplaceFieldStateEx<T, T["fieldStateEx"] & FieldStateEx>;

export const addFieldStateExToSudokuManager = <T extends AnyPTM, FieldStateEx>(
    {
        initialFieldStateExtension,
        serializeFieldStateExtension,
        unserializeFieldStateExtension,
        areFieldStateExtensionsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b),
        cloneFieldStateExtension = (extension) => JSON.parse(JSON.stringify(extension)),
        ...baseTypeManager
    }: SudokuTypeManager<T>,
    {
        initialFieldStateExtension: initialFieldStateExtension2,
        serializeFieldStateExtension: serializeFieldStateExtension2,
        unserializeFieldStateExtension: unserializeFieldStateExtension2,
        areFieldStateExtensionsEqual: areFieldStateExtensionsEqual2 = (a, b) => JSON.stringify(a) === JSON.stringify(b),
        cloneFieldStateExtension: cloneFieldStateExtension2 = (extension) => JSON.parse(JSON.stringify(extension)),
    }: {initialFieldStateExtension: FieldStateEx | ((puzzle?: PuzzleDefinition<ReplaceFieldStateEx<T, FieldStateEx>>) => FieldStateEx)} & Pick<
        SudokuTypeManager<ReplaceFieldStateEx<T, FieldStateEx>>,
        "serializeFieldStateExtension" | "unserializeFieldStateExtension" | "areFieldStateExtensionsEqual" | "cloneFieldStateExtension"
    >,
): SudokuTypeManager<AddFieldStateEx<T, FieldStateEx>> => {
    type ExT = ReplaceFieldStateEx<T, FieldStateEx>;
    type T2 = AddFieldStateEx<T, FieldStateEx>;

    const simpleInitialFieldStateExtension2 = typeof initialFieldStateExtension2 === "function"
        ? (initialFieldStateExtension2 as (() => FieldStateEx))()
        : initialFieldStateExtension2 as FieldStateEx;
    const fields = Object.keys(simpleInitialFieldStateExtension2) as (keyof FieldStateEx)[];

    function splitFieldStateEx(value: T2["fieldStateEx"]): {base: T["fieldStateEx"], ex: FieldStateEx};
    function splitFieldStateEx(value: Partial<T2["fieldStateEx"]>, useDefaults?: boolean): {base: Partial<T["fieldStateEx"]>, ex: Partial<FieldStateEx>};
    function splitFieldStateEx(value: Partial<T2["fieldStateEx"]>, useDefaults = false): {base: T["fieldStateEx"], ex: FieldStateEx} {
        const base = {...value};
        const ex = {} as FieldStateEx;

        for (const field of fields!) {
            if (field in base) {
                ex[field] = base[field] as FieldStateEx[typeof field];
                delete base[field];
            }
            if (useDefaults) {
                ex[field] ??= simpleInitialFieldStateExtension2[field];
            }
        }

        return {base, ex};
    }

    return ({
        ...baseTypeManager as unknown as SudokuTypeManager<T2>,

        initialFieldStateExtension: (puzzle: PuzzleDefinition<T2>): T2["fieldStateEx"] => ({
            ...(
                typeof initialFieldStateExtension === "function"
                    ? (initialFieldStateExtension as ((puzzle: PuzzleDefinition<T>) => T["fieldStateEx"]))(puzzle as unknown as PuzzleDefinition<T>)
                    : initialFieldStateExtension as T["fieldStateEx"]
            ),
            ...(
                typeof initialFieldStateExtension2 === "function"
                    ? (initialFieldStateExtension2 as ((puzzle: PuzzleDefinition<ExT>) => FieldStateEx))(puzzle as unknown as PuzzleDefinition<ExT>)
                    : initialFieldStateExtension2 as FieldStateEx
            ),
        }),
        serializeFieldStateExtension(data: Partial<T2["fieldStateEx"]>): any {
            const {base, ex} = splitFieldStateEx(data);

            return {
                ...(serializeFieldStateExtension?.(base) ?? base),
                ...(serializeFieldStateExtension2?.(ex) ?? ex),
            };
        },
        unserializeFieldStateExtension(data: any): Partial<T2["fieldStateEx"]> {
            const {base, ex} = splitFieldStateEx(data, true);

            return {
                ...(unserializeFieldStateExtension?.(base) ?? base),
                ...(unserializeFieldStateExtension2?.(ex) ?? ex),
            };
        },
        areFieldStateExtensionsEqual(a: T2["fieldStateEx"], b: T2["fieldStateEx"]): boolean {
            const {base: baseA, ex: exA} = splitFieldStateEx(a);
            const {base: baseB, ex: exB} = splitFieldStateEx(b);

            return areFieldStateExtensionsEqual(baseA, baseB) && areFieldStateExtensionsEqual2(exA, exB);
        },
        cloneFieldStateExtension(data: T2["fieldStateEx"]): T2["fieldStateEx"] {
            const {base, ex} = splitFieldStateEx(data);

            return {
                ...cloneFieldStateExtension(base),
                ...cloneFieldStateExtension2(ex),
            };
        },
    });
};
