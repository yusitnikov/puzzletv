import {ReactNode} from "react";
import {PuzzleContext} from "./PuzzleContext";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {CellDigits} from "../../components/sudoku/cell/CellDigits";
import {CellBackground} from "../../components/sudoku/cell/CellBackground";
import {gameStateContinueMultiLine, gameStateStartMultiLine} from "./GameState";
import {CellExactPosition} from "./CellExactPosition";
import {CellDataSet} from "./CellDataSet";

export enum CellWriteMode {
    main,
    corner,
    center,
    color,
    lines,
    move,
    quads,
    custom,
}

export interface CellWriteModeInfo<CellType, ExType, ProcessedExType> {
    mode: CellWriteMode | number;
    hotKeyStr?: string;
    isDigitMode?: boolean;
    isNoSelectionMode?: boolean;
    digitsCount?: number;
    buttonContent?: (
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        cellData: CellType,
        cellSize: number,
        index: number
    ) => ReactNode;
    onCornerClick?: (
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        position: CellExactPosition
    ) => void;
    onCornerEnter?: (
        context: PuzzleContext<CellType, ExType, ProcessedExType>,
        position: CellExactPosition
    ) => void;
}

export const allCellWriteModeInfos: CellWriteModeInfo<any, any, any>[] = [
    {
        mode: CellWriteMode.main,
        isDigitMode: true,
    },
    {
        mode: CellWriteMode.corner,
        hotKeyStr: "Shift",
        isDigitMode: true,
        buttonContent: (context, cellData, cellSize) => <CellDigits
            context={context}
            data={{cornerDigits: new CellDataSet(context.puzzle, [cellData])}}
            size={cellSize}
        />,
    },
    {
        mode: CellWriteMode.center,
        hotKeyStr: "Ctrl",
        isDigitMode: true,
        buttonContent: (context, cellData, cellSize) => <CellDigits
            context={context}
            data={{centerDigits: new CellDataSet(context.puzzle, [cellData])}}
            size={cellSize}
        />,
    },
    {
        mode: CellWriteMode.color,
        hotKeyStr: "Ctrl+Shift",
        digitsCount: 9,
        buttonContent: (context, _, cellSize, index) => <CellBackground
            context={context}
            colors={new CellDataSet(context.puzzle, [index])}
            size={cellSize}
        />,
    },
    {
        mode: CellWriteMode.lines,
        hotKeyStr: "Alt",
        isNoSelectionMode: true,
        onCornerClick: (context, position) =>
            context.onStateChange(state => gameStateStartMultiLine({...context, state}, position)),
        onCornerEnter: (context, position) =>
            context.onStateChange(state => gameStateContinueMultiLine(
                {...context, state},
                position
            )),
        digitsCount: 0,
    },
    {
        mode: CellWriteMode.move,
        hotKeyStr: "Alt+Shift",
        isNoSelectionMode: true,
        digitsCount: 0,
    },
];

export const getAllowedCellWriteModeInfos = <CellType, ExType, ProcessedExType>(
    {
        allowDrawing = [],
        loopHorizontally = false,
        loopVertically = false,
        enableDragMode = false,
        disableColoring = false,
        digitsCount,
        typeManager: {extraCellWriteModes = []},
    }: PuzzleDefinition<CellType, ExType, ProcessedExType>
): CellWriteModeInfo<CellType, ExType, ProcessedExType>[] => [
    ...allCellWriteModeInfos.filter(({mode, isDigitMode}) => {
        if (isDigitMode) {
            return digitsCount !== 0;
        }

        switch (mode) {
            case CellWriteMode.color:
                return !disableColoring;
            case CellWriteMode.lines:
                return allowDrawing.length !== 0;
            case CellWriteMode.move:
                return loopHorizontally || loopVertically || enableDragMode;
            default:
                return true;
        }
    }),
    ...extraCellWriteModes,
];

export const incrementCellWriteMode = (allowedModes: CellWriteModeInfo<any, any, any>[], mode: CellWriteMode, increment: number): CellWriteMode => {
    const currentModeIndex = allowedModes.findIndex(item => item.mode === mode);

    return allowedModes[(currentModeIndex + allowedModes.length + increment) % allowedModes.length].mode;
};

export const isCompactControlsPanel = (allowedModeInfos: CellWriteModeInfo<any, any, any>[]): boolean =>
    !allowedModeInfos.some(
        ({mode, isDigitMode     }) => isDigitMode || mode === CellWriteMode.color
    );
