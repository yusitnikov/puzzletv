import { getRegionBorderWidth, lightGreyColor } from "../../../app/globals";
import { GridLayer } from "../../../../types/sudoku/GridLayer";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFcMap,
    getInvalidUserLines,
} from "../../../../types/sudoku/Constraint";
import { RoundedPolyLine } from "../../../svg/rounded-poly-line/RoundedPolyLine";
import { AutoSvg } from "../../../svg/auto-svg/AutoSvg";
import { CellMark, CellMarkType } from "../../../../types/sudoku/CellMark";
import { PuzzleContext } from "../../../../types/sudoku/PuzzleContext";
import { normalizePuzzleLine } from "../../../../types/sudoku/PuzzleDefinition";
import { DragAction } from "../../../../types/sudoku/DragAction";
import { resolveCellColorValue } from "../../../../types/sudoku/CellColor";
import { LineWithColor } from "../../../../types/sudoku/LineWithColor";
import { CenteredText } from "../../../svg/centered-text/CenteredText";
import { HashSet, setComparer } from "../../../../types/struct/Set";
import { emptyPositionWithAngle } from "../../../../types/layout/Position";
import { loop } from "../../../../utils/math";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { GridRegion } from "../../../../types/sudoku/GridRegion";
import { observer } from "mobx-react-lite";
import { useComputedValue } from "../../../../hooks/useComputed";
import { profiler } from "../../../../utils/profiler";

const regularBorderColor = "#080";
const errorBorderColor = "#e00";
const removingBorderColor = lightGreyColor;

export const UserLines: ConstraintPropsGenericFcMap = {
    [GridLayer.givenUserLines]: observer(function GivenUserLines<T extends AnyPTM>({
        context,
        region,
        regionIndex,
    }: ConstraintProps<T>) {
        profiler.trace();

        const { cellSize, puzzle } = context;

        const {
            typeManager: { regionSpecificUserMarks },
        } = puzzle;

        const borderWidth = getRegionBorderWidth(cellSize) * 1.5;

        const invalidLines = useComputedValue(
            function getInvalidLines() {
                return getInvalidUserLines(context);
            },
            { equals: setComparer },
        );

        const filterByRegion = (item: { regionIndex?: number }) =>
            !regionSpecificUserMarks || item.regionIndex === regionIndex;

        return (
            <>
                {context.lines.items.filter(filterByRegion).map((line, index) => {
                    line = normalizePuzzleLine(line, puzzle);

                    return (
                        <RoundedPolyLine
                            key={`existing-line-${index}`}
                            points={[line.start, line.end]}
                            stroke={
                                invalidLines.contains(line)
                                    ? errorBorderColor
                                    : resolveCellColorValue(line.color ?? regularBorderColor)
                            }
                            strokeWidth={borderWidth}
                        />
                    );
                })}

                {context.marks.items.filter(filterByRegion).map((mark, index) => (
                    <UserMarkByData
                        key={`mark-${index}`}
                        context={context}
                        cellSize={cellSize}
                        region={region}
                        {...mark}
                    />
                ))}
            </>
        );
    }),
    [GridLayer.newUserLines]: observer(function NewUserLines<T extends AnyPTM>({
        context: {
            cellSize,
            puzzle: {
                typeManager: { regionSpecificUserMarks },
            },
            currentMultiLine,
            dragAction,
        },
        regionIndex,
    }: ConstraintProps<T>) {
        profiler.trace();

        const filterByRegion = (item: { regionIndex?: number }) =>
            !regionSpecificUserMarks || item.regionIndex === regionIndex;

        return (
            <>
                {currentMultiLine.filter(filterByRegion).map((line, index) => (
                    <UserLinesByData
                        key={`new-line-${index}`}
                        cellSize={cellSize}
                        {...line}
                        isAdding={dragAction === DragAction.SetTrue}
                    />
                ))}
            </>
        );
    }),
};

export interface UserMarkByDataProps<T extends AnyPTM> extends CellMark {
    context?: PuzzleContext<T>;
    cellSize: number;
    region?: GridRegion;
}

export const UserMarkByData = observer(function UserMarkByData<T extends AnyPTM>({
    context,
    cellSize,
    position,
    type,
    color,
    // Leaving the defaults only for compatibility
    isCenter = position.left % 1 !== 0 && position.top % 1 !== 0,
    region,
}: UserMarkByDataProps<T>) {
    profiler.trace();

    let { top, left } = position;
    let angle = 0;

    const borderWidth = getRegionBorderWidth(cellSize) * 1.5;

    let userAreaSize = 1;

    const resolvedColor = color ? resolveCellColorValue(color) : regularBorderColor;

    if (context) {
        const { puzzle, puzzleIndex } = context;
        const {
            gridSize: { rowsCount, columnsCount },
            loopHorizontally,
            loopVertically,
            typeManager: { processCellDataPosition },
        } = puzzle;

        if (isCenter) {
            const cellPosition = puzzleIndex.getPointInfo(position)?.cells.first();
            if (cellPosition) {
                const {
                    bounds: { userArea },
                } = puzzleIndex.allCells[cellPosition.top][cellPosition.left];
                userAreaSize = (userArea.width + userArea.height) / 2;
                angle =
                    processCellDataPosition?.(
                        context,
                        emptyPositionWithAngle,
                        new HashSet(),
                        0,
                        () => undefined,
                        cellPosition,
                        region,
                    )?.angle ?? 0;
            }
        }

        if (loopVertically) {
            top = loop(top, rowsCount);
        }

        if (loopHorizontally) {
            left = loop(left, columnsCount);
        }
    }

    const radius = isCenter ? 0.3 * userAreaSize : (context?.puzzle.borderMarkSize ?? 0.15);
    const lineWidth = isCenter ? borderWidth * userAreaSize : borderWidth / 2;
    const opacity = isCenter ? 0.5 : 1;

    return (
        <AutoSvg top={top} left={left} angle={angle} stroke={resolvedColor} strokeWidth={borderWidth}>
            {type === CellMarkType.O && (
                <circle
                    cx={0}
                    cy={0}
                    r={radius}
                    stroke={resolvedColor}
                    strokeWidth={lineWidth}
                    fill={"none"}
                    opacity={opacity}
                />
            )}

            {type === CellMarkType.X && (
                <g opacity={opacity}>
                    <line
                        x1={-radius}
                        y1={-radius}
                        x2={radius}
                        y2={radius}
                        stroke={resolvedColor}
                        strokeWidth={lineWidth}
                    />

                    <line
                        x1={radius}
                        y1={-radius}
                        x2={-radius}
                        y2={radius}
                        stroke={resolvedColor}
                        strokeWidth={lineWidth}
                    />
                </g>
            )}

            {![CellMarkType.X, CellMarkType.O].includes(type) && (
                <CenteredText color={resolvedColor} size={0.7}>
                    {type}
                </CenteredText>
            )}
        </AutoSvg>
    );
});

export interface UserLinesByDataProps extends LineWithColor {
    cellSize: number;
    isAdding?: boolean;
}

export const UserLinesByData = ({
    cellSize,
    start,
    end,
    color = regularBorderColor,
    isAdding = true,
}: UserLinesByDataProps) => {
    const borderWidth = getRegionBorderWidth(cellSize) * 2;

    return (
        <RoundedPolyLine
            points={[start, end]}
            stroke={isAdding ? resolveCellColorValue(color) : removingBorderColor}
            strokeWidth={borderWidth}
        />
    );
};

export const UserLinesConstraint = <T extends AnyPTM>(): Constraint<T, any> => ({
    name: "user lines",
    cells: [],
    component: UserLines,
    props: undefined,
});
