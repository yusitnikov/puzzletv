import {ReactNode} from "react";
import {PuzzleContext} from "./PuzzleContext";
import {getDefaultDigitsCount, PuzzleDefinition} from "./PuzzleDefinition";
import {CellDigits} from "../../components/sudoku/cell/CellDigits";
import {CellBackground} from "../../components/sudoku/cell/CellBackground";
import {
    gameStateContinueMultiLine,
    gameStateResetCurrentMultiLine,
    gameStateStartMultiLine,
    getAbsoluteScaleByLog,
    getScaleLog,
    PartialGameStateEx
} from "./GameState";
import {CellExactPosition} from "./CellExactPosition";
import {CellDataSet} from "./CellDataSet";
import {applyCurrentMultiLineAction, shadingAction, shadingStartAction} from "./GameStateAction";
import {incrementArrayItem} from "../../utils/array";
import {useEventListener} from "../../hooks/useEventListener";
import {
    GestureFinishReason,
    GestureIsValidProps,
    GestureOnContinueProps,
    GestureOnEndProps
} from "../../utils/gestures";

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
    isDigitMode?: boolean;
    isNoSelectionMode?: boolean;
    disableCellHandlers?: boolean;
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
        buttonContent: (context, _, cellSize, index) => <CellBackground
            context={context}
            colors={new CellDataSet(context.puzzle, [index])}
            size={cellSize}
        />,
    },
    {
        mode: CellWriteMode.shading,
        // color and shading are never together, so it's ok to have the same hotkey
        hotKeyStr: ["Ctrl+Shift", "Ctrl+Alt+Shift"],
        handlesRightMouseClick: true,
        isNoSelectionMode: true,
        onCornerClick: (context, position, isRightButton) => {
            context.onStateChange(shadingStartAction(
                context,
                {
                    top: Math.floor(position.center.top),
                    left: Math.floor(position.center.left),
                },
                isRightButton
            ));
        },
        onCornerEnter: (context, position) =>
            context.onStateChange(shadingAction(
                context,
                {
                    top: Math.floor(position.center.top),
                    left: Math.floor(position.center.left),
                },
                context.state.dragAction
            )),
    },
    {
        mode: CellWriteMode.lines,
        hotKeyStr: ["Alt"],
        isNoSelectionMode: true,
        onCornerClick: (context, position) =>
            context.onStateChange(state => gameStateStartMultiLine({...context, state}, position)),
        onCornerEnter: (context, position) =>
            context.onStateChange(state => gameStateContinueMultiLine(
                {...context, state},
                position
            )),
        onGestureEnd: (
            {gesture: {isClick, pointers: [{start: {event: {button}}}]}, reason},
            context
        ) => context.onStateChange(
            reason === GestureFinishReason.pointerUp
                ? applyCurrentMultiLineAction(context, isClick, !!button)
                : gameStateResetCurrentMultiLine
        ),
        digitsCount: ({puzzle: {disableLineColors}}) => disableLineColors ? 0 : 9,
        buttonContent: (context, _, cellSize, index) => <CellBackground
            context={context}
            colors={new CellDataSet(context.puzzle, [index])}
            size={cellSize}
            noOpacity={true}
        />,
        getCurrentButton: ({puzzle: {disableLineColors}, state: {selectedColor}}) =>
            disableLineColors ? undefined : selectedColor,
        setCurrentButton: ({onStateChange}, index) => onStateChange({selectedColor: index}),
        handlesRightMouseClick: true,
    },
    {
        mode: CellWriteMode.move,
        hotKeyStr: ["Alt+Shift"],
        isNoSelectionMode: true,
        digitsCount: 0,
        isValidGesture: (isCurrentCellWriteMode, {gesture: {pointers}}) =>
            isCurrentCellWriteMode || pointers.length > 1,
        onMove: (
            {prevMetrics, currentMetrics},
            {
                puzzle: {
                    loopHorizontally,
                    loopVertically,
                    typeManager: {allowRotation, allowScale},
                },
                cellSize,
                onStateChange,
            }
        ) =>
            onStateChange(({loopOffset: {top, left}, angle, scale}) => ({
                loopOffset: {
                    left: left + (loopHorizontally ? (currentMetrics.x - prevMetrics.x) / cellSize : 0),
                    top: top + (loopVertically ? (currentMetrics.y - prevMetrics.y) / cellSize : 0),
                },
                animatingLoopOffset: false,
                angle: angle + (allowRotation ? currentMetrics.rotation - prevMetrics.rotation : 0),
                animatingAngle: false,
                scale: scale * (allowScale ? currentMetrics.scale / prevMetrics.scale : 1),
                animatingScale: false,
            })),
        onGestureEnd: (
            props,
            {
                puzzle: {
                    typeManager: {
                        angleStep,
                        allowRotation,
                        isFreeRotation,
                        scaleStep,
                        allowScale,
                        isFreeScale,
                    },
                },
                onStateChange,
            }
        ) => onStateChange(({angle, scale}) => {
            let result: PartialGameStateEx<any, any> = {};
            if (allowRotation && !isFreeRotation && angleStep) {
                result = {
                    ...result,
                    angle: Math.round(angle / angleStep) * angleStep,
                    animatingAngle: true,
                };
            }
            if (allowScale && !isFreeScale) {
                result = {
                    ...result,
                    scale: getAbsoluteScaleByLog(Math.round(getScaleLog(scale, scaleStep)), scaleStep),
                    animatingScale: true,
                };
            }
            return result;
        }),
    },
];

export const getAllowedCellWriteModeInfos = <CellType, ExType, ProcessedExType>(
    {
        allowDrawing = [],
        loopHorizontally = false,
        loopVertically = false,
        enableShading = false,
        disableColoring = false,
        digitsCount,
        typeManager: {extraCellWriteModes = [], hiddenCellWriteModes = [], allowRotation, allowScale},
    }: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    includeHidden = false,
): CellWriteModeInfo<CellType, ExType, ProcessedExType>[] => [
    ...allCellWriteModeInfos.filter(({mode, isDigitMode}) => {
        if (isDigitMode) {
            return digitsCount !== 0;
        }

        switch (mode) {
            case CellWriteMode.color:
                return !disableColoring && !enableShading;
            case CellWriteMode.shading:
                return enableShading;
            case CellWriteMode.lines:
                return allowDrawing.length !== 0;
            case CellWriteMode.move:
                return loopHorizontally || loopVertically || (includeHidden && (allowRotation || allowScale));
            default:
                return true;
        }
    }),
    ...extraCellWriteModes,
    ...(includeHidden ? hiddenCellWriteModes : []),
];

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
