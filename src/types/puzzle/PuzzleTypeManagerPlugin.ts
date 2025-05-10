import { PuzzleTypeManager } from "./PuzzleTypeManager";
import { PuzzleDefinition } from "./PuzzleDefinition";
import { AnyPTM } from "./PuzzleTypeMap";

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
export type ReplaceGridStateEx<T extends AnyPTM, GridStateEx> = Omit<T, "gridStateEx"> & {
    gridStateEx: GridStateEx;
};
export type AddGridStateEx<T extends AnyPTM, GridStateEx> = ReplaceGridStateEx<T, T["gridStateEx"] & GridStateEx>;

export const addGridStateExToPuzzleTypeManager = <T extends AnyPTM, GridStateEx>(
    {
        initialGridStateExtension,
        serializeGridStateExtension,
        unserializeGridStateExtension,
        areGridStateExtensionsEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b),
        cloneGridStateExtension = (extension) => JSON.parse(JSON.stringify(extension)),
        ...baseTypeManager
    }: PuzzleTypeManager<T>,
    {
        initialGridStateExtension: initialGridStateExtension2,
        serializeGridStateExtension: serializeGridStateExtension2,
        unserializeGridStateExtension: unserializeGridStateExtension2,
        areGridStateExtensionsEqual: areGridStateExtensionsEqual2 = (a, b) => JSON.stringify(a) === JSON.stringify(b),
        cloneGridStateExtension: cloneGridStateExtension2 = (extension) => JSON.parse(JSON.stringify(extension)),
    }: {
        initialGridStateExtension:
            | GridStateEx
            | ((puzzle?: PuzzleDefinition<ReplaceGridStateEx<T, GridStateEx>>) => GridStateEx);
    } & Pick<
        PuzzleTypeManager<ReplaceGridStateEx<T, GridStateEx>>,
        | "serializeGridStateExtension"
        | "unserializeGridStateExtension"
        | "areGridStateExtensionsEqual"
        | "cloneGridStateExtension"
    >,
): PuzzleTypeManager<AddGridStateEx<T, GridStateEx>> => {
    type ExT = ReplaceGridStateEx<T, GridStateEx>;
    type T2 = AddGridStateEx<T, GridStateEx>;

    const simpleInitialGridStateExtension2 =
        typeof initialGridStateExtension2 === "function"
            ? (initialGridStateExtension2 as () => GridStateEx)()
            : (initialGridStateExtension2 as GridStateEx);

    function splitGridStateEx(value: T2["gridStateEx"]): { base: T["gridStateEx"]; ex: GridStateEx };
    function splitGridStateEx(
        value: Partial<T2["gridStateEx"]>,
        useDefaults?: boolean,
    ): { base: Partial<T["gridStateEx"]>; ex: Partial<GridStateEx> };
    function splitGridStateEx(
        value: Partial<T2["gridStateEx"]>,
        useDefaults = false,
    ): { base: Partial<T["gridStateEx"]>; ex: Partial<GridStateEx> } {
        return splitEx(value, simpleInitialGridStateExtension2 as Partial<GridStateEx>, useDefaults);
    }

    return {
        ...(baseTypeManager as unknown as PuzzleTypeManager<T2>),

        initialGridStateExtension: (puzzle: PuzzleDefinition<T2>): T2["gridStateEx"] => ({
            ...(typeof initialGridStateExtension === "function"
                ? (initialGridStateExtension as (puzzle: PuzzleDefinition<T>) => T["gridStateEx"])(
                      puzzle as unknown as PuzzleDefinition<T>,
                  )
                : (initialGridStateExtension as T["gridStateEx"])),
            ...(typeof initialGridStateExtension2 === "function"
                ? (initialGridStateExtension2 as (puzzle: PuzzleDefinition<ExT>) => GridStateEx)(
                      puzzle as unknown as PuzzleDefinition<ExT>,
                  )
                : (initialGridStateExtension2 as GridStateEx)),
        }),
        serializeGridStateExtension(data: Partial<T2["gridStateEx"]>): any {
            const { base, ex } = splitGridStateEx(data);

            return {
                ...(serializeGridStateExtension?.(base) ?? base),
                ...(serializeGridStateExtension2?.(ex) ?? ex),
            };
        },
        unserializeGridStateExtension(data: any): Partial<T2["gridStateEx"]> {
            const { base, ex } = splitGridStateEx(data, true);

            return {
                ...(unserializeGridStateExtension?.(base) ?? base),
                ...(unserializeGridStateExtension2?.(ex) ?? ex),
            };
        },
        areGridStateExtensionsEqual(a: T2["gridStateEx"], b: T2["gridStateEx"]): boolean {
            const { base: baseA, ex: exA } = splitGridStateEx(a);
            const { base: baseB, ex: exB } = splitGridStateEx(b);

            return areGridStateExtensionsEqual(baseA, baseB) && areGridStateExtensionsEqual2(exA, exB);
        },
        cloneGridStateExtension(data: T2["gridStateEx"]): T2["gridStateEx"] {
            const { base, ex } = splitGridStateEx(data);

            return {
                ...cloneGridStateExtension(base),
                ...cloneGridStateExtension2(ex),
            };
        },
    };
};
// endregion

// region Game state
export type ReplaceGameStateEx<T extends AnyPTM, GameStateEx> = Omit<T, "stateEx"> & { stateEx: GameStateEx };
export type AddGameStateEx<T extends AnyPTM, GameStateEx> = ReplaceGameStateEx<T, T["stateEx"] & GameStateEx>;

export const addGameStateExToPuzzleTypeManager = <T extends AnyPTM, GameStateEx>(
    { initialGameStateExtension, serializeGameState, unserializeGameState, ...baseTypeManager }: PuzzleTypeManager<T>,
    {
        initialGameStateExtension: initialGameStateExtension2,
        serializeGameState: serializeGameState2,
        unserializeGameState: unserializeGameState2,
    }: {
        initialGameStateExtension:
            | GameStateEx
            | ((puzzle?: PuzzleDefinition<ReplaceGameStateEx<T, GameStateEx>>) => GameStateEx);
    } & Partial<
        Pick<PuzzleTypeManager<ReplaceGameStateEx<T, GameStateEx>>, "serializeGameState" | "unserializeGameState">
    >,
): PuzzleTypeManager<AddGameStateEx<T, GameStateEx>> => {
    type ExT = ReplaceGameStateEx<T, GameStateEx>;
    type T2 = AddGameStateEx<T, GameStateEx>;

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
        ...(baseTypeManager as unknown as PuzzleTypeManager<T2>),

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
    };
};
// endregion
