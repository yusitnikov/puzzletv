import React from "react";
import {Field} from "./Field";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {useGame} from "../../../hooks/sudoku/useGame";

export interface FieldPreviewProps<CellType, ExType, ProcessedExType> {
    puzzle: PuzzleDefinition<CellType, ExType, ProcessedExType>;
    width: number;
    hide?: boolean;
}

export const FieldPreview = <CellType, ExType, ProcessedExType>(
    {puzzle, width, hide}: FieldPreviewProps<CellType, ExType, ProcessedExType>
) => {
    return <div style={{
        position: "relative",
        width,
        height: width,
        overflow: "hidden",
        pointerEvents: "none",
    }}>
        {!hide && <FieldPreviewInner puzzle={puzzle} width={width}/>}
    </div>;
};

const FieldPreviewInner = <CellType, ExType, ProcessedExType>(
    {puzzle, width}: Omit<FieldPreviewProps<CellType, ExType, ProcessedExType>, "hide">
) => {
    const cellSize = width / (puzzle.fieldSize.fieldSize + (puzzle.fieldMargin || 0) * 2);
    const context = useGame(puzzle, cellSize, cellSize, true);

    return <Field
        rect={{
            left: 0,
            top: 0,
            width,
            height: width,
        }}
        context={context}
    />;
};
