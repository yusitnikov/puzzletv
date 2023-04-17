import {DigitComponentType} from "../../components/sudoku/digit/DigitComponentType";
import {CellDataComponentType} from "../../components/sudoku/cell/CellDataComponentType";
import {getLineVector, Position, PositionWithAngle} from "../layout/Position";
import {SetInterface} from "../struct/Set";
import {GameStateEx, PartialGameStateEx, ProcessedGameStateEx} from "./GameState";
import {ComponentType, ReactNode} from "react";
import {ControlsProps} from "../../components/sudoku/controls/Controls";
import {Translatable} from "../translations/Translatable";
import {getIsSamePuzzlePosition, PuzzleDefinition} from "./PuzzleDefinition";
import {CellSelectionColor, CellSelectionProps} from "../../components/sudoku/cell/CellSelection";
import {GridRegion} from "./GridRegion";
import {Constraint, getAllPuzzleConstraints} from "./Constraint";
import {PuzzleContext} from "./PuzzleContext";
import {CellStateEx} from "./CellState";
import {CellWriteMode} from "./CellWriteMode";
import {CellWriteModeInfo} from "./CellWriteModeInfo";
import {GameStateAction, GameStateActionType} from "./GameStateAction";
import {useTranslate} from "../../hooks/useTranslate";
import {KeyInfo} from "./KeyInfo";
import {SettingsContentProps} from "../../components/sudoku/controls/settings/SettingsContent";
import {regionTag} from "../../components/sudoku/constraints/region/Region";
import {ControlButtonItem} from "../../components/sudoku/controls/ControlButtonsManager";
import {AnyPTM} from "./PuzzleTypeMap";
import {CellTypeProps, isSelectableCell} from "./CellTypeProps";

export interface SudokuTypeManager<T extends AnyPTM> {
    /*
     * When `forConstraints` is true, the method should compare actual values of the cell.
     * Otherwise, compare visual representation that will be rendered into the cell
     */
    areSameCellData(
        data1: T["cell"],
        data2: T["cell"],
        puzzle: PuzzleDefinition<T>,
        state: ProcessedGameStateEx<T> | undefined,
        forConstraints: boolean
    ): boolean;

    compareCellData(
        data1: T["cell"],
        data2: T["cell"],
        puzzle: PuzzleDefinition<T>,
        state: ProcessedGameStateEx<T> | undefined,
        forConstraints: boolean
    ): number;

    getCellDataHash(data: T["cell"], puzzle: PuzzleDefinition<T>): string;

    cloneCellData(data: T["cell"]): T["cell"];

    serializeCellData(data: T["cell"]): any;

    unserializeCellData(data: any): T["cell"];

    serializeGameState(data: Partial<T["stateEx"]>): any;

    unserializeGameState(data: any): Partial<T["stateEx"]>;

    serializeFieldStateExtension?(data: Partial<T["fieldStateEx"]>): any;

    unserializeFieldStateExtension?(data: any): Partial<T["fieldStateEx"]>;

    cloneFieldStateExtension?(data: T["fieldStateEx"]): T["fieldStateEx"];

    areFieldStateExtensionsEqual?(a: T["fieldStateEx"], b: T["fieldStateEx"]): boolean;

    createCellDataByDisplayDigit(
        digit: number,
        gameState: ProcessedGameStateEx<T>
    ): T["cell"];

    createCellDataByTypedDigit(
        digit: number,
        context: PuzzleContext<T>,
        position?: Position
    ): T["cell"];

    createCellDataByImportedDigit(digit: number): T["cell"];

    getDigitByCellData(data: T["cell"], context: PuzzleContext<T>, cellPosition: Position): number;

    getNumberByDigits?(digits: number[]): number | undefined;

    transformNumber?(num: number, context: PuzzleContext<T>, cellPosition: Position): number;

    processCellDataPosition?(
        puzzle: PuzzleContext<T>,
        basePosition: PositionWithAngle,
        dataSet: SetInterface<T["cell"]>,
        dataIndex: number,
        positionFunction: (index: number) => PositionWithAngle | undefined,
        cellPosition?: Position,
        state?: ProcessedGameStateEx<T>
    ): PositionWithAngle | undefined;

    handleDigitGlobally?(
        isGlobal: boolean,
        clientId: string,
        context: PuzzleContext<T>,
        cellData: T["cell"],
        defaultResult: PartialGameStateEx<T>
    ): PartialGameStateEx<T>;

    handleDigitInCell?(
        isGlobal: boolean,
        clientId: string,
        cellWriteMode: CellWriteMode,
        cellState: CellStateEx<T>,
        cellData: T["cell"],
        position: Position,
        context: PuzzleContext<T>,
        defaultResult: Partial<CellStateEx<T>>,
        cache: any
    ): Partial<CellStateEx<T>>;

