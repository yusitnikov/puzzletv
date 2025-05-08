import { DigitComponentType } from "../../components/puzzle/digit/DigitComponentType";
import { CellDataComponentType } from "../../components/puzzle/cell/CellDataComponentType";
import { getLineVector, Position, PositionWithAngle } from "../layout/Position";
import { SetInterface } from "../struct/Set";
import { GameStateEx, PartialGameStateEx } from "./GameState";
import { ComponentType, ReactNode } from "react";
import { ControlsProps } from "../../components/puzzle/controls/Controls";
import { Translatable } from "../translations/Translatable";
import { getIsSamePuzzlePosition, PuzzleDefinition } from "./PuzzleDefinition";
import { CellSelectionColor, CellSelectionByDataProps } from "../../components/puzzle/cell/CellSelection";
import { GridRegion } from "./GridRegion";
import { Constraint } from "./Constraint";
import { PuzzleContext, PuzzleContextProps } from "./PuzzleContext";
import { CellStateEx } from "./CellState";
import { CellWriteMode } from "./CellWriteMode";
import { CellWriteModeInfo } from "./CellWriteModeInfo";
import { GameStateAction, GameStateActionType } from "./GameStateAction";
import { KeyInfo } from "./KeyInfo";
import { SettingsContentProps } from "../../components/puzzle/controls/settings/SettingsContent";
import { regionTag } from "../../components/puzzle/constraints/region/Region";
import { ControlButtonItem } from "../../components/puzzle/controls/ControlButtonsManager";
import { AnyPTM } from "./PuzzleTypeMap";
import { CellTypeProps, isSelectableCell } from "./CellTypeProps";
import { IReactionDisposer } from "mobx";
import { CellsMap } from "./CellsMap";
import { ColorsImportMode, PuzzleImportOptions } from "./PuzzleImportOptions";
import { PuzzleImporter } from "../../data/puzzles/PuzzleImporter";
import { GridParser } from "../../data/puzzles/GridParser";
import { GridState } from "./GridState";
import { PuzzleLine } from "./PuzzleLine";

export interface PuzzleTypeManager<T extends AnyPTM> {
    /*
     * When `forConstraints` is true, the method should compare actual values of the cell.
     * Otherwise, compare visual representation that will be rendered into the cell
     */
    areSameCellData(
        data1: T["cell"],
        data2: T["cell"],
        context: PuzzleContext<T>,
        // The positions are given when comparing the cells for constraints.
        // The state (from the context) should be used only when the positions are given.
        position1?: Position,
        position2?: Position,
    ): boolean;

    compareCellData(
        data1: T["cell"],
        data2: T["cell"],
        context: PuzzleContext<T>,
        // default: true
        useState?: boolean,
        // default: true
        forConstraints?: boolean,
    ): number;

    getCellDataHash(data: T["cell"], puzzle: PuzzleDefinition<T>): string;

    cloneCellData(data: T["cell"]): T["cell"];

    serializeCellData(data: T["cell"]): any;

    unserializeCellData(data: any): T["cell"];

    serializeGameState?(data: Partial<T["stateEx"]>): any;

    unserializeGameState?(data: any): Partial<T["stateEx"]>;

    serializeGridStateExtension?(data: Partial<T["gridStateEx"]>): any;

    unserializeGridStateExtension?(data: any): Partial<T["gridStateEx"]>;

    cloneGridStateExtension?(data: T["gridStateEx"]): T["gridStateEx"];

    areGridStateExtensionsEqual?(a: T["gridStateEx"], b: T["gridStateEx"]): boolean;

    createCellDataByDisplayDigit(digit: number, context: PuzzleContext<T>): T["cell"];

    createCellDataByTypedDigit(digit: number, context: PuzzleContext<T>, position?: Position): T["cell"];

    createCellDataByImportedDigit(digit: number, importOptions: PuzzleImportOptions): T["cell"];

    getDigitByCellData(data: T["cell"], context: PuzzleContext<T>, cellPosition: Position): number;

    getNumberByDigits?(digits: number[]): number | undefined;

    transformNumber?(
        num: number,
        context: PuzzleContext<T>,
        cellPosition: Position,
        constraint?: Constraint<T, any>,
    ): number;

    processCellDataPosition?(
        puzzle: PuzzleContext<T>,
        basePosition: PositionWithAngle,
        dataSet: SetInterface<T["cell"]>,
        dataIndex: number,
        positionFunction: (index: number) => PositionWithAngle | undefined,
        cellPosition?: Position,
        region?: GridRegion,
    ): PositionWithAngle | undefined;

    handleDigitGlobally?(
        isGlobal: boolean,
        clientId: string,
        context: PuzzleContext<T>,
        cellData: T["cell"],
        defaultResult: PartialGameStateEx<T>,
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
        cache: any,
    ): Partial<CellStateEx<T>>;

    extraCellWriteModes?: CellWriteModeInfo<T>[];

    disabledCellWriteModes?: CellWriteMode[];

