export interface PuzzleTypeMap<CellType, GameStateExType = {}, GridStateEx = {}, PuzzleExType = {}> {
    cell: CellType;
    stateEx: GameStateExType;
    gridStateEx: GridStateEx;
    puzzleEx: PuzzleExType;
}

export type PTM<CellType, GameStateExType = {}, GridStateEx = {}, PuzzleExType = {}> = PuzzleTypeMap<
    CellType,
    GameStateExType,
    GridStateEx,
    PuzzleExType
>;

export type AnyPTM<CellType = any, GameStateExType = any, GridStateEx = any, PuzzleExType = any> = PTM<
    CellType,
    GameStateExType,
    GridStateEx,
    PuzzleExType
>;

export type NumberPTM<GameStateExType = {}, GridStateEx = {}, PuzzleExType = {}> = PTM<
    number,
    GameStateExType,
    GridStateEx,
    PuzzleExType
>;

export type AnyNumberPTM<GameStateExType = any, GridStateEx = any, PuzzleExType = any> = NumberPTM<
    GameStateExType,
    GridStateEx,
    PuzzleExType
>;