    extraCellWriteModes?: CellWriteModeInfo<T>[];

    disabledCellWriteModes?: CellWriteMode[];

    initialCellWriteMode?: CellWriteMode;

    digitComponentType: DigitComponentType<T>;

    cellDataDigitComponentType?: DigitComponentType<T>;

    cellDataComponentType: CellDataComponentType<T>;

    initialGameStateExtension?: T["stateEx"] | ((puzzle: PuzzleDefinition<T>) => T["stateEx"]);

    initialFieldStateExtension?: T["fieldStateEx"] | ((puzzle: PuzzleDefinition<T>) => T["fieldStateEx"]);

    allowMove?: boolean;

    initialAngle?: number;
    angleStep?: number;
    allowRotation?: boolean;
    isFreeRotation?: boolean;

    initialScale?: number;
    scaleStep?: number;
    allowScale?: boolean;
    isFreeScale?: boolean;
    fieldWrapperHandlesScale?: boolean;

    gridBackgroundColor?: string;
    regionBackgroundColor?: string;

    keepStateOnRestart?(state: ProcessedGameStateEx<T>): PartialGameStateEx<T>;

    isReady?(state: GameStateEx<T>): boolean;

    useProcessedGameStateExtension?(state: GameStateEx<T>): T["processedStateEx"];

    // Fallback for useProcessedGameStateExtension() when calling outside a React component
    getProcessedGameStateExtension?(state: GameStateEx<T>): T["processedStateEx"];

    getCellTypeProps?(cell: Position, puzzle: PuzzleDefinition<T>): CellTypeProps<T>;

    processArrowDirection?(
        currentCell: Position,
        xDirection: number,
        yDirection: number,
        context: PuzzleContext<T>,
        isMainKeyboard: boolean
    ): {cell?: Position, state?: PartialGameStateEx<T>};

    transformCoords?(
        coords: Position,
        context: PuzzleContext<T>,
    ): Position;

    // true if transformCoords() doesn't distribute the coords evenly (if it has distortion)
    isOddTransformCoords?: boolean;

    // Get rectangles of non-modified coords that get the same transformation matrix by transformCoords
    getRegionsWithSameCoordsTransformation?(context: PuzzleContext<T>): GridRegion[];

    items?: Constraint<T, any>[]
        | ((context: PuzzleContext<T>) => Constraint<T, any>[]);

    getRegionsForRowsAndColumns?(
        puzzle: PuzzleDefinition<T>,
        state: ProcessedGameStateEx<T>
    ): Constraint<T, any>[];

    getAdditionalNeighbors?(
        position: Position,
        puzzle: PuzzleDefinition<T>,
    ): Position[];

    borderColor?: string;

    getCellSelectionType?(
        cell: Position,
        context: PuzzleContext<T>
    ): Required<Pick<CellSelectionProps<T>, "color" | "strokeWidth">> | undefined;

    mainControlsComponent?: ComponentType<ControlsProps<T>>;
    controlButtons?: (ControlButtonItem<T> | undefined | false)[];

    settingsComponents?: ComponentType<SettingsContentProps<T>>[];

    maxDigitsCount?: number;

    disableCellModeLetterShortcuts?: boolean;
    disableArrowLetterShortcuts?: boolean;
    disableDigitShortcuts?: boolean;

    digitShortcuts?: (string | KeyInfo)[][];

    digitShortcutTips?: (Translatable|undefined)[];

    disableConflictChecker?: boolean;

    getSharedState?(
        puzzle: PuzzleDefinition<T>,
        state: GameStateEx<T>
    ): any;

    setSharedState?(
        puzzle: PuzzleDefinition<T>,
        state: GameStateEx<T>,
        newState: any
    ): GameStateEx<T>;

    getInternalState?(
        puzzle: PuzzleDefinition<T>,
        state: GameStateEx<T>
    ): any;

    unserializeInternalState?(
        puzzle: PuzzleDefinition<T>,
        newState: any
    ): PartialGameStateEx<T>;

    supportedActionTypes?: GameStateActionType<any, T>[];

    handleClearAction?(
        context: PuzzleContext<T>,
        clientId: string
    ): PartialGameStateEx<T>;

    isGlobalAction?(
        action: GameStateAction<any, T>,
        context: PuzzleContext<T>
    ): boolean;

    applyStateDiffEffect?(
        state: ProcessedGameStateEx<T>,
        prevState: ProcessedGameStateEx<T> | undefined,
        context: PuzzleContext<T>
    ): void;

    getPlayerScore?(context: PuzzleContext<T>, clientId: string): string | number;

