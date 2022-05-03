export enum CellWriteMode {
    main,
    corner,
    center,
    color,
    lines,
}

export const incrementCellWriteMode = (mode: CellWriteMode, increment: number, allowDrawing?: boolean): CellWriteMode => {
    const count = allowDrawing
        ? CellWriteMode.lines + 1
        : CellWriteMode.lines;

    return (mode + count + increment) % count;
};

export const isDigitWriteMode = (mode: CellWriteMode) => [CellWriteMode.main, CellWriteMode.corner, CellWriteMode.center].includes(mode);

export const isNoSelectionWriteMode = (mode: CellWriteMode) => mode === CellWriteMode.lines;
