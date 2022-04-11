import {FieldStateInitialDigitsMap} from "./FieldState";
import {ReactNode} from "react";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {FieldSize} from "./FieldSize";
import {PartiallyTranslatable, Translatable} from "../translations/Translatable";
import {useTranslate} from "../../contexts/LanguageCodeContext";

export interface PuzzleDefinition<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    title: Translatable<ReactNode>;
    slug: string;
    author?: PartiallyTranslatable<ReactNode>;
    rules: (translate: ReturnType<typeof useTranslate>) => ReactNode;
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    fieldSize: FieldSize;
    fieldMargin?: number;
    digitsCount?: number;
    initialDigits?: FieldStateInitialDigitsMap<CellType>;
    veryBackgroundItems?: ReactNode;
    backgroundItems?: ReactNode;
    topItems?: ReactNode;
    noIndex?: boolean;
}