    initialCellWriteMode?: CellWriteMode;
    /**
     * Component for rendering single digit in a constraint clue (e.g. in a killer cage sum).
     * Also contains info about digit's average rendered width and about what would happen if rotating the digit.
     */
    digitComponentType: DigitComponentType<T>;
    /**
     * Component for rendering single digit in the cell (e.g. given digit, cornermark) - for digit-like cell data types only.
     * Optional, defaults to digitComponentType's value.
     */
    cellDataDigitComponentType?: DigitComponentType<T>;
    /**
     * Component for rendering cell data based on the full cell data object
     * (rather than cellDataDigitComponentType that can render only digits).
     * Also contains info about cell data's average rendered width.
     */
    cellDataComponentType: CellDataComponentType<T>;

    initialGameStateExtension?: T["stateEx"] | ((puzzle: PuzzleDefinition<T>) => T["stateEx"]);

    initialGridStateExtension?: T["gridStateEx"] | ((puzzle: PuzzleDefinition<T>) => T["gridStateEx"]);

    allowMove?: boolean;
    initialPosition?: Position;

    initialAngle?: number;
    angleStep?: number;
    allowRotation?: boolean;
    isFreeRotation?: boolean;
    compensateConstraintDigitAngle?: boolean;

    initialScale?: number;
    scaleStep?: number;
    allowScale?: boolean;
    isFreeScale?: boolean;
    gridWrapperHandlesScale?: boolean;

    gridBackgroundColor?: string;
    regionBackgroundColor?: string;

    modifyInitialGridState?(gridState: GridState<T>): GridState<T>;
    keepStateOnRestart?(context: PuzzleContext<T>): PartialGameStateEx<T>;

    saveStateKeySuffix?: string;

    isReady?(context: PuzzleContext<T>): boolean;

    useProcessedGameStateExtension?(context: PuzzleContext<T>): T["processedStateEx"];

    // Fallback for useProcessedGameStateExtension() when calling outside a React component
    getProcessedGameStateExtension?(context: PuzzleContext<T>): T["processedStateEx"];

    getCellTypeProps?(cell: Position, puzzle: PuzzleDefinition<T>): CellTypeProps<T>;

    processArrowDirection?(
        currentCell: Position,
        xDirection: number,
        yDirection: number,
        context: PuzzleContext<T>,
        isMainKeyboard: boolean,
    ): { cell?: Position; state?: PartialGameStateEx<T> };

    // Apply processArrowDirection() changes even if there are no selected cells
    applyArrowProcessorToNoCell?: boolean;

    applyArrowsToHistory?: boolean;

    transformCoords?(coords: Position, context: PuzzleContext<T>): Position;

    // true if transformCoords() doesn't distribute the coords evenly (if it has distortion)
    isOddTransformCoords?: boolean;

    // Get rectangles of non-modified coords that get the same transformation matrix by transformCoords
    getRegionsWithSameCoordsTransformation?(context: PuzzleContext<T>, isImportingPuzzle?: boolean): GridRegion[];

    regionSpecificUserMarks?: boolean;

    items?: Constraint<T, any>[] | ((context: PuzzleContext<T>) => Constraint<T, any>[]);

    cosmeticRegions?: boolean;
    getRegionsForRowsAndColumns?(context: PuzzleContext<T>): Constraint<T, any>[];

    supportSingleRegion?: boolean;

    getAdditionalNeighbors?(position: Position, puzzle: PuzzleDefinition<T>): Position[];

    borderColor?: string;

    getCellSelectionType?(
        cell: Position,
        context: PuzzleContext<T>,
    ): Required<Pick<CellSelectionByDataProps<T>, "color" | "strokeWidth">> | undefined;

    mainControlsComponent?: ComponentType<ControlsProps<T>>;
    controlButtons?: (ControlButtonItem<T> | undefined | false)[];

    settingsComponents?: ComponentType<SettingsContentProps<T>>[];

    maxDigitsCount?: number;

    disableCellModeLetterShortcuts?: boolean;
    disableArrowLetterShortcuts?: boolean;
    disableDigitShortcuts?: boolean;

    digitShortcuts?: (string | KeyInfo)[][];

    digitShortcutTips?: (Translatable | undefined)[];

    disableConflictChecker?: boolean;

    getSharedState?(puzzle: PuzzleDefinition<T>, state: GameStateEx<T>): any;

    setSharedState?(context: PuzzleContext<T>, newState: any): GameStateEx<T>;

    getInternalState?(puzzle: PuzzleDefinition<T>, state: GameStateEx<T>): any;

    unserializeInternalState?(puzzle: PuzzleDefinition<T>, newState: any): PartialGameStateEx<T>;

    supportedActionTypes?: GameStateActionType<any, T>[];

    handleClearAction?(context: PuzzleContext<T>, clientId: string): PartialGameStateEx<T>;

    isGlobalAction?(action: GameStateAction<any, T>, context: PuzzleContext<T>): boolean;

    getReactions?(context: PuzzleContext<T>): IReactionDisposer[];

    getPlayerScore?(context: PuzzleContext<T>, clientId: string): string | number;

    // TODO: transform into a component
    getAboveRules?(context: PuzzleContext<T>, isPortrait: boolean): ReactNode;

    postProcessPuzzle?(puzzle: PuzzleDefinition<T>): typeof puzzle;

