import {ReactNode} from "react";
import {PuzzleContext} from "./PuzzleContext";
import {Set} from "../struct/Set";
import {CellDigits} from "../../components/sudoku/cell/CellDigits";
import {CellBackground} from "../../components/sudoku/cell/CellBackground";
import {Position} from "../layout/Position";
import {gameStateContinueMultiLine, gameStateStartMultiLine} from "./GameState";

export enum CellWriteMode {
    main,
    corner,
    center,
    color,
    lines,
    move,
    custom,
}

export interface CellWriteModeInfo<CellType, GameStateExtensionType, ProcessedGameStateExtensionType> {
    mode: CellWriteMode | number;
    hotKeyStr?: string;
    isDigitMode?: boolean;
    isNoSelectionMode?: boolean;
    digitsCount?: number;
    buttonContent?: (
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        cellData: CellType,
        cellSize: number,
        index: number
    ) => ReactNode;
    onCornerClick?: (
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        position: Position
    ) => void;
    onCornerEnter?: (
        context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
        position: Position
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
            data={{cornerDigits: new Set([cellData])}}
            size={cellSize}
        />,
    },
    {
        mode: CellWriteMode.center,
        hotKeyStr: "Ctrl",
        isDigitMode: true,
        buttonContent: (context, cellData, cellSize) => <CellDigits
            context={context}
            data={{centerDigits: new Set([cellData])}}
            size={cellSize}
        />,
    },
    {
        mode: CellWriteMode.color,
        hotKeyStr: "Ctrl+Shift",
        digitsCount: 9,
        buttonContent: (context, _, cellSize, index) => <CellBackground
            context={context}
            colors={new Set([index])}
            size={cellSize}
        />,
    },
    {
        mode: CellWriteMode.lines,
        hotKeyStr: "Alt",
        isNoSelectionMode: true,
        onCornerClick: ({onStateChange}, position) =>
            onStateChange(state => gameStateStartMultiLine(state, position)),
        onCornerEnter: ({puzzle, onStateChange}, position) =>
            onStateChange(state => gameStateContinueMultiLine(puzzle, state, position)),
        digitsCount: 0,
    },
    {
        mode: CellWriteMode.move,
        hotKeyStr: "Alt+Shift",
        isNoSelectionMode: true,
        digitsCount: 0,
    },
];

export const getAllowedCellWriteModeInfos = (allowDrawing?: boolean, allowDragging?: boolean): CellWriteModeInfo<any, any, any>[] => allCellWriteModeInfos.filter(({mode}) => {
    switch (mode) {
        case CellWriteMode.lines:
            return allowDrawing;
        case CellWriteMode.move:
            return allowDragging;
        default:
            return true;
    }
});

export const incrementCellWriteMode = (allowedModes: CellWriteModeInfo<any, any, any>[], mode: CellWriteMode, increment: number): CellWriteMode => {
    const currentModeIndex = allowedModes.findIndex(item => item.mode === mode);

    return allowedModes[(currentModeIndex + allowedModes.length + increment) % allowedModes.length].mode;
};
