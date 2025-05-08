import { CaterpillarGrid } from "./types";
import { WindowSize } from "../../../hooks/useWindowSize";
import { getDimensions, getGridRect, parseSolutionString } from "./utils";
import { Absolute } from "../../layout/absolute/Absolute";
import { Fragment, MouseEvent, useMemo } from "react";
import { CellSelectionColor } from "../../puzzle/cell/CellSelection";
import { SudokuPad } from "./SudokuPad";
import { normalizeSclMetadata, puzzleIdToScl } from "../../../utils/sudokuPad";
import { errorColor, mutedBlueColor } from "../globals";

interface GridsCompilationProps {
    grids: CaterpillarGrid[];
    windowSize: WindowSize;
    readOnly: boolean;
    onClick?: (grid: CaterpillarGrid, isCtrl: boolean) => void;
    onDoubleClick?: (grid: CaterpillarGrid) => void;
    selectedGrids?: number[];
    showDigits?: boolean;
}

export const GridsCompilation = ({
    grids,
    windowSize,
    readOnly,
    onClick,
    onDoubleClick,
    selectedGrids,
    showDigits,
}: GridsCompilationProps) => {
    const { coeff, transformRect } = getDimensions(grids, windowSize);

    const parsedGrids = useMemo(
        () =>
            grids.map((grid) => {
                try {
                    return normalizeSclMetadata(puzzleIdToScl(grid.data));
                } catch {
                    return undefined;
                }
            }),
        [grids],
    );

    const conflictsMap = useMemo(() => {
        const map: Record<number, Record<number, string | false>> = {};

        for (const [index, { offset, size = 6 }] of grids.entries()) {
            const parsedData = parsedGrids[index];
            const solution = parsedData?.metadata?.solution;
            if (solution) {
                for (const [gridTop, row] of parseSolutionString(solution, size).entries()) {
                    if (!row) {
                        continue;
                    }
                    const top = gridTop + offset.top;
                    for (const [gridLeft, digit] of row.entries()) {
                        if (digit === undefined) {
                            continue;
                        }
                        const left = gridLeft + offset.left;
                        map[top] ??= {};
                        map[top][left] ??= digit;
                        if (map[top][left] !== digit) {
                            map[top][left] = false;
                        }
                    }
                }
            }
        }

        return map;
    }, [grids, parsedGrids]);

    return (
        <div>
            {grids.map((grid) => {
                const { guid, offset, size = 6 } = grid;

                return (
                    <Absolute
                        key={"background" + guid}
                        {...transformRect({ ...offset, width: size, height: size })}
                        style={{
                            background: "#fff",
                            pointerEvents: readOnly ? "none" : "all",
                            cursor: "pointer",
                        }}
                        onClick={(ev: MouseEvent<HTMLDivElement>) => {
                            ev.preventDefault();
                            ev.stopPropagation();

                            onClick?.(grid, ev.ctrlKey || ev.metaKey);
                        }}
                        onDoubleClick={(ev: MouseEvent<HTMLDivElement>) => {
                            ev.preventDefault();
                            ev.stopPropagation();

                            onDoubleClick?.(grid);
                        }}
                    />
                );
            })}

            {grids.map(
                ({ guid, offset, size = 6 }) =>
                    selectedGrids?.includes(guid) && (
                        <Absolute
                            key={"selection" + guid}
                            {...transformRect({ ...offset, width: size, height: size })}
                            borderColor={CellSelectionColor.mainCurrent}
                            borderWidth={5}
                        />
                    ),
            )}

            {grids.map((grid) => (
                <SudokuPad
                    key={"SudokuPad" + grid.guid}
                    data={grid.data}
                    dashed={grid.dashed}
                    bounds={transformRect(getGridRect(grid))}
                />
            ))}

            {showDigits &&
                grids.map((grid, index) => {
                    const { guid, offset, size = 6 } = grid;
                    const parsedData = parsedGrids[index];
                    const solution = parsedData?.metadata?.solution;

                    return (
                        solution !== undefined && (
                            <Fragment key={"solution" + guid}>
                                {parseSolutionString(solution, size).map(
                                    (row, gridTop) =>
                                        row && (
                                            <Fragment key={gridTop}>
                                                {row.map((digit, gridLeft) => {
                                                    const top = gridTop + offset.top;
                                                    const left = gridLeft + offset.left;

                                                    return (
                                                        digit !== undefined && (
                                                            <Absolute
                                                                key={gridLeft}
                                                                {...transformRect({ top, left, width: 1, height: 1 })}
                                                                style={{
                                                                    fontSize: coeff + "px",
                                                                    lineHeight: "1em",
                                                                    display: "flex",
                                                                    justifyContent: "center",
                                                                    alignItems: "center",
                                                                    color:
                                                                        conflictsMap[top]?.[left] === false
                                                                            ? errorColor
                                                                            : mutedBlueColor,
                                                                }}
                                                            >
                                                                {digit}
                                                            </Absolute>
                                                        )
                                                    );
                                                })}
                                            </Fragment>
                                        ),
                                )}
                            </Fragment>
                        )
                    );
                })}
        </div>
    );
};
