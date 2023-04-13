import React from "react";
import {Field} from "./Field";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {useGame} from "../../../hooks/sudoku/useGame";
import {ErrorBoundary} from "react-error-boundary";
import {errorColor} from "../../app/globals";
import {lightenColorStr} from "../../../utils/color";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export interface FieldPreviewProps<T extends AnyPTM> {
    puzzle?: PuzzleDefinition<T>;
    width: number;
    hide?: boolean;
}

export const FieldPreview = <T extends AnyPTM>({puzzle, width, hide}: FieldPreviewProps<T>) => {
    const loadError = <div style={{
        position: "absolute",
        inset: 0,
        background: lightenColorStr(errorColor),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    }}>
        <span>Failed to load the puzzle :(</span>
    </div>;

    return <div style={{
        position: "relative",
        width,
        height: width,
        overflow: "hidden",
        pointerEvents: "none",
    }}>
        {!hide && (!puzzle ? loadError : <ErrorBoundary fallback={loadError}>
            <FieldPreviewInner puzzle={puzzle} width={width}/>
        </ErrorBoundary>)}
    </div>;
};

interface FieldPreviewInnerProps<T extends AnyPTM> {
    puzzle: PuzzleDefinition<T>;
    width: number;
    hide?: boolean;
}

const FieldPreviewInner = <T extends AnyPTM>({puzzle, width}: FieldPreviewInnerProps<T>) => {
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
