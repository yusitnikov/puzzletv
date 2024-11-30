import { SudokuTypeManager } from "./SudokuTypeManager";
import { PuzzleDefinition } from "./PuzzleDefinition";
import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleContext } from "./PuzzleContext";

const splitEx = <T1, T2>(value: T1 & T2, defaults: T2, useDefaults = false): { base: T1; ex: T2 } => {
    const base = { ...value };
    const ex = {} as T2;

    for (const field in defaults) {
        if (field in (base as any)) {
            ex[field] = base[field] as T2[typeof field];
            delete base[field];
        }
        if (useDefaults) {
            ex[field] ??= defaults[field];
        }
    }

    return { base, ex };
};

// region Field state
export type ReplacePuzzleEx<T extends AnyPTM, PuzzleEx> = Omit<T, "puzzleEx"> & { puzzleEx: PuzzleEx };
// noinspection JSUnusedGlobalSymbols
export type AddPuzzleEx<T extends AnyPTM, PuzzleEx> = ReplacePuzzleEx<T, T["puzzleEx"] & PuzzleEx>;
// endregion

// region Field state
export type ReplaceFieldStateEx<T extends AnyPTM, FieldStateEx> = Omit<T, "fieldStateEx"> & {
    fieldStateEx: FieldStateEx;
};
export type AddFieldStateEx<T extends AnyPTM, FieldStateEx> = ReplaceFieldStateEx<T, T["fieldStateEx"] & FieldStateEx>;

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
    }: {
        initialFieldStateExtension:
            | FieldStateEx
            | ((puzzle?: PuzzleDefinition<ReplaceFieldStateEx<T, FieldStateEx>>) => FieldStateEx);
    } & Pick<
        SudokuTypeManager<ReplaceFieldStateEx<T, FieldStateEx>>,
        | "serializeFieldStateExtension"
        | "unserializeFieldStateExtension"
        | "areFieldStateExtensionsEqual"
        | "cloneFieldStateExtension"
    >,
): SudokuTypeManager<AddFieldStateEx<T, FieldStateEx>> => {
    type ExT = ReplaceFieldStateEx<T, FieldStateEx>;
    type T2 = AddFieldStateEx<T, FieldStateEx>;

    const simpleInitialFieldStateExtension2 =
        typeof initialFieldStateExtension2 === "function"
            ? (initialFieldStateExtension2 as () => FieldStateEx)()
            : (initialFieldStateExtension2 as FieldStateEx);

    function splitFieldStateEx(value: T2["fieldStateEx"]): { base: T["fieldStateEx"]; ex: FieldStateEx };
    function splitFieldStateEx(
        value: Partial<T2["fieldStateEx"]>,
        useDefaults?: boolean,
    ): { base: Partial<T["fieldStateEx"]>; ex: Partial<FieldStateEx> };
    function splitFieldStateEx(
        value: Partial<T2["fieldStateEx"]>,
        useDefaults = false,
    ): { base: Partial<T["fieldStateEx"]>; ex: Partial<FieldStateEx> } {
        return splitEx(value, simpleInitialFieldStateExtension2 as Partial<FieldStateEx>, useDefaults);
    }

    return {
        ...(baseTypeManager as unknown as SudokuTypeManager<T2>),

        initialFieldStateExtension: (puzzle: PuzzleDefinition<T2>): T2["fieldStateEx"] => ({
            ...(typeof initialFieldStateExtension === "function"
                ? (initialFieldStateExtension as (puzzle: PuzzleDefinition<T>) => T["fieldStateEx"])(
                      puzzle as unknown as PuzzleDefinition<T>,
                  )
                : (initialFieldStateExtension as T["fieldStateEx"])),
            ...(typeof initialFieldStateExtension2 === "function"
                ? (initialFieldStateExtension2 as (puzzle: PuzzleDefinition<ExT>) => FieldStateEx)(
                      puzzle as unknown as PuzzleDefinition<ExT>,
                  )
                : (initialFieldStateExtension2 as FieldStateEx)),
        }),
        serializeFieldStateExtension(data: Partial<T2["fieldStateEx"]>): any {
            const { base, ex } = splitFieldStateEx(data);

            return {
                ...(serializeFieldStateExtension?.(base) ?? base),
                ...(serializeFieldStateExtension2?.(ex) ?? ex),
            };
        },
        unserializeFieldStateExtension(data: any): Partial<T2["fieldStateEx"]> {
            const { base, ex } = splitFieldStateEx(data, true);

            return {
                ...(unserializeFieldStateExtension?.(base) ?? base),
                ...(unserializeFieldStateExtension2?.(ex) ?? ex),
            };
        },
        areFieldStateExtensionsEqual(a: T2["fieldStateEx"], b: T2["fieldStateEx"]): boolean {
            const { base: baseA, ex: exA } = splitFieldStateEx(a);
            const { base: baseB, ex: exB } = splitFieldStateEx(b);

            return areFieldStateExtensionsEqual(baseA, baseB) && areFieldStateExtensionsEqual2(exA, exB);
        },
        cloneFieldStateExtension(data: T2["fieldStateEx"]): T2["fieldStateEx"] {
            const { base, ex } = splitFieldStateEx(data);

            return {
                ...cloneFieldStateExtension(base),
                ...cloneFieldStateExtension2(ex),
            };
        },
    };
};
// endregion

