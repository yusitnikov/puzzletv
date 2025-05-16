/**
 * All type parameters related to defining and solving puzzles, unified into one type-map.
 *
 * See "docs/Data structures and types.md" for more info.
 */
export interface PuzzleTypeMap<CellType, GameStateExType = {}, GridStateEx = {}, PuzzleExType = {}> {
    /**
     * The type of the main data that could be stored in a cell
     * (not counting cell coloring and the pen tool),
     * e.g. `number` for regular sudoku (because the sudoku cell content is a digit).
     */
    cell: CellType;
    /**
     * The type of additional data on the puzzle solving state
     * that IS NOT part of the "undo history".
     */
    stateEx: GameStateExType;
    /**
     * The type of additional data on the puzzle solving state
     * that IS part of the "undo history".
     */
    gridStateEx: GridStateEx;
    /**
     * The type of additional data stored on the puzzle definition.
     */
    puzzleEx: PuzzleExType;
}

/**
 * PTM is just an acronym for PuzzleTypeMap.
 */
export type PTM<CellType, GameStateExType = {}, GridStateEx = {}, PuzzleExType = {}> = PuzzleTypeMap<
    CellType,
    GameStateExType,
    GridStateEx,
    PuzzleExType
>;

/**
 * Base type for any PTM - usually used in an "extends" clause to accept any PTM as a type parameter, e.g.
 * ```
 * interface SomePuzzleRelatedType<T extends AnyPTM> { ... }
 * ```
 */
export type AnyPTM<CellType = any, GameStateExType = any, GridStateEx = any, PuzzleExType = any> = PTM<
    CellType,
    GameStateExType,
    GridStateEx,
    PuzzleExType
>;

/**
 * Type to define specific PTM for a puzzle genre that supports only digits as a cell type.
 */
export type NumberPTM<GameStateExType = {}, GridStateEx = {}, PuzzleExType = {}> = PTM<
    number,
    GameStateExType,
    GridStateEx,
    PuzzleExType
>;

/**
 * Base type for any PTM with digit as a cell type.
 *
 * @see AnyPTM
 */
export type AnyNumberPTM<GameStateExType = any, GridStateEx = any, PuzzleExType = any> = NumberPTM<
    GameStateExType,
    GridStateEx,
    PuzzleExType
>;
