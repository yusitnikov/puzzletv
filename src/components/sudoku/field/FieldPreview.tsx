import React, { ReactElement, useMemo } from "react";
import { Field } from "./Field";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import { ErrorBoundary } from "react-error-boundary";
import { errorColor } from "../../app/globals";
import { lightenColorStr } from "../../../utils/color";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { createEmptyContextForPuzzle } from "../../../types/sudoku/PuzzleContext";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface FieldPreviewProps<T extends AnyPTM> {
    puzzle?: PuzzleDefinition<T>;
    width: number;
    hide?: boolean;
}

export const FieldPreview = observer(function FieldPreview<T extends AnyPTM>({
    puzzle,
    width,
    hide,
}: FieldPreviewProps<T>) {
    profiler.trace();

    const loadError = (
        <div
            style={{
                position: "absolute",
                inset: 0,
                background: lightenColorStr(errorColor),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <span>Failed to load the puzzle :(</span>
        </div>
    );

    // noinspection JSSuspiciousNameCombination
    return (
        <div
            style={{
                position: "relative",
                width,
                height: width,
                overflow: "hidden",
                pointerEvents: "none",
            }}
        >
            {!hide &&
                (!puzzle ? (
                    loadError
                ) : (
                    <ErrorBoundary fallback={loadError}>
                        <FieldPreviewInner puzzle={puzzle} width={width} />
                    </ErrorBoundary>
                ))}
        </div>
    );
}) as <T extends AnyPTM>(props: FieldPreviewProps<T>) => ReactElement;

interface FieldPreviewInnerProps<T extends AnyPTM> {
    puzzle: PuzzleDefinition<T>;
    width: number;
    hide?: boolean;
}

const FieldPreviewInner = observer(function FieldPreviewInner<T extends AnyPTM>({
    puzzle,
    width,
}: FieldPreviewInnerProps<T>) {
    profiler.trace();

    const cellSize = width / (puzzle.fieldSize.fieldSize + (puzzle.fieldMargin || 0) * 2);
    const context = useMemo(() => createEmptyContextForPuzzle(puzzle, cellSize), [puzzle, cellSize]);

    // noinspection JSSuspiciousNameCombination
    return (
        <Field
            rect={{
                left: 0,
                top: 0,
                width,
                height: width,
            }}
            context={context}
        />
    );
}) as <T extends AnyPTM>(props: FieldPreviewInnerProps<T>) => ReactElement;
