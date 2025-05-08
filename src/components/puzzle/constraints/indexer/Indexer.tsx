import { GridLayer } from "../../../../types/puzzle/GridLayer";
import {
    isSamePosition,
    parsePositionLiteral,
    parsePositionLiterals,
    PositionLiteral,
} from "../../../../types/layout/Position";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../../types/puzzle/Constraint";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";
import { blueColor, greenColor, lightRedColor } from "../../../app/globals";
import { GridSize } from "../../../../types/puzzle/GridSize";
import { indexes } from "../../../../utils/indexes";
import { parseColorWithOpacity, rgba } from "../../../../utils/color";

const Indexer: ConstraintPropsGenericFcMap = {
    [GridLayer.beforeSelection]: observer(function Indexer<T extends AnyPTM>({
        cells: [{ left, top }],
        color,
    }: ConstraintProps<T>) {
        profiler.trace();

        const { rgb, a } = parseColorWithOpacity(color!);

        return <rect x={left} y={top} width={1} height={1} fill={rgb} opacity={a} />;
    }),
};

export const IndexerConstraint = <T extends AnyPTM>(
    name: string,
    indexingCellLiteral: PositionLiteral,
    indexedCellLiterals: PositionLiteral[],
    expectedDigit: number,
    color: string,
): Constraint<T> => {
    const indexingCell = parsePositionLiteral(indexingCellLiteral);
    const indexedCells = parsePositionLiterals(indexedCellLiterals);

    return {
        name,
        cells: [indexingCell, ...indexedCells],
        component: Indexer,
        renderSingleCellInUserArea: true,
        color,
        props: undefined,
        isObvious: false,
        isValidCell(cell, digits, [indexingCell, ...indexedCells], context) {
            const {
                puzzle: {
                    typeManager: { getDigitByCellData },
                },
            } = context;

            const indexData = digits[indexingCell.top]?.[indexingCell.left];
            if (indexData === undefined) {
                return true;
            }
            const index = getDigitByCellData(indexData, context, cell);
            const indexedCell = indexedCells[index - 1];
            if (!indexedCell) {
                return isSamePosition(cell, indexingCell);
            }

            if (!isSamePosition(cell, indexedCell)) {
                return true;
            }

            return getDigitByCellData(digits[cell.top][cell.left]!, context, cell) === expectedDigit;
        },
    };
};

export const RowIndexerConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral,
    { columnsCount }: GridSize,
    color = rgba(greenColor, 0.6),
) => {
    const cell = parsePositionLiteral(cellLiteral);

    return IndexerConstraint<T>(
        "row indexer",
        cell,
        indexes(columnsCount).map((top) => ({ ...cell, top })),
        cell.top + 1,
        color,
    );
};

export const ColumnIndexerConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral,
    { rowsCount }: GridSize,
    color = rgba(lightRedColor, 0.6),
) => {
    const cell = parsePositionLiteral(cellLiteral);

    return IndexerConstraint<T>(
        "column indexer",
        cell,
        indexes(rowsCount).map((left) => ({ ...cell, left })),
        cell.left + 1,
        color,
    );
};

export const BoxIndexerConstraint = <T extends AnyPTM>(
    cellLiteral: PositionLiteral,
    { columnsCount, regionWidth = columnsCount, regionHeight = 1 }: GridSize,
    color = rgba(blueColor, 0.6),
) => {
    const cell = parsePositionLiteral(cellLiteral);

    const boxTopIndex = Math.floor(cell.top / regionHeight);
    const boxLeftIndex = Math.floor(cell.left / regionWidth);

    return IndexerConstraint<T>(
        "box indexer",
        cell,
        indexes(regionHeight).flatMap((top) =>
            indexes(regionWidth).map((left) => ({
                top: boxTopIndex * regionHeight + top,
                left: boxLeftIndex * regionWidth + left,
            })),
        ),
        boxTopIndex * (columnsCount / regionWidth) + boxLeftIndex + 1,
        color,
    );
};
