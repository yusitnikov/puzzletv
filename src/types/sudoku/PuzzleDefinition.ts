import {GivenDigitsMap} from "./GivenDigitsMap";
import {ComponentType, ReactNode} from "react";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {FieldSize} from "./FieldSize";
import {PartiallyTranslatable} from "../translations/Translatable";
import {useTranslate} from "../../contexts/LanguageCodeContext";
import {ProcessedGameState} from "./GameState";
import {ConstraintOrComponent} from "./Constraint";
import {CellColor} from "./CellColor";
import {PuzzleContext, PuzzleContextProps} from "./PuzzleContext";
import {CustomCellBounds} from "./CustomCellBounds";

export interface PuzzleDefinition<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    title: PartiallyTranslatable;
    slug: string;
    params?: {
        host?: string;
        room?: string;
        share?: boolean;
        [key: string]: any;
    };
    getNewHostedGameParams?: () => any;
    author?: PartiallyTranslatable<ReactNode>;
    rules?: (
        translate: ReturnType<typeof useTranslate>,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
    ) => ReactNode;
    aboveRules?: (
        translate: ReturnType<typeof useTranslate>,
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
    ) => ReactNode;
    typeManager: SudokuTypeManager<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    fieldSize: FieldSize;
    fieldMargin?: number;
    fieldWrapperComponent?: ComponentType<PuzzleContextProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>>;
    fieldFitsWrapper?: boolean;
    customCellBounds?: GivenDigitsMap<CustomCellBounds>;
    digitsCount?: number;
    initialDigits?: GivenDigitsMap<CellType>;
    initialColors?: GivenDigitsMap<CellColor[]> | ((context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>) => GivenDigitsMap<CellColor[]>);
    allowOverridingInitialColors?: boolean;
    resultChecker?: (context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>) => boolean,
    forceAutoCheckOnFinish?: boolean;
    items?: ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]
        | ((gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType) => ConstraintOrComponent<CellType, any, GameStateExtensionType, ProcessedGameStateExtensionType>[]);
    borderColor?: string;
    allowDrawingBorders?: boolean;
    loopHorizontally?: boolean;
    loopVertically?: boolean;
    enableDragMode?: boolean;
    getLmdSolutionCode?: (
        puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        gameState: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
    ) => string;
    noIndex?: boolean;
    saveState?: boolean;
    saveStateKey?: string;
}

export interface PuzzleDefinitionLoader<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    slug: string;
    noIndex?: boolean;
    fulfillParams: (params: any) => any;
    loadPuzzle: (params: any) => PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
}

export const isPuzzleHasBottomRowControls = (
    {
        typeManager: {
            hasBottomRowControls = false,
        },
        allowDrawingBorders = false,
        loopHorizontally = false,
        loopVertically = false,
        enableDragMode = false,
    }: PuzzleDefinition<any, any, any>
) => hasBottomRowControls || (allowDrawingBorders && (loopHorizontally || loopVertically || enableDragMode));

export const getDefaultDigitsCount = ({typeManager: {maxDigitsCount}, fieldSize: {fieldSize}}: PuzzleDefinition<any, any, any>) =>
    Math.min(maxDigitsCount || fieldSize, fieldSize);
