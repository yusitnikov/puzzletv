import {useMemo} from "react";
import {textColor} from "../../../app/globals";
import {
    isSamePosition,
    parsePositionLiterals,
    Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {useIsFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {getRegionBorders} from "../../../../utils/regions";
import {GivenDigitsMap} from "../../../../types/sudoku/GivenDigitsMap";
import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {PuzzleDefinition} from "../../../../types/sudoku/PuzzleDefinition";

export const Region = ({cells, cellSize}: ConstraintProps<any>) => {
    const isLayer = useIsFieldLayer(FieldLayer.lines);

    const points = useMemo(() => getRegionBorders(cells, true), [cells]);

    return isLayer && <RoundedPolyLine
        points={points}
        stroke={textColor}
        strokeWidth={Math.min(5 / cellSize, 0.05)}
    />;
};

export const isValidCellForRegion = <CellType, GameStateExtensionType = any, ProcessedGameStateExtensionType = any>(
    region: Position[],
    cell: Position,
    digits: GivenDigitsMap<CellType>,
    {typeManager: {areSameCellData}}: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const digit = digits[cell.top][cell.left]!;

    for (const regionCell of region) {
        const constraintDigit = digits[regionCell.top]?.[regionCell.left];

        if (constraintDigit === undefined || isSamePosition(regionCell, cell)) {
            continue;
        }

        if (areSameCellData(constraintDigit, digit, true)) {
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
        isValidCell(cell, digits, puzzle) {
            return isValidCellForRegion(cells, cell, digits, puzzle);
        },
    });
};
