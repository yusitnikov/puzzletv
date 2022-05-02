import {ComponentType, ReactNode} from "react";
import {Position} from "../layout/Position";
import {ProcessedGameState} from "./GameState";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {GivenDigitsMap} from "./GivenDigitsMap";

export type Constraint<CellType, DataT = {}, GameStateExtensionType = any, ProcessedGameStateExtensionType = any> = {
    name: string;
    cells: Position[];
    component?: ComponentType<ConstraintProps<CellType, DataT, GameStateExtensionType, ProcessedGameStateExtensionType>>;
    isValidCell(
        cell: Position,
        digits: GivenDigitsMap<CellType>,
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ): boolean;
} & DataT;

export type ConstraintProps<CellType = any, DataT = {}, GameStateExtensionType = any, ProcessedGameStateExtensionType = any> =
    Omit<Constraint<CellType, DataT, GameStateExtensionType, ProcessedGameStateExtensionType>, "component"> & {
    gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    cellSize: number;
}

export type ConstraintOrComponent<CellType, DataT = {}, GameStateExtensionType = any, ProcessedGameStateExtensionType = any> =
    Constraint<CellType, DataT, GameStateExtensionType, ProcessedGameStateExtensionType> | ReactNode;
