import {indexes} from "../../../utils/indexes";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {darkGreyColor, textColor} from "../../app/globals";
import {Constraint, ConstraintProps, ConstraintPropsGenericFcMap} from "../../../types/sudoku/Constraint";
import {formatSvgPointsArray, Line, Position} from "../../../types/layout/Position";
import {concatContinuousLines} from "../../../utils/lines";
import {useTransformScale} from "../../../contexts/TransformContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {isCellWithBorders} from "../../../types/sudoku/CellTypeProps";
import {doesGridRegionContainCell} from "../../../types/sudoku/GridRegion";
import {profiler} from "../../../utils/profiler";
import {observer} from "mobx-react-lite";
import {comparer} from "mobx";
import {useComputed} from "../../../hooks/useComputed";

interface FieldLinesByDataProps {
    borderColor: string;
    borderWidth: number;
    customCellBorders: Position[][];
    regularBorders: Line[];
    dashedGrid?: boolean;
}

const FieldLinesByData = observer((
    {borderColor, borderWidth, customCellBorders, regularBorders, dashedGrid}: FieldLinesByDataProps
) => {
    profiler.trace();

    return <>
        {customCellBorders.map((border, index) => <polygon
            key={`custom-${index}`}
            points={formatSvgPointsArray(border)}
            fill={"none"}
            stroke={borderColor}
            strokeWidth={borderWidth}
        />)}

        {regularBorders.map(({start, end}) => <line
            key={`regular-${start.top}-${start.left}-${end.top}-${end.left}`}
            x1={start.left}
            y1={start.top}
            x2={end.left}
            y2={end.top}
            stroke={borderColor}
            strokeWidth={borderWidth}
            strokeDasharray={dashedGrid ? 0.125 : undefined}
        />)}
    </>;
});

export const FieldLines: ConstraintPropsGenericFcMap = {
    [FieldLayer.lines]: observer(function FieldLines<T extends AnyPTM>(
        {context, region}: ConstraintProps<T>
    ) {
        profiler.trace();

        const {
            puzzle,
            puzzleIndex,
            isMyTurn,
        } = context;

        const {
            typeManager: {borderColor: typeBorderColor},
            fieldSize: {columnsCount, rowsCount},
            borderColor: puzzleBorderColor,
            customCellBounds,
            dashedGrid,
        } = puzzle;

        const scale = useTransformScale();

        const timer = profiler.track("FieldLines");

        const borderColor = isMyTurn ? puzzleBorderColor || typeBorderColor || textColor : darkGreyColor;
        const borderWidth = 1 / scale;

        const cellHasBorders = (position: Position) => isCellWithBorders(puzzleIndex.getCellTypeProps(position))
            && (!region || (customCellBounds && !region.cells) || doesGridRegionContainCell(region, position));

        const getCustomCellBorders = useComputed(
            function getCustomCellBorders(): Position[][] {
                return customCellBounds
                    ? context.puzzleIndex.allCells.flatMap(
                        (row, top) => row.flatMap(
                            (_, left) => cellHasBorders({top, left})
                                ? context.getCellTransformedBounds(top, left).borders
                                : []
                        )
                    )
                    : [];
            },
            {equals: comparer.structural}
        );

        const getRegularBorders = useComputed(
            function getRegularBorders(): Line[] {
                return customCellBounds ? [] : [
                    ...indexes(rowsCount, true).flatMap(
                        top => concatContinuousLines(indexes(columnsCount).filter(
                            left => (top < rowsCount && cellHasBorders({top, left}))
                                || (top > 0 && cellHasBorders({top: top - 1, left}))
                        )).map(({start, end}) => ({
                            start: {left: start, top},
                            end: {left: end, top},
                        }))
                    ),
                    ...indexes(columnsCount, true).flatMap(
                        left => concatContinuousLines(indexes(rowsCount).filter(
                            top => (left < columnsCount && cellHasBorders({top, left}))
                                || (left > 0 && cellHasBorders({top, left: left - 1}))
                        )).map(({start, end}) => ({
                            start: {left, top: start},
                            end: {left, top: end},
                        }))
                    ),
                ];
            },
            {equals: comparer.structural}
        );

        if (region?.noBorders) {
            return null;
        }

        const regularBorders = getRegularBorders();
        const customCellBorders = getCustomCellBorders();

        timer.stop();

        return <FieldLinesByData
            borderWidth={borderWidth}
            borderColor={borderColor}
            customCellBorders={customCellBorders}
            regularBorders={regularBorders}
            dashedGrid={dashedGrid}
        />;
    }),
};

export const FieldLinesConstraint = <T extends AnyPTM>(): Constraint<T, any> => ({
    name: "field lines",
    cells: [],
    component: FieldLines,
    props: undefined,
});
