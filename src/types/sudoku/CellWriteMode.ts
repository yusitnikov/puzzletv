export enum CellWriteMode {
    main,
    corner,
    center,
    color,
    lines,
    move,
}

export const incrementCellWriteMode = (mode: CellWriteMode, increment: number, allowDrawing?: boolean, allowDragging?: boolean): CellWriteMode => {
    const allowedModes = [CellWriteMode.main, CellWriteMode.corner, CellWriteMode.center, CellWriteMode.color];
    if (allowDrawing) {
        allowedModes.push(CellWriteMode.lines);
    }
    if (allowDragging) {
        allowedModes.push(CellWriteMode.move);
    }

    return allowedModes[(allowedModes.indexOf(mode) + allowedModes.length + increment) % allowedModes.length];
};

export const isDigitWriteMode = (mode: CellWriteMode) => [CellWriteMode.main, CellWriteMode.corner, CellWriteMode.center].includes(mode);

export const isNoSelectionWriteMode = (mode: CellWriteMode) => [CellWriteMode.lines, CellWriteMode.move].includes(mode);
