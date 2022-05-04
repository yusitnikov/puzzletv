import {GivenDigitsMap} from "./GivenDigitsMap";
import {ReactNode} from "react";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {FieldSize} from "./FieldSize";
import {PartiallyTranslatable} from "../translations/Translatable";
import {useTranslate} from "../../contexts/LanguageCodeContext";
import {ProcessedGameState} from "./GameState";
import {ConstraintOrComponent} from "./Constraint";
import {CellColor} from "./CellColor";

export interface PuzzleDefinition<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    title: PartiallyTranslatable<ReactNode>;
    slug: string;
    author?: PartiallyTranslatable<ReactNode>;
    rules?: (translate: ReturnType<typeof useTranslate>) => ReactNode;
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    fieldSize: FieldSize;
    fieldMargin?: number;
    digitsCount?: number;
    initialDigits?: GivenDigitsMap<CellType>;
    initialColors?: GivenDigitsMap<CellColor[]>;
    allowOverridingInitialColors?: boolean;
    resultChecker?: (
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ) => boolean,
    items?: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]
        | ((gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType) => ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]);
    borderColor?: string;
    allowDrawingBorders?: boolean;
    loopHorizontally?: boolean;
    loopVertically?: boolean;
    noIndex?: boolean;
}

export const isPuzzleHasBottomRowControls = (
    {
        typeManager: {
            hasBottomRowControls = false,
        },
        allowDrawingBorders = false,
        loopHorizontally = false,
        loopVertically = false,
    }: PuzzleDefinition<any, any, any>
) => hasBottomRowControls || (allowDrawingBorders && (loopHorizontally || loopVertically));
