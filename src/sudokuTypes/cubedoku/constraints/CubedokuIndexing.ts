import {Constraint} from "../../../types/sudoku/Constraint";
import {isSamePosition, Position, Position3D} from "../../../types/layout/Position";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export const CubedokuIndexingConstraint = <T extends AnyPTM>(): Constraint<T> => ({
    name: "cubedoku indexing",
    cells: [],
    props: undefined,
    isValidCell(cell, digits, _, context): boolean {
        const {puzzle: {fieldSize: {fieldSize}, typeManager: {getDigitByCellData}}} = context;
        const realFieldSize = fieldSize / 2;

        // x and y are like in the left face of the cube
        const getIndexedCell = ({left, top}: Position, data: T["cell"]): Position3D => {
            const digit = getDigitByCellData(data, context, {top, left});

            if (top < realFieldSize) {
                return {
                    x: left,
                    y: digit - 1,
                    z: realFieldSize - 1 - top,
                };
            } else if (left < realFieldSize) {
                return {
                    x: left,
                    y: top - realFieldSize,
                    z: digit - 1,
                };
            } else {
                return {
                    x: realFieldSize - digit,
                    y: top - realFieldSize,
                    z: left - realFieldSize,
                };
            }
        };

        const {x, y, z} = getIndexedCell(cell, digits[cell.top][cell.left]!);

        for (const [topStr, row] of Object.entries(digits)) {
            for (const [leftStr, data] of Object.entries(row)) {
                if (data === undefined) {
                    continue;
                }

                const otherCell: Position = {
                    left: Number(leftStr),
                    top: Number(topStr),
                };
                if (isSamePosition(otherCell, cell)) {
                    continue;
                }

                const cell2 = getIndexedCell(otherCell, data);

                // How many dimension of the 2 cells are different
                const totalDiff = (cell2.x === x ? 0 : 1) + (cell2.y === y ? 0 : 1) + (cell2.z === z ? 0 : 1);

                // The indexed cells should either be exactly the same or don't see each other at all
                if (totalDiff === 1) {
                    return false;
                }
            }
        }

        return true;
    },
});