// region Game state
export type ReplaceGameStateEx<T extends AnyPTM, GameStateEx, ProcessedGameStateEx> = Omit<
    T,
    "stateEx" | "processedStateEx"
> & { stateEx: GameStateEx; processedStateEx: ProcessedGameStateEx };
export type AddGameStateEx<T extends AnyPTM, GameStateEx, ProcessedGameStateEx> = ReplaceGameStateEx<
    T,
    T["stateEx"] & GameStateEx,
    T["processedStateEx"] & ProcessedGameStateEx
>;

export const addGameStateExToSudokuManager = <T extends AnyPTM, GameStateEx, ProcessedGameStateEx>(
    {
        initialGameStateExtension,
        serializeGameState,
        unserializeGameState,
        useProcessedGameStateExtension,
        getProcessedGameStateExtension,
        ...baseTypeManager
    }: SudokuTypeManager<T>,
    {
        initialGameStateExtension: initialGameStateExtension2,
        serializeGameState: serializeGameState2,
        unserializeGameState: unserializeGameState2,
        useProcessedGameStateExtension: useProcessedGameStateExtension2,
        getProcessedGameStateExtension: getProcessedGameStateExtension2,
    }: {
        initialGameStateExtension:
            | GameStateEx
            | ((puzzle?: PuzzleDefinition<ReplaceGameStateEx<T, GameStateEx, ProcessedGameStateEx>>) => GameStateEx);
    } & Partial<
        Pick<
            SudokuTypeManager<ReplaceGameStateEx<T, GameStateEx, ProcessedGameStateEx>>,
            | "serializeGameState"
            | "unserializeGameState"
            | "useProcessedGameStateExtension"
            | "getProcessedGameStateExtension"
        >
    >,
): SudokuTypeManager<AddGameStateEx<T, GameStateEx, ProcessedGameStateEx>> => {
    type ExT = ReplaceGameStateEx<T, GameStateEx, ProcessedGameStateEx>;
    type T2 = AddGameStateEx<T, GameStateEx, ProcessedGameStateEx>;

    const simpleInitialGameStateExtension2 =
        typeof initialGameStateExtension2 === "function"
            ? (initialGameStateExtension2 as () => GameStateEx)()
            : (initialGameStateExtension2 as GameStateEx);

    function splitGameStateEx(value: T2["stateEx"]): { base: T["stateEx"]; ex: GameStateEx };
    function splitGameStateEx(
        value: Partial<T2["stateEx"]>,
        useDefaults?: boolean,
    ): { base: Partial<T["stateEx"]>; ex: Partial<GameStateEx> };
    function splitGameStateEx(
        value: Partial<T2["stateEx"]>,
        useDefaults = false,
    ): { base: Partial<T["stateEx"]>; ex: Partial<GameStateEx> } {
        return splitEx(value, simpleInitialGameStateExtension2 as Partial<GameStateEx>, useDefaults);
    }

    return {
        ...(baseTypeManager as unknown as SudokuTypeManager<T2>),

        initialGameStateExtension: (puzzle: PuzzleDefinition<T2>): T2["stateEx"] => {
            return {
                ...(typeof initialGameStateExtension === "function"
                    ? (initialGameStateExtension as (puzzle: PuzzleDefinition<T>) => T["stateEx"])(
                          puzzle as unknown as PuzzleDefinition<T>,
                      )
                    : (initialGameStateExtension as T["stateEx"])),
                ...(typeof initialGameStateExtension2 === "function"
                    ? (initialGameStateExtension2 as (puzzle: PuzzleDefinition<ExT>) => GameStateEx)(
                          puzzle as unknown as PuzzleDefinition<ExT>,
                      )
                    : (initialGameStateExtension2 as GameStateEx)),
            };
        },

        serializeGameState(state: Partial<T2["stateEx"]>): any {
            const { base, ex } = splitGameStateEx(state);

            return {
                ...(serializeGameState?.(base) ?? base),
                ...(serializeGameState2?.(ex) ?? ex),
            };
        },

        unserializeGameState(state: any): Partial<T2["stateEx"]> {
            const { base, ex } = splitGameStateEx(state, true);

            return {
                ...(unserializeGameState?.(base) ?? base),
                ...(unserializeGameState2?.(ex) ?? ex),
            };
        },

        useProcessedGameStateExtension(context: PuzzleContext<T2>): T2["processedStateEx"] {
            return {
                // eslint-disable-next-line react-hooks/rules-of-hooks
                ...(useProcessedGameStateExtension?.(context as unknown as PuzzleContext<T>) as T["processedStateEx"]),
                // eslint-disable-next-line react-hooks/rules-of-hooks
                ...(useProcessedGameStateExtension2?.(
                    context as unknown as PuzzleContext<ExT>,
                ) as ProcessedGameStateEx),
            };
        },

        getProcessedGameStateExtension(context: PuzzleContext<T2>): T2["processedStateEx"] {
            return {
                ...(getProcessedGameStateExtension?.(context as unknown as PuzzleContext<T>) as T["processedStateEx"]),
                ...(getProcessedGameStateExtension2?.(
                    context as unknown as PuzzleContext<ExT>,
                ) as ProcessedGameStateEx),
            };
        },
    };
};
// endregion
