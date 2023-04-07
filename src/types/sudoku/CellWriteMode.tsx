import {ReactNode} from "react";
import {PuzzleContext} from "./PuzzleContext";
import {getDefaultDigitsCount, PuzzleDefinition} from "./PuzzleDefinition";
import {CellDigits} from "../../components/sudoku/cell/CellDigits";
import {CellBackground} from "../../components/sudoku/cell/CellBackground";
import {CellExactPosition} from "./CellExactPosition";
import {CellDataSet} from "./CellDataSet";
import {incrementArrayItem} from "../../utils/array";
import {useEventListener} from "../../hooks/useEventListener";
import type {GestureHandler, GestureIsValidProps, GestureOnContinueProps, GestureOnEndProps} from "../../utils/gestures";
import {LinesCellWriteModeInfo} from "./cellWriteModes/lines";
import {MoveCellWriteModeInfo} from "./cellWriteModes/move";
import {ShadingCellWriteModeInfo} from "./cellWriteModes/shading";
import {getCurrentCellWriteModeInfoByGestureExtraData, isCellGestureExtraData} from "./CellGestureExtraData";
import {
    gameStateClearSelectedCells,
    gameStateHandleCellDoubleClick,
    gameStateSetSelectedCells,
    gameStateToggleSelectedCells
} from "./GameState";
import {isSamePosition} from "../layout/Position";
import {GestureFinishReason} from "../../utils/gestures";
import {getReadOnlySafeOnStateChange} from "../../hooks/sudoku/useReadOnlySafeContext";

export enum CellWriteMode {
    main,
    corner,
    center,
    color,
    lines,
    move,
    quads,
    custom,
    shading,
}

export interface CellWriteModeInfo<CellType, ExType, ProcessedExType> {
    mode: CellWriteMode | number;
    hotKeyStr?: string[];
    isActiveForPuzzle?: (puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>, includeHidden: boolean) => boolean;
    isDigitMode?: boolean;
    isNoSelectionMode?: boolean;
    disableCellHandlers?: boolean;
    applyToWholeField?: boolean;
    digitsCount?: number | ((context: PuzzleContext<CellType, ExType, ProcessedExType>) => number);
    handlesRightMouseClick?: boolean;
    buttonContent?: (
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        cellData: CellType,
        cellSize: number,
        index: number
    ) => ReactNode;
    getCurrentButton?: (context: PuzzleContext<CellType, ExType, ProcessedExType>) => (number | undefined);
    setCurrentButton?: (context: PuzzleContext<CellType, ExType, ProcessedExType>, index: number) => void;
    isValidGesture?(isCurrentCellWriteMode: boolean, props: GestureIsValidProps, context: PuzzleContext<CellType, ExType, ProcessedExType>): boolean;
    onCornerClick?: (
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        position: CellExactPosition,
        isRightButton: boolean,
    ) => void;
    onCornerEnter?: (
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        position: CellExactPosition
    ) => void;
    onMove?(props: GestureOnContinueProps, context: PuzzleContext<CellType, ExType, ProcessedExType>): void;
    onGestureEnd?(props: GestureOnEndProps, context: PuzzleContext<CellType, ExType, ProcessedExType>): void;
}

export const allCellWriteModeInfos: CellWriteModeInfo<any, any, any>[] = [
    {
        mode: CellWriteMode.main,
        isDigitMode: true,
    },
    {
        mode: CellWriteMode.corner,
        hotKeyStr: ["Shift"],
        isDigitMode: true,
        buttonContent: (context, cellData, cellSize) => <CellDigits
            context={context}
            data={{cornerDigits: new CellDataSet(context.puzzle, [cellData])}}
            size={cellSize}
        />,
    },
    {
        mode: CellWriteMode.center,
        hotKeyStr: ["Ctrl"],
        isDigitMode: true,
        buttonContent: (context, cellData, cellSize) => <CellDigits
            context={context}
            data={{centerDigits: new CellDataSet(context.puzzle, [cellData])}}
            size={cellSize}
        />,
    },
    {
        mode: CellWriteMode.color,
        hotKeyStr: ["Ctrl+Shift", "Ctrl+Alt+Shift"],
        digitsCount: 10,
        isActiveForPuzzle: ({disableColoring, enableShading}) => !disableColoring && !enableShading,
        buttonContent: (context, _, cellSize, index) => <CellBackground
            context={context}
            colors={new CellDataSet(context.puzzle, [index])}
            size={cellSize}
        />,
    },
    {mode: CellWriteMode.shading, ...ShadingCellWriteModeInfo},
    {mode: CellWriteMode.lines, ...LinesCellWriteModeInfo},
    {mode: CellWriteMode.move, ...MoveCellWriteModeInfo},
];

export const getAllowedCellWriteModeInfos = <CellType, ExType, ProcessedExType>(
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    includeHidden = false,
): CellWriteModeInfo<CellType, ExType, ProcessedExType>[] => {
    const {
        digitsCount,
        typeManager: {extraCellWriteModes = [], hiddenCellWriteModes = []},
    } = puzzle;

    return [
        ...allCellWriteModeInfos.filter(
            ({isDigitMode, isActiveForPuzzle}) =>
                isDigitMode
                    ? digitsCount !== 0
                    : isActiveForPuzzle?.(puzzle, includeHidden) !== false
        ),
        ...extraCellWriteModes,
        ...(includeHidden ? hiddenCellWriteModes : []),
    ];
};

export const incrementCellWriteMode = (allowedModes: CellWriteModeInfo<any, any, any>[], mode: CellWriteMode, increment: number): CellWriteMode =>
    incrementArrayItem(allowedModes, item => item.mode === mode, increment).mode;

