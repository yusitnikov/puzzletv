import { useMemo } from "react";
import { darkGreyColor, getRegionBorderWidth, textColor } from "../../../app/globals";
import { isSamePosition, parsePositionLiterals, Position, PositionLiteral } from "../../../../types/layout/Position";
import { FieldLayer } from "../../../../types/sudoku/FieldLayer";
import { Constraint, ConstraintProps, ConstraintPropsGenericFcMap } from "../../../../types/sudoku/Constraint";
import { getRegionBorders } from "../../../../utils/regions";
import { GivenDigitsMap } from "../../../../types/sudoku/GivenDigitsMap";
import { RoundedPolyLine } from "../../../svg/rounded-poly-line/RoundedPolyLine";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { PuzzleContext } from "../../../../types/sudoku/PuzzleContext";
import { profiler } from "../../../../utils/profiler";

export const regionTag = "region";

export const Region: ConstraintPropsGenericFcMap = {
    [FieldLayer.lines]: observer(function Region<T extends AnyPTM>({
        cells,
        context: { cellSize, isMyTurn },
    }: ConstraintProps<T>) {
        profiler.trace();

        const points = useMemo(() => getRegionBorders(cells, 1, true), [cells]);

        return (
            <RoundedPolyLine
                points={points}
                stroke={isMyTurn ? textColor : darkGreyColor}
                strokeWidth={getRegionBorderWidth(cellSize)}
                rounded={false}
            />
        );
    }),
};

export const isValidCellForRegion = <T extends AnyPTM>(
    region: Position[],
    cell: Position,
    digits: GivenDigitsMap<T["cell"]>,
    context: PuzzleContext<T>,
) => {
    const digit = digits[cell.top][cell.left]!;

    for (const regionCell of region) {
        const constraintDigit = digits[regionCell.top]?.[regionCell.left];

        if (constraintDigit === undefined || isSamePosition(regionCell, cell)) {
            continue;
        }

        if (context.puzzle.typeManager.areSameCellData(constraintDigit, digit, context, regionCell, cell)) {
            return false;
        }
    }

    return true;
};

export const RegionConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    showBorders = true,
    name = "region",
): Constraint<T> => {
    const cells = parsePositionLiterals(cellLiterals);

    return {
        name,
        tags: [regionTag],
        cells,
        component: showBorders ? Region : undefined,
        props: undefined,
        isObvious: true,
        isCheckingFog: true,
        isValidCell(cell, digits, cells, context) {
            return isValidCellForRegion(cells, cell, digits, context);
        },
    };
};
