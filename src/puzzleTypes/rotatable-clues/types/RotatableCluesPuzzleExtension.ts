import { getAveragePosition, parsePositionLiterals, Position, PositionLiteral } from "../../../types/layout/Position";
import { Constraint } from "../../../types/puzzle/Constraint";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { CellColorValue, resolveCellColorValue } from "../../../types/puzzle/CellColor";
import { EllipseConstraint } from "../../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { blackColor } from "../../../components/app/globals";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { ComponentType, ReactNode } from "react";

export interface RotatableClue {
    pivot: Position;
    clues: RotatableClueItemConstraint<AnyPTM, any>[];
    coeff?: number;
    dependentClues?: RotatableClue[];
}

export interface RotatableClueItemConstraint<T extends AnyPTM, DataT = undefined> extends Constraint<T, DataT> {
    processRotatableCellCoords?: (rotatableClue: RotatableClue, angle: number, cell: Position) => Position;
    processRotatableCellsCoords?: (rotatableClue: RotatableClue, angle: number, cells: Position[]) => Position[];
    rotatableProcessorComponent?: ComponentType<RotatableClueProcessorProps>;
}

export interface RotatableClueProcessorProps {
    rotatableClue: RotatableClue;
    animatedAngle: number;
    children: ReactNode;
}

export interface RotatableCluesPuzzleExtension {
    clues: RotatableClue[];
}

export const createRotatableClue = (
    pivotCells: PositionLiteral | PositionLiteral[],
    radius: number,
    color: CellColorValue | undefined = undefined,
    clues: RotatableClueItemConstraint<AnyPTM, any>[] = [],
    coeff = 1,
    dependentClues: RotatableClue[] = [],
): RotatableClue => {
    if (!Array.isArray(pivotCells)) {
        pivotCells = [pivotCells];
    }

    if (radius && color) {
        clues = [
            EllipseConstraint(
                pivotCells,
                radius * 2,
                resolveCellColorValue(color),
                blackColor,
                undefined,
                undefined,
                undefined,
                undefined,
                GridLayer.beforeSelection,
            ),
            ...clues,
        ];
    }

    return {
        pivot: getAveragePosition(parsePositionLiterals(pivotCells)),
        clues,
        coeff,
        dependentClues,
    };
};