export const resolveDigitsCountInCellWriteMode = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>
) => {
    const {
        puzzle,
        state,
    } = context;

    const {
        digitsCount = getDefaultDigitsCount(puzzle),
    } = puzzle;

    const {
        processed: {
            cellWriteModeInfo: {digitsCount: digitsCountFunc = digitsCount},
        },
    } = state;

    return typeof digitsCountFunc === "function"
        ? digitsCountFunc(context)
        : digitsCountFunc;
};

export const useCellWriteModeHotkeys = <CellType, ExType = {}, ProcessedExType = {}>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
) => {
    const {
        puzzle,
        state,
        onStateChange,
    } = context;

    const {
        typeManager: {disableCellModeLetterShortcuts},
    } = puzzle;

    const {
        persistentCellWriteMode,
        isShowingSettings,
    } = state;

    const allowedCellWriteModes = getAllowedCellWriteModeInfos(puzzle);

    const setCellWriteMode = (persistentCellWriteMode: CellWriteMode) => onStateChange({persistentCellWriteMode});

    useEventListener(window, "keydown", (ev) => {
        if (isShowingSettings) {
            return;
        }

        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;
        const anyKey = ctrlKey || shiftKey;

        for (const [index, {mode}] of allowedCellWriteModes.entries()) {
            if (!disableCellModeLetterShortcuts && code === ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM"][index] && !anyKey) {
                setCellWriteMode(mode);
                ev.preventDefault();
            }
        }

        switch (code) {
            case "PageUp":
                setCellWriteMode(incrementCellWriteMode(allowedCellWriteModes, persistentCellWriteMode, -1));
                ev.preventDefault();
                break;
            case "PageDown":
                setCellWriteMode(incrementCellWriteMode(allowedCellWriteModes, persistentCellWriteMode, +1));
                ev.preventDefault();
                break;
        }
    });
};

export const getCellWriteModeGestureHandler = <CellType, ExType, ProcessedExType>(
    context: PuzzleContext<CellType, ExType, ProcessedExType>,
    {
        mode,
        isValidGesture = (isCurrentCellWriteMode: boolean, {gesture: {pointers}}: GestureIsValidProps) =>
            isCurrentCellWriteMode && pointers.length === 1,
        isNoSelectionMode,
        onMove,
        onCornerClick,
        onCornerEnter,
        onGestureEnd,
        handlesRightMouseClick,
    }: CellWriteModeInfo<CellType, ExType, ProcessedExType>,
    isDeleteSelectedCellsStroke: boolean,
    setIsDeleteSelectedCellsStroke: (value: boolean) => void,
): GestureHandler => {
    const onStateChange = getReadOnlySafeOnStateChange(context);

    const common: Pick<GestureHandler, "isValidGesture"> = {
        isValidGesture: (props) => isValidGesture(
            getCurrentCellWriteModeInfoByGestureExtraData(context, props.extraData).mode === mode,
            props,
            context,
        ),
    };

    if (!isNoSelectionMode) {
        return {
            contextId: "cell-selection",
            ...common,
            onStart: ({extraData, event}) => {
                const {ctrlKey, metaKey, shiftKey} = event;
                const isMultiSelection = ctrlKey || metaKey || shiftKey || context.state.isMultiSelection;

                if (!isCellGestureExtraData(extraData)) {
                    return;
                }

                const cellPosition = extraData.cell;

                setIsDeleteSelectedCellsStroke(isMultiSelection && context.state.selectedCells.contains(cellPosition));
                onStateChange(
                    gameState => isMultiSelection
                        ? gameStateToggleSelectedCells(gameState, [cellPosition])
                        : gameStateSetSelectedCells(gameState, [cellPosition])
                );
            },
            onContinue: ({prevData, currentData}) => {
                const [prevCell, currentCell] = [prevData, currentData].map(
                    ({extraData}) => isCellGestureExtraData(extraData) && !extraData.skipEnter ? extraData.cell : undefined
                );
                if (currentCell && (!prevCell || !isSamePosition(prevCell, currentCell))) {
                    onStateChange(gameState => gameStateToggleSelectedCells(gameState, [currentCell], !isDeleteSelectedCellsStroke));
                }
            },
            onEnd: ({reason}) => {
                if (reason === GestureFinishReason.startNewGesture) {
                    onStateChange(gameStateClearSelectedCells);
                }
            },
            onDoubleClick: ({extraData, event: {ctrlKey, metaKey, shiftKey}}) => {
                if (!isCellGestureExtraData(extraData) || getCurrentCellWriteModeInfoByGestureExtraData(context, extraData).mode !== mode) {
                    return false;
                }

                onStateChange(gameStateHandleCellDoubleClick(
                    context,
                    extraData.cell,
                    ctrlKey || metaKey || shiftKey
                ));
                return true;
            },
        }
    }

    return {
        contextId: `cell-write-mode-${mode}`,
        ...common,
        onStart: ({extraData, event: {button}}) => {
            if (isCellGestureExtraData(extraData)) {
                onCornerClick?.(context, extraData.exact, !!button);
            }
        },
        onContinue: (props) => {
            const {prevData: {extraData: prevData}, currentData: {extraData: currentData}} = props;

            if (
                isCellGestureExtraData(currentData) &&
                (!isCellGestureExtraData(prevData) || JSON.stringify(prevData.exact) !== JSON.stringify(currentData.exact))
            ) {
                onCornerEnter?.(context, currentData.exact);
            }

            onMove?.(props, context);
        },
        onEnd: (props) => onGestureEnd?.(props, context),
        onContextMenu: ({event, extraData}) => {
            if (handlesRightMouseClick && getCurrentCellWriteModeInfoByGestureExtraData(context, extraData).mode === mode) {
                event.preventDefault();
                return true;
            }
            return false;
        },
    };
};
