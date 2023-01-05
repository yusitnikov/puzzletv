import {useMemo} from "react";
import {darkGreyColor, getRegionBorderWidth, textColor} from "../../../app/globals";
import {
    isSamePosition,
    parsePositionLiterals,
    Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc
} from "../../../../types/sudoku/Constraint";
import {getRegionBorders} from "../../../../utils/regions";
import {GivenDigitsMap} from "../../../../types/sudoku/GivenDigitsMap";
import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {PuzzleDefinition} from "../../../../types/sudoku/PuzzleDefinition";
import {ProcessedGameStateEx} from "../../../../types/sudoku/GameState";

export const Region = withFieldLayer(FieldLayer.lines, ({cells, context: {cellSize, state: {processed: {isMyTurn}}}}: ConstraintProps) => {
    const points = useMemo(() => getRegionBorders(cells, true), [cells]);

    return <RoundedPolyLine
        points={points}
        stroke={isMyTurn ? textColor : darkGreyColor}
        strokeWidth={getRegionBorderWidth(cellSize)}
    />;
}) as ConstraintPropsGenericFc;

export const isValidCellForRegion = <CellType, ExType, ProcessedExType>(
    region: Position[],
    cell: Position,
    digits: GivenDigitsMap<CellType>,
    {typeManager: {areSameCellData}}: PuzzleDefinition<CellType, ExType, ProcessedExType>,
    state: ProcessedGameStateEx<CellType, ExType, ProcessedExType>
) => {
    const digit = digits[cell.top][cell.left]!;

    for (const regionCell of region) {
        const constraintDigit = digits[regionCell.top]?.[regionCell.left];

        if (constraintDigit === undefined || isSamePosition(regionCell, cell)) {
            continue;
        }

        if (areSameCellData(constraintDigit, digit, state, true)) {
            return false;
        }
    }

    return true;
};

export const RegionConstraint = <CellType, ExType, ProcessedExType>(
    cellLiterals: PositionLiteral[], showBorders = true, name = "region"
): Constraint<CellType, undefined, ExType, ProcessedExType> => {
    const cells = parsePositionLiterals(cellLiterals);

    return {
        name,
        cells,
        component: showBorders ? Region : undefined,
        props: undefined,
        isObvious: true,
        isCheckingFog: true,
        isValidCell(cell, digits, cells, {puzzle, state}) {
            return isValidCellForRegion(cells, cell, digits, puzzle, state);
        },
    };
};
