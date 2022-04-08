import {FieldStateInitialDigitsMap} from "./FieldState";
import {ReactNode} from "react";
import {SudokuTypeManager} from "./SudokuTypeManager";

export interface PuzzleDefinition<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    title: ReactNode;
    author?: ReactNode;
    rules: ReactNode;
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    initialDigits?: FieldStateInitialDigitsMap<CellType>;
    backgroundItems?: ReactNode;
    topItems?: ReactNode;
}