    getAboveRules?(translate: ReturnType<typeof useTranslate>, context: PuzzleContext<T>): ReactNode;

    postProcessPuzzle?(puzzle: PuzzleDefinition<T>): typeof puzzle;

    fixCellPosition?(position: Position, puzzle: PuzzleDefinition<T>): Position | undefined;

    rotationallySymmetricDigits?: boolean;

    mapImportedColors?: boolean;
}

export const defaultProcessArrowDirectionForRegularCellBounds = <T extends AnyPTM>(
    {left, top}: Position,
    xDirection: number,
    yDirection: number,
    {cellsIndex, puzzle: {fieldSize: {rowsCount, columnsCount}}}: PuzzleContext<T>
): {cell?: Position, state?: undefined} => {
    const isTotallyValidCell = (position: Position) => {
        const {top, left} = position;
        if (top < 0 || top >= rowsCount || left < 0 || left >= columnsCount) {
            return false;
        }
        return isSelectableCell(cellsIndex.getCellTypeProps(position));
    };

    // Try moving in the requested direction naively
    let newPosition = {
        left: left + xDirection,
        top: top + yDirection,
    };

    if (isTotallyValidCell(newPosition)) {
        return {cell: newPosition};
    }

    // If the naive new position is not valid then go in the reverse direction while it's possible
    do {
        newPosition.left -= xDirection;
        newPosition.top -= yDirection;
    } while (isTotallyValidCell({
        left: newPosition.left - xDirection,
        top: newPosition.top - yDirection,
    }));

    return {cell: newPosition};
};

export const defaultProcessArrowDirectionForCustomCellBounds = <T extends AnyPTM>(
    {left, top}: Position,
    xDirection: number,
    yDirection: number,
    {cellsIndex}: PuzzleContext<T>,
    isMainKeyboard?: boolean,
    enableBackwardSteps = true,
): {cell?: Position, state?: undefined} => {
    const {center, neighbors} = cellsIndex.allCells[top][left];

    let bestDist: number | undefined = undefined;
    let bestCell: Position | undefined = undefined;

    for (const neighbor of neighbors.items) {
        if (!isSelectableCell(cellsIndex.getCellTypeProps(neighbor))) {
            continue;
        }

        const center2 = cellsIndex.allCells[neighbor.top][neighbor.left].center;
        const vector = getLineVector({start: center, end: center2});

        const straightDist = vector.left * xDirection + vector.top * yDirection;
        if (!enableBackwardSteps && straightDist < 0) {
            continue;
        }
        const errorDist = Math.abs(vector.left * yDirection) + Math.abs(vector.top * xDirection);
        const dist = Math.abs(Math.atan2(errorDist, straightDist));
        if (bestDist === undefined || dist < bestDist) {
            bestDist = dist;
            bestCell = neighbor;
        }
    }

    return {cell: bestCell};
};

export const defaultProcessArrowDirection = <T extends AnyPTM>(
    position: Position,
    xDirection: number,
    yDirection: number,
    context: PuzzleContext<T>,
    isMainKeyboard?: boolean,
    enableBackwardSteps?: boolean,
): {cell?: Position, state?: undefined} => {
    return context.puzzle.customCellBounds
        ? defaultProcessArrowDirectionForCustomCellBounds(position, xDirection, yDirection, context, isMainKeyboard, enableBackwardSteps)
        : defaultProcessArrowDirectionForRegularCellBounds(position, xDirection, yDirection, context);
};

export const defaultGetDefaultNumberByDigits = (digits: number[]) => {
    let num = 0;

    for (const digit of digits) {
        num *= 10;
        num += digit;
    }

    return num;
};

export const getDefaultCellSelectionType = <T extends AnyPTM>(
    cell: Position,
    context: PuzzleContext<T>,
): ReturnType<Required<SudokuTypeManager<T>>["getCellSelectionType"]> => {
    const {puzzle, state: {selectedCells}} = context;

    if (selectedCells.size === 0) {
        return undefined;
    }

    const isSamePosition = getIsSamePuzzlePosition(puzzle);
    const doesRegionContainCell = (cells: Position[], cell: Position) =>
        cells.some((cell2) => isSamePosition(cell2, cell));
    const seenRegions = getAllPuzzleConstraints(context)
        .filter(({tags}) => tags?.includes(regionTag))
        .map(({cells}) => cells)
        .filter((region) => doesRegionContainCell(region, cell));
    const isSeen = selectedCells.items.every((selectedCell) => seenRegions.some(
        (region) => doesRegionContainCell(region, selectedCell)
    ));
    return isSeen
        ? {
            color: CellSelectionColor.secondary,
            strokeWidth: 1,
        }
        : undefined;
};
