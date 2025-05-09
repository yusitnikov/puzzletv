import { ComponentType, ReactNode } from "react";
import { PuzzleContext } from "./PuzzleContext";
import { PuzzleDefinition } from "./PuzzleDefinition";
import { CellDigits } from "../../components/puzzle/cell/CellDigits";
import { CellBackground } from "../../components/puzzle/cell/CellBackground";
import { CellDataSet } from "./CellDataSet";
import { incrementArrayItem } from "../../utils/array";
import { useEventListener } from "../../hooks/useEventListener";
import type {
    GestureHandler,
    GestureIsValidProps,
    GestureOnContinueProps,
    GestureOnEndProps,
    GestureOnStartProps,
} from "../../utils/gestures";
import { LinesCellWriteModeInfo } from "./cellWriteModes/lines";
import { MoveCellWriteModeInfo } from "./cellWriteModes/move";
import { ShadingCellWriteModeInfo } from "./cellWriteModes/shading";
import {
    CellGestureExtraData,
    getCurrentCellWriteModeInfoByGestureExtraData,
    isCellGestureExtraData,
} from "./CellGestureExtraData";
import {
    gameStateClearSelectedCells,
    gameStateHandleCellDoubleClick,
    gameStateSetSelectedCells,
    gameStateToggleSelectedCells,
} from "./GameState";
import { isSamePosition } from "../layout/Position";
import { GestureFinishReason } from "../../utils/gestures";
import { Rect } from "../layout/Rect";
import { CellWriteMode } from "./CellWriteMode";
import { AnyPTM } from "./PuzzleTypeMap";
import { ControlButtonItemProps } from "../../components/puzzle/controls/ControlButtonsManager";
import { MainDigitModeButton } from "../../components/puzzle/controls/MainDigitModeButton";
import { CornerDigitModeButton } from "../../components/puzzle/controls/CornerDigitModeButton";
import { CenterDigitModeButton } from "../../components/puzzle/controls/CenterDigitModeButton";
import { ColorDigitModeButton } from "../../components/puzzle/controls/ColorDigitModeButton";
import { PartiallyTranslatable } from "../translations/Translatable";
import { settings } from "../layout/Settings";

export interface CellWriteModeInfo<T extends AnyPTM> {
    mode: CellWriteMode | number;
    title?: PartiallyTranslatable;
    hotKeyStr?: string[];
    isActiveForPuzzle?: (puzzle: PuzzleDefinition<T>, includeHidden: boolean) => boolean;
    isDigitMode?: boolean;
    isNoSelectionMode?: boolean;
    disableCellHandlers?: boolean;
    applyToWholeGrid?: boolean;
    digitsCount?: number | ((context: PuzzleContext<T>) => number);
    handlesRightMouseClick?: boolean;
    mainButtonContent?: ComponentType<ControlButtonItemProps<T>>;
    secondaryButtonContent?: (
        context: PuzzleContext<T>,
        cellData: T["cell"],
        cellSize: number,
        index: number,
    ) => ReactNode;
    getCurrentSecondaryButton?: (context: PuzzleContext<T>) => number | undefined;
    setCurrentSecondaryButton?: (context: PuzzleContext<T>, index: number) => void;
    isValidGesture?(
        isCurrentCellWriteMode: boolean,
        props: GestureIsValidProps<PuzzleContext<T>>,
        context: PuzzleContext<T>,
    ): boolean;
    onCornerClick?: (
        props: GestureOnStartProps<PuzzleContext<T>>,
        context: PuzzleContext<T>,
        cellData: CellGestureExtraData,
        isRightButton: boolean,
    ) => void;
    onCornerEnter?: (
        props: GestureOnContinueProps<PuzzleContext<T>>,
        context: PuzzleContext<T>,
        cellData: CellGestureExtraData,
    ) => void;
    onGestureStart?(
        props: GestureOnStartProps<PuzzleContext<T>>,
        context: PuzzleContext<T>,
        isRightButton: boolean,
    ): void;
    onMove?(props: GestureOnContinueProps<PuzzleContext<T>>, context: PuzzleContext<T>, gridRect: Rect): void;
    onGestureEnd?(props: GestureOnEndProps<PuzzleContext<T>>, context: PuzzleContext<T>): void;
    onOutsideClick?(context: PuzzleContext<T>): void;
}

