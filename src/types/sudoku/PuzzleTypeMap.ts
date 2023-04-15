export interface PuzzleTypeMap<CellType, GameStateExType = {}, ProcessedGameStateExType = {}, FieldStateEx = {}> {
    cell: CellType;
    stateEx: GameStateExType;
    processedStateEx: ProcessedGameStateExType;
    fieldStateEx: FieldStateEx;
}

export type PTM<CellType, GameStateExType = {}, ProcessedGameStateExType = {}, FieldStateEx = {}> =
    PuzzleTypeMap<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx>;

export type AnyPTM<CellType = any, GameStateExType = any, ProcessedGameStateExType = any, FieldStateEx = any> =
    PTM<CellType, GameStateExType, ProcessedGameStateExType, FieldStateEx>;

export type NumberPTM<GameStateExType = {}, ProcessedGameStateExType = {}, FieldStateEx = {}> =
    PuzzleTypeMap<number, GameStateExType, ProcessedGameStateExType, FieldStateEx>;

export type AnyNumberPTM<GameStateExType = any, ProcessedGameStateExType = any, FieldStateEx = any> =
    NumberPTM<GameStateExType, ProcessedGameStateExType, FieldStateEx>;
