import {PuzzleDefinition} from "./PuzzleDefinition";
import {ProcessedGameState} from "./GameState";
import {MergeStateAction} from "../react/MergeStateAction";

// It's not a React context! Just a regular type.
export interface PuzzleContext<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    onStateChange: (state: MergeStateAction<ProcessedGameState<CellType> & ProcessedGameStateExtensionType>) => void;
    cellSize: number;
}

export interface PuzzleContextProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
}
