import React, { ReactElement, useMemo } from "react";
import { Grid } from "./Grid";
import { PuzzleDefinition } from "../../../types/puzzle/PuzzleDefinition";
import { ErrorBoundary } from "react-error-boundary";
import { errorColor } from "../../app/globals";
import { lightenColorStr } from "../../../utils/color";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { createEmptyContextForPuzzle } from "../../../types/puzzle/PuzzleContext";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface GridPreviewProps<T extends AnyPTM> {
    puzzle?: PuzzleDefinition<T>;
    width: number;
    hide?: boolean;
}

export const GridPreview = observer(function GridPreviewFc<T extends AnyPTM>({
    puzzle,
    width,
    hide,
}: GridPreviewProps<T>) {
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
                        <GridPreviewInner puzzle={puzzle} width={width} />
                    </ErrorBoundary>
                ))}
        </div>
    );
}) as <T extends AnyPTM>(props: GridPreviewProps<T>) => ReactElement;

interface GridPreviewInnerProps<T extends AnyPTM> {
    puzzle: PuzzleDefinition<T>;
    width: number;
    hide?: boolean;
}

const GridPreviewInner = observer(function GridPreviewInnerFc<T extends AnyPTM>({
    puzzle,
    width,
}: GridPreviewInnerProps<T>) {
    profiler.trace();

    const cellSize = width / (puzzle.gridSize.gridSize + (puzzle.gridMargin || 0) * 2);
    const context = useMemo(() => createEmptyContextForPuzzle(puzzle, cellSize), [puzzle, cellSize]);

    // noinspection JSSuspiciousNameCombination
    return (
        <Grid
            rect={{
                left: 0,
                top: 0,
                width,
                height: width,
            }}
            context={context}
        />
    );
}) as <T extends AnyPTM>(props: GridPreviewInnerProps<T>) => ReactElement;
