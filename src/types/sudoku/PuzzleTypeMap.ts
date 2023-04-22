export interface PuzzleTypeMap<CellType, GameStateExType = {}, ProcessedGameStateExType = {}, FieldStateEx = {}, PuzzleExType = {}> {
    cell: CellType;
    stateEx: GameStateExType;
    processedStateEx: ProcessedGameStateExType;
    fieldStateEx: FieldStateEx;
    puzzleEx: PuzzleExType;
}

export type PTM<CellType, GameStateExType = {}, ProcessedGameStateExType = {}, FieldStateEx = {}, PuzzleExType = {}> =
    PuzzleTypeMap<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;

export type AnyPTM<CellType = any, GameStateExType = any, ProcessedGameStateExType = any, FieldStateEx = any, PuzzleExType = any> =
    PTM<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;

export type NumberPTM<GameStateExType = {}, ProcessedGameStateExType = {}, FieldStateEx = {}, PuzzleExType = {}> =
    PuzzleTypeMap<number, GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;

export type AnyNumberPTM<GameStateExType = any, ProcessedGameStateExType = any, FieldStateEx = any, PuzzleExType = any> =
    NumberPTM<GameStateExType, ProcessedGameStateExType, FieldStateEx, PuzzleExType>;
