import {GivenDigitsMap} from "./GivenDigitsMap";
import {ReactNode} from "react";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {FieldSize} from "./FieldSize";
import {PartiallyTranslatable} from "../translations/Translatable";
import {useTranslate} from "../../contexts/LanguageCodeContext";
import {ProcessedGameState} from "./GameState";

export interface PuzzleDefinition<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    title: PartiallyTranslatable<ReactNode>;
    slug: string;
    author?: PartiallyTranslatable<ReactNode>;
    rules: (translate: ReturnType<typeof useTranslate>) => ReactNode;
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    fieldSize: FieldSize;
    fieldMargin?: number;
    digitsCount?: number;
    initialDigits?: GivenDigitsMap<CellType>;
    resultChecker?: (gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType) => boolean,
    items?: ReactNode;
    noIndex?: boolean;
}