export const allCellWriteModeInfos = <T extends AnyPTM>(): CellWriteModeInfo<T>[] => [
    {
        mode: CellWriteMode.main,
        mainButtonContent: MainDigitModeButton,
        isDigitMode: true,
    },
    {
        mode: CellWriteMode.corner,
        mainButtonContent: CornerDigitModeButton,
        hotKeyStr: ["Shift"],
        isDigitMode: true,
        secondaryButtonContent: (context, cellData, cellSize) => (
            <CellDigits
                context={context}
                data={{ cornerDigits: new CellDataSet(context, [cellData]) }}
                size={cellSize}
            />
        ),
    },
    {
        mode: CellWriteMode.center,
        mainButtonContent: CenterDigitModeButton,
        hotKeyStr: ["Ctrl"],
        isDigitMode: true,
        secondaryButtonContent: (context, cellData, cellSize) => (
            <CellDigits
                context={context}
                data={{ centerDigits: new CellDataSet(context, [cellData]) }}
                size={cellSize}
            />
        ),
    },
    {
        mode: CellWriteMode.color,
        mainButtonContent: ColorDigitModeButton,
        hotKeyStr: ["Ctrl+Shift", "Ctrl+Alt+Shift"],
        digitsCount: 10,
        isActiveForPuzzle: ({ disableColoring, enableShading }) => !disableColoring && !enableShading,
        secondaryButtonContent: (context, _, cellSize, index) => (
            <CellBackground context={context} colors={[index]} size={cellSize} />
        ),
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
        typeManager: { extraCellWriteModes = [], disabledCellWriteModes = [] },
    } = puzzle;

    return [
        ...allCellWriteModeInfos<T>().filter(
            ({ mode, isDigitMode, isActiveForPuzzle }) =>
                !disabledCellWriteModes.includes(mode) &&
                (isDigitMode ? digitsCount !== 0 : isActiveForPuzzle?.(puzzle, includeHidden) !== false),
        ),
        ...extraCellWriteModes.filter(({ mainButtonContent }) => mainButtonContent || includeHidden),
    ];
};

export const incrementCellWriteMode = <T extends AnyPTM>(
    allowedModes: CellWriteModeInfo<T>[],
    mode: CellWriteMode,
    increment: number,
): CellWriteMode => incrementArrayItem(allowedModes, (item) => item.mode === mode, increment).mode;

export const useCellWriteModeHotkeys = <T extends AnyPTM>(context: PuzzleContext<T>) => {
    const { puzzle, visibleCellWriteModeInfos, persistentCellWriteMode } = context;

    const {
        typeManager: { disableCellModeLetterShortcuts },
    } = puzzle;

    const setCellWriteMode = (persistentCellWriteMode: CellWriteMode) =>
        context.onStateChange({ persistentCellWriteMode });

    useEventListener(window, "keydown", (ev) => {
        if (settings.isOpened) {
            return;
        }

        const { code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey } = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;
        const anyKey = ctrlKey || shiftKey;

        for (const [index, { mode }] of visibleCellWriteModeInfos.entries()) {
            if (
                !disableCellModeLetterShortcuts &&
                code === ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM"][index] &&
                !anyKey
            ) {
                setCellWriteMode(mode);
                ev.preventDefault();
            }
        }

        switch (code) {
            case "PageUp":
                setCellWriteMode(incrementCellWriteMode(visibleCellWriteModeInfos, persistentCellWriteMode, -1));
                ev.preventDefault();
                break;
            case "PageDown":
                setCellWriteMode(incrementCellWriteMode(visibleCellWriteModeInfos, persistentCellWriteMode, +1));
                ev.preventDefault();
                break;
        }
    });
};