    preProcessImportGrid?(
        puzzle: PuzzleDefinition<T>,
        importer: PuzzleImporter<T>,
        gridParser: GridParser<T, any>,
    ): void;
    postProcessImportGrid?(
        puzzle: PuzzleDefinition<T>,
        importer: PuzzleImporter<T>,
        gridParser: GridParser<T, any>,
    ): void;

    onImportPuzzleProp?<P extends keyof PuzzleDefinition<T>>(
        puzzle: PuzzleDefinition<T>,
        prop: P,
        value: PuzzleDefinition<T>[P],
    ): boolean;

    fixCellPosition?(position: Position, puzzle: PuzzleDefinition<T>): Position | undefined;

    rotationallySymmetricDigits?: boolean;

    mapImportedColors?: boolean;

    colorsImportMode?: ColorsImportMode;

    onCloseCorrectResultPopup?(context: PuzzleContext<T>): void;

    gridWrapperComponent?: ComponentType<PuzzleContextProps<T>>;

    gridFitsWrapper?: boolean;

    ignoreRowsColumnCountInTheWrapper?: boolean;

    gridControlsComponent?: ComponentType<PuzzleContextProps<T>>;

    getInitialDigits?: (context: PuzzleContext<T>) => CellsMap<T["cell"]>;

    disableFogDemo?: boolean | ((context: PuzzleContext<T>) => boolean);

    importOptionOverrides?: (context: PuzzleContext<T>) => Partial<PuzzleImportOptions>;

    getHiddenLines?: (context: PuzzleContext<T>) => PuzzleLine[];
}

// region Helper functions

export const defaultProcessArrowDirectionForRegularCellBounds = <T extends AnyPTM>(
    { left, top }: Position,
    xDirection: number,
    yDirection: number,
    {
        puzzleIndex,
        puzzle: {
            gridSize: { rowsCount, columnsCount },
        },
    }: PuzzleContext<T>,
): { cell?: Position; state?: undefined } => {
    const isTotallyValidCell = (position: Position) => {
        const { top, left } = position;
        if (top < 0 || top >= rowsCount || left < 0 || left >= columnsCount) {
            return false;
        }
        return isSelectableCell(puzzleIndex.getCellTypeProps(position));
    };

    // Try moving in the requested direction naively
    let newPosition = {
        left: left + xDirection,
        top: top + yDirection,
    };

    if (isTotallyValidCell(newPosition)) {
        return { cell: newPosition };
    }

    // If the naive new position is not valid then go in the reverse direction while it's possible
    do {
        newPosition.left -= xDirection;
        newPosition.top -= yDirection;
    } while (
        isTotallyValidCell({
            left: newPosition.left - xDirection,
            top: newPosition.top - yDirection,
        })
    );

    return { cell: newPosition };
};

export const defaultProcessArrowDirectionForCustomCellBounds = <T extends AnyPTM>(
    { left, top }: Position,
    xDirection: number,
    yDirection: number,
    { puzzleIndex }: PuzzleContext<T>,
    _isMainKeyboard?: boolean,
    enableBackwardSteps = true,
): { cell?: Position; state?: undefined } => {
    const { center, neighbors } = puzzleIndex.allCells[top][left];

    let bestDist: number | undefined = undefined;
    let bestCell: Position | undefined = undefined;

    for (const neighbor of neighbors.items) {
        if (!isSelectableCell(puzzleIndex.getCellTypeProps(neighbor))) {
            continue;
        }

        const center2 = puzzleIndex.allCells[neighbor.top][neighbor.left].center;
        const vector = getLineVector({ start: center, end: center2 });

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

    return { cell: bestCell };
};

export const defaultProcessArrowDirection = <T extends AnyPTM>(
    position: Position,
    xDirection: number,
    yDirection: number,
    context: PuzzleContext<T>,
    isMainKeyboard?: boolean,
    enableBackwardSteps?: boolean,
): { cell?: Position; state?: undefined } => {
    return context.puzzle.customCellBounds
        ? defaultProcessArrowDirectionForCustomCellBounds(
              position,
              xDirection,
              yDirection,
              context,
              isMainKeyboard,
              enableBackwardSteps,
          )
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
): ReturnType<Required<PuzzleTypeManager<T>>["getCellSelectionType"]> => {
    const { puzzle, selectedCells } = context;

    if (context.selectedCellsCount === 0) {
        return undefined;
    }

    const isSamePosition = getIsSamePuzzlePosition(puzzle);
    const doesRegionContainCell = (cells: Position[], cell: Position) =>
        cells.some((cell2) => isSamePosition(cell2, cell));
    const seenRegions = context.allItems
        .filter(({ tags }) => tags?.includes(regionTag))
        .map(({ cells }) => cells)
        .filter((region) => doesRegionContainCell(region, cell));
    const isSeen = selectedCells.items.every((selectedCell) =>
        seenRegions.some((region) => doesRegionContainCell(region, selectedCell)),
    );
    return isSeen
        ? {
              color: CellSelectionColor.secondary,
              strokeWidth: 1,
          }
        : undefined;
};

// endregion
