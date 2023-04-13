export interface PuzzleTypeMap<CellType, GameStateExType = {}, ProcessedGameStateExType = {}> {
    cell: CellType;
    stateEx: GameStateExType;
    processedStateEx: ProcessedGameStateExType;
}

export type PTM<CellType, GameStateExType = {}, ProcessedGameStateExType = {}> =
    PuzzleTypeMap<CellType, GameStateExType, ProcessedGameStateExType>;

export type AnyPTM<CellType = any, GameStateExType = any, ProcessedGameStateExType = any> =
    PTM<CellType, GameStateExType, ProcessedGameStateExType>;

export type NumberPTM<GameStateExType = {}, ProcessedGameStateExType = {}> =
    PuzzleTypeMap<number, GameStateExType, ProcessedGameStateExType>;

export type AnyNumberPTM<GameStateExType = any, ProcessedGameStateExType = any> =
    NumberPTM<GameStateExType, ProcessedGameStateExType>;