export const getCellWriteModeGestureHandler = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    {
        mode,
        isValidGesture = (
            isCurrentCellWriteMode: boolean,
            { gesture: { pointers } }: GestureIsValidProps<PuzzleContext<T>>,
        ) => isCurrentCellWriteMode && pointers.length === 1,
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
    gridRect: Rect,
): GestureHandler<PuzzleContext<T>> => {
    const { readOnlySafeContext } = context;

    const common: Pick<GestureHandler<PuzzleContext<T>>, "isValidGesture"> = {
        isValidGesture: (props) =>
            isValidGesture(
                getCurrentCellWriteModeInfoByGestureExtraData(context, props.extraData).mode === mode,
                props,
                context,
            ),
    };

    if (!isNoSelectionMode) {
        return {
            contextId: "cell-selection",
            ...common,
            onStart: ({ extraData, event }) => {
                const { ctrlKey, metaKey, shiftKey } = event;
                const isMultiSelection = ctrlKey || metaKey || shiftKey || context.isMultiSelection;

                if (!isCellGestureExtraData(extraData)) {
                    return context.clone();
                }

                const cellPosition = extraData.cell;

                setIsDeleteSelectedCellsStroke(
                    isMultiSelection && context.isSelectedCell(cellPosition.top, cellPosition.left),
                );
                readOnlySafeContext.onStateChange((context) =>
                    isMultiSelection
                        ? gameStateToggleSelectedCells(context, [cellPosition])
                        : gameStateSetSelectedCells(context, [cellPosition]),
                );

                return context.clone();
            },
            onContinue: ({ prevData, currentData }) => {
                const [prevCell, currentCell] = [prevData, currentData].map(({ extraData }) =>
                    isCellGestureExtraData(extraData) && !extraData.skipEnter ? extraData.cell : undefined,
                );
                if (currentCell && (!prevCell || !isSamePosition(prevCell, currentCell))) {
                    readOnlySafeContext.onStateChange((context) =>
                        gameStateToggleSelectedCells(context, [currentCell], !isDeleteSelectedCellsStroke),
                    );
                }
            },
            onEnd: ({ reason }) => {
                if (reason === GestureFinishReason.startNewGesture) {
                    readOnlySafeContext.onStateChange(gameStateClearSelectedCells);
                }
            },
            onDoubleClick: ({ extraData, event: { ctrlKey, metaKey, shiftKey } }) => {
                if (
                    !isCellGestureExtraData(extraData) ||
                    getCurrentCellWriteModeInfoByGestureExtraData(context, extraData).mode !== mode
                ) {
                    return false;
                }

                readOnlySafeContext.onStateChange(
                    gameStateHandleCellDoubleClick(context, extraData.cell, ctrlKey || metaKey || shiftKey),
                );
                return true;
            },
        };
    }

    return {
        contextId: `cell-write-mode-${mode}`,
        ...common,
        onStart: (props) => {
            const startContext = context.clone();
            const {
                extraData,
                event: { button },
            } = props;
            onGestureStart?.(props, context, !!button);
            if (isCellGestureExtraData(extraData)) {
                onCornerClick?.(props, context, extraData, !!button);
            }
            readOnlySafeContext.onStateChange({ gestureCellWriteMode: mode });
            return startContext;
        },
        onContinue: (props) => {
            const {
                prevData: { extraData: prevData },
                currentData: { extraData: currentData },
            } = props;

            if (
                isCellGestureExtraData(currentData) &&
                (!isCellGestureExtraData(prevData) ||
                    JSON.stringify(prevData.exact) !== JSON.stringify(currentData.exact))
            ) {
                onCornerEnter?.(props, context, currentData);
            }

            onMove?.(props, context, gridRect);
        },
        onEnd: (props) => {
            onGestureEnd?.(props, context);
            readOnlySafeContext.onStateChange({ gestureCellWriteMode: undefined });
        },
        onContextMenu: ({ event, extraData }) => {
            if (
                handlesRightMouseClick &&
                getCurrentCellWriteModeInfoByGestureExtraData(context, extraData).mode === mode
            ) {
                event.preventDefault();
                return true;
            }
            return false;
        },
    };
};
