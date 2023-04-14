import {ReactNode} from "react";
import {PuzzleContext} from "./PuzzleContext";
import {getDefaultDigitsCount, PuzzleDefinition} from "./PuzzleDefinition";
import {CellDigits} from "../../components/sudoku/cell/CellDigits";
import {CellBackground} from "../../components/sudoku/cell/CellBackground";
import {CellExactPosition} from "./CellExactPosition";
import {CellDataSet} from "./CellDataSet";
import {incrementArrayItem} from "../../utils/array";
import {useEventListener} from "../../hooks/useEventListener";
import type {
    GestureHandler,
    GestureIsValidProps,
    GestureOnContinueProps,
    GestureOnEndProps,
    GestureOnStartProps
} from "../../utils/gestures";
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
import {isSamePosition, Position} from "../layout/Position";
import {GestureFinishReason} from "../../utils/gestures";
import {getReadOnlySafeOnStateChange} from "../../hooks/sudoku/useReadOnlySafeContext";
import {Rect} from "../layout/Rect";
import {CellWriteMode} from "./CellWriteMode";
import {AnyPTM} from "./PuzzleTypeMap";

export interface CellWriteModeInfo<T extends AnyPTM> {
    mode: CellWriteMode | number;
    hotKeyStr?: string[];
    isActiveForPuzzle?: (puzzle: PuzzleDefinition<T>, includeHidden: boolean) => boolean;
    isDigitMode?: boolean;
    isNoSelectionMode?: boolean;
    disableCellHandlers?: boolean;
    applyToWholeField?: boolean;
    digitsCount?: number | ((context: PuzzleContext<T>) => number);
    handlesRightMouseClick?: boolean;
    buttonContent?: (context: PuzzleContext<T>, cellData: T["cell"], cellSize: number, index: number) => ReactNode;
    getCurrentButton?: (context: PuzzleContext<T>) => (number | undefined);
    setCurrentButton?: (context: PuzzleContext<T>, index: number) => void;
    isValidGesture?(isCurrentCellWriteMode: boolean, props: GestureIsValidProps, context: PuzzleContext<T>): boolean;
    onCornerClick?: (
        context: PuzzleContext<T>,
        cellPosition: Position,
        exactPosition: CellExactPosition,
        isRightButton: boolean,
    ) => void;
    onCornerEnter?: (context: PuzzleContext<T>, cellPosition: Position, exactPosition: CellExactPosition) => void;
    onGestureStart?(props: GestureOnStartProps, context: PuzzleContext<T>, isRightButton: boolean): void;
    onMove?(props: GestureOnContinueProps, context: PuzzleContext<T>, fieldRect: Rect): void;
    onGestureEnd?(props: GestureOnEndProps, context: PuzzleContext<T>): void;
    onOutsideClick?(context: PuzzleContext<T>): void;
}

export const allCellWriteModeInfos = <T extends AnyPTM>(): CellWriteModeInfo<T>[] => [
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
    ShadingCellWriteModeInfo(),
    LinesCellWriteModeInfo(),
    MoveCellWriteModeInfo(),
];

export const getAllowedCellWriteModeInfos = <T extends AnyPTM>(
    puzzle: PuzzleDefinition<T>,
    includeHidden = false,
): CellWriteModeInfo<T>[] => {
    const {
        digitsCount,
        typeManager: {
            extraCellWriteModes = [],
            disabledCellWriteModes = [],
            hiddenCellWriteModes = [],
        },
    } = puzzle;

    return [
        ...allCellWriteModeInfos<T>().filter(
            ({mode, isDigitMode, isActiveForPuzzle}) => !disabledCellWriteModes.includes(mode) && (
                isDigitMode
                    ? digitsCount !== 0
                    : isActiveForPuzzle?.(puzzle, includeHidden) !== false
            )
        ),
        ...extraCellWriteModes,
        ...(includeHidden ? hiddenCellWriteModes : []),
    ];
};

export const incrementCellWriteMode = <T extends AnyPTM>(allowedModes: CellWriteModeInfo<T>[], mode: CellWriteMode, increment: number): CellWriteMode =>
    incrementArrayItem(allowedModes, item => item.mode === mode, increment).mode;

export const resolveDigitsCountInCellWriteMode = <T extends AnyPTM>(context: PuzzleContext<T>) => {
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

export const useCellWriteModeHotkeys = <T extends AnyPTM>(context: PuzzleContext<T>) => {
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

export const getCellWriteModeGestureHandler = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    {
        mode,
        isValidGesture = (isCurrentCellWriteMode: boolean, {gesture: {pointers}}: GestureIsValidProps) =>
            isCurrentCellWriteMode && pointers.length === 1,
        isNoSelectionMode,
        onMove,
        onCornerClick,
        onCornerEnter,
        onGestureStart,
        onGestureEnd,
        handlesRightMouseClick,
    }: CellWriteModeInfo<T>,
    isDeleteSelectedCellsStroke: boolean,
    setIsDeleteSelectedCellsStroke: (value: boolean) => void,
    fieldRect: Rect,
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
        onStart: (props) => {
            const {extraData, event: {button}} = props;
            onGestureStart?.(props, context, !!button);
            if (isCellGestureExtraData(extraData)) {
                onCornerClick?.(context, extraData.cell, extraData.exact, !!button);
            }
        },
        onContinue: (props) => {
            const {prevData: {extraData: prevData}, currentData: {extraData: currentData}} = props;

            if (
                isCellGestureExtraData(currentData) &&
                (!isCellGestureExtraData(prevData) || JSON.stringify(prevData.exact) !== JSON.stringify(currentData.exact))
            ) {
                onCornerEnter?.(context, currentData.cell, currentData.exact);
            }

            onMove?.(props, context, fieldRect);
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
