export interface PuzzleTypeMap<
    CellType,
    GameStateExType = {},
    ProcessedGameStateExType = {},
    GridStateEx = {},
    PuzzleExType = {},
> {
    cell: CellType;
    stateEx: GameStateExType;
    processedStateEx: ProcessedGameStateExType;
    gridStateEx: GridStateEx;
    puzzleEx: PuzzleExType;
}

export type PTM<
    CellType,
    GameStateExType = {},
    ProcessedGameStateExType = {},
    GridStateEx = {},
    PuzzleExType = {},
> = PuzzleTypeMap<CellType, GameStateExType, ProcessedGameStateExType, GridStateEx, PuzzleExType>;

export type AnyPTM<
    CellType = any,
    GameStateExType = any,
    ProcessedGameStateExType = any,
    GridStateEx = any,
    PuzzleExType = any,
> = PTM<CellType, GameStateExType, ProcessedGameStateExType, GridStateEx, PuzzleExType>;

export type NumberPTM<
    GameStateExType = {},
    ProcessedGameStateExType = {},
    GridStateEx = {},
    PuzzleExType = {},
> = PuzzleTypeMap<number, GameStateExType, ProcessedGameStateExType, GridStateEx, PuzzleExType>;

export type AnyNumberPTM<
    GameStateExType = any,
    ProcessedGameStateExType = any,
    GridStateEx = any,
    PuzzleExType = any,
> = NumberPTM<GameStateExType, ProcessedGameStateExType, GridStateEx, PuzzleExType>;
