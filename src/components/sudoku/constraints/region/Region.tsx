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
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {getRegionBorders} from "../../../../utils/regions";
import {GivenDigitsMap} from "../../../../types/sudoku/GivenDigitsMap";
import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {PuzzleDefinition} from "../../../../types/sudoku/PuzzleDefinition";
import {ProcessedGameState} from "../../../../types/sudoku/GameState";

export const Region = withFieldLayer(FieldLayer.lines, ({cells, context: {cellSize, state: {isMyTurn}}}: ConstraintProps) => {
    const points = useMemo(() => getRegionBorders(cells, true), [cells]);

    return <RoundedPolyLine
        points={points}
        stroke={isMyTurn ? textColor : darkGreyColor}
        strokeWidth={getRegionBorderWidth(cellSize)}
    />;
});

export const isValidCellForRegion = <CellType, GameStateExtensionType = any, ProcessedGameStateExtensionType = any>(
    region: Position[],
    cell: Position,
    digits: GivenDigitsMap<CellType>,
    {typeManager: {areSameCellData}}: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>,
    state: ProcessedGameState<CellType> & ProcessedGameStateExtensionType
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

export const RegionConstraint = <CellType,>(cellLiterals: PositionLiteral[], showBorders = true, name = "region"): Constraint<CellType> => {
    const cells = parsePositionLiterals(cellLiterals);

    return ({
        name,
        cells,
        component: showBorders ? Region : undefined,
        isValidCell(cell, digits, cells, {puzzle, state}) {
            return isValidCellForRegion(cells, cell, digits, puzzle, state);
        },
    });
};
