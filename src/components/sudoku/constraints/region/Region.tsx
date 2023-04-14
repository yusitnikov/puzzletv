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
import {AnyPTM} from "../../../../types/sudoku/PuzzleTypeMap";

export const regionTag = "region";

export const Region = withFieldLayer(FieldLayer.lines, <T extends AnyPTM>(
    {cells, context: {cellSize, state: {processed: {isMyTurn}}}}: ConstraintProps<T>
) => {
    const points = useMemo(() => getRegionBorders(cells, 1, true), [cells]);

    return <RoundedPolyLine
        points={points}
        stroke={isMyTurn ? textColor : darkGreyColor}
        strokeWidth={getRegionBorderWidth(cellSize)}
    />;
}) as ConstraintPropsGenericFc;

export const isValidCellForRegion = <T extends AnyPTM>(
    region: Position[],
    cell: Position,
    digits: GivenDigitsMap<T["cell"]>,
    puzzle: PuzzleDefinition<T>,
    state: ProcessedGameStateEx<T>
) => {
    const digit = digits[cell.top][cell.left]!;

    for (const regionCell of region) {
        const constraintDigit = digits[regionCell.top]?.[regionCell.left];

        if (constraintDigit === undefined || isSamePosition(regionCell, cell)) {
            continue;
        }

        if (puzzle.typeManager.areSameCellData(constraintDigit, digit, puzzle, state, true)) {
            return false;
        }
    }

    return true;
};

export const RegionConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[], showBorders = true, name = "region"
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
        isValidCell(cell, digits, cells, {puzzle, state}) {
            return isValidCellForRegion(cells, cell, digits, puzzle, state);
        },
    };
};
