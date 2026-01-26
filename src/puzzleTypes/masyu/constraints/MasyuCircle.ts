import { Line, Position } from "../../../types/layout/Position";
import { Constraint } from "../../../types/puzzle/Constraint";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { SetInterface } from "../../../types/struct/Set";

const isTurn = (direction1: Position, direction2: Position) => (direction1.left === 0) !== (direction2.left === 0);

const directions = [
    { top: 1, left: 0 },
    { top: -1, left: 0 },
    { top: 0, left: 1 },
    { top: 0, left: -1 },
];

const getLines = (lines: SetInterface<Line>, position: Position) =>
    directions
        .map(({ left, top }) => ({
            left,
            top,
            line: {
                start: position,
                end: {
                    top: position.top + top,
                    left: position.left + left,
                },
            },
        }))
        .filter(({ line }) => lines.contains(line));

export const MasyuCircleConstraint = <T extends AnyPTM>(position: Position, white: boolean): Constraint<T> => {
    const centerPosition = {
        top: position.top + 0.5,
        left: position.left + 0.5,
    };

    return {
        name: `${white ? "white" : "black"} masyu`,
        cells: [position],
        props: undefined,
        getInvalidUserLines(lines, _digits, _cells, _context, isFinalCheck) {
            let result = lines.clear();

            const initialDirections = getLines(lines, centerPosition).map((direction) => ({
                ...direction,
                next: getLines(lines, direction.line.end).filter(
                    (direction2) => direction2.top !== -direction.top || direction2.left !== -direction.left,
                ),
            }));

            if (initialDirections.length > 2 || (initialDirections.length < 2 && isFinalCheck)) {
                if (initialDirections.length === 0) {
                    return lines.items;
                }

                result = result.bulkAdd(initialDirections.map(({ line }) => line));
            }

            if (initialDirections.length === 2) {
                if (white === isTurn(initialDirections[0], initialDirections[1])) {
                    result = result.bulkAdd(initialDirections.map(({ line }) => line));
                }

                if (
                    white &&
                    initialDirections.every(
                        (direction) => direction.next.length === 1 && !isTurn(direction, direction.next[0]),
                    )
                ) {
                    result = result.bulkAdd(
                        initialDirections.flatMap((direction) => [direction.line, direction.next[0].line]),
                    );
                }
            }

            for (const direction of initialDirections) {
                if (direction.next.length > 1 || (direction.next.length === 0 && isFinalCheck)) {
                    result = result.add(direction.line).bulkAdd(direction.next.map(({ line }) => line));
                }

                if (!white && direction.next.length === 1 && isTurn(direction, direction.next[0])) {
                    result = result.add(direction.line).add(direction.next[0].line);
                }
            }

            return result.items;
        },
    };
};
