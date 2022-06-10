import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {
    Line,
    parsePositionLiteral,
    Position,
    PositionLiteral
} from "../../../../types/layout/Position";
import {HashSet, SetInterface} from "../../../../types/struct/Set";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {getIsSamePuzzlePosition, getPuzzleLineHasher} from "../../../../types/sudoku/PuzzleDefinition";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {CenteredText} from "../../../svg/centered-text/CenteredText";
import {textColor} from "../../../app/globals";
import {FieldRect} from "../../field/FieldRect";
import {FieldCellUserArea} from "../../field/FieldCellUserArea";

export interface TapaCellProps {
    clues: (number | undefined)[];
}

export const TapaCell = withFieldLayer(FieldLayer.regular, (
    {
        cells: [cell],
        clues,
        context,
    }: ConstraintProps<any, TapaCellProps>
) => {
    const radius = clues.length === 1 ? 0 : 0.3;
    const size = clues.length === 1 ? 0.8 : 0.4;

    return <FieldRect
        context={context}
        {...cell}
    >
        <FieldCellUserArea
            context={context}
            cellPosition={cell}
        >
            {clues.map((value, index) => {
                const angle = 2 * Math.PI * ((index + 0.5) / clues.length + 3 / 8);

                return <CenteredText
                    key={index}
                    top={0.5 + radius * Math.sin(angle)}
                    left={0.5 + radius * Math.cos(angle)}
                    size={size}
                    fill={textColor}
                >
                    {value ?? "?"}
                </CenteredText>;
            })}
        </FieldCellUserArea>
    </FieldRect>;
});

export const TapaCellConstraint = <CellType,>(cellLiteral: PositionLiteral, ...clues: (number | undefined)[]): Constraint<CellType, TapaCellProps> => {
    const cell = parsePositionLiteral(cellLiteral);

    const cluesMap: Record<number, number> = {};
    for (const clue of clues) {
        const key = clue || 0;
        cluesMap[key] = (cluesMap[key] || 0) + 1;
    }

    const getCellInfo = ({cellsIndex: {allCells}}: PuzzleContext<CellType, any, any>) => allCells[cell.top][cell.left];

    const getNeighborCenters = (context: PuzzleContext<CellType, any, any>) => getCellInfo(context).neighbors.map(
        ({top, left}) => context.cellsIndex.allCells[top][left].center
    );

    const getLineSegments = (lines: SetInterface<Line>, {cellsIndex}: PuzzleContext<CellType, any, any>) =>
        cellsIndex.getCenterLineSegments(lines.items);

    return {
        name: "tapa cell",
        cells: [cell],
        clues,
        component: TapaCell,
        isValidPuzzle(lines, digits, cells, context) {
            const neighborCenters = getNeighborCenters(context);

            return getLineSegments(lines, context).some(({points}) => neighborCenters.containsOneOf(points));
        },
        getInvalidUserLines(
            lines,
            digits,
            cells,
            context,
            isFinalCheck
        ): Line[] {
            const {center} = getCellInfo(context);
            const neighborCenters = getNeighborCenters(context);
            const lineSegments = getLineSegments(lines, context);

            const isSamePosition = getIsSamePuzzlePosition(context.puzzle);
            const lineHasher = getPuzzleLineHasher(context.puzzle);

            let result: SetInterface<Line> = new HashSet(
                lineSegments
                    .flatMap(({lines}) => lines)
                    .filter(({start, end}) => isSamePosition(start, center) || isSamePosition(end, center)),
                lineHasher
            );

            interface ClueSegment {
                lines: Line[];
                points: Position[];
            }
            const finishedSegments: ClueSegment[] = [];
            const unfinishedSegments: ClueSegment[] = [];
            const remainingCluesMap: Record<number, number> = {...cluesMap};

            for (const {lines, points, isLoop, isBranching} of lineSegments) {
                if (isBranching) {
                    // LoopLineConstraint will report branching lines, no need to process them here
                    continue;
                }

                // Make the points array start from a point that doesn't touch the constraint cell, if possible
                let normalizedPoints = points;
                if (isLoop) {
                    const outerPointIndex = points.findIndex((point) => !neighborCenters.contains(point));
                    if (outerPointIndex >= 0) {
                        normalizedPoints = [
                            ...points.slice(outerPointIndex),
                            ...points.slice(0, outerPointIndex),
                        ];
                    }
                }

                let currentCluePositions: Position[] = [];
                const releaseCluePositions = () => {
                    if (currentCluePositions.length) {
                        const segmentLines = lines.filter(({start, end}) => currentCluePositions.some(
                            position => isSamePosition(start, position) || isSamePosition(end, position)
                        ));
                        const isFinished = isFinalCheck || isLoop || segmentLines.length === currentCluePositions.length + 1;
                        (isFinished ? finishedSegments : unfinishedSegments).push({
                            lines: segmentLines,
                            points: currentCluePositions,
                        });
                        if (isFinished) {
                            const key = currentCluePositions.length;
                            remainingCluesMap[key] = (remainingCluesMap[key] || 0) - 1;
                            if (remainingCluesMap[key] < 0) {
                                remainingCluesMap[0] = (remainingCluesMap[0] || 0) - 1;
                            }
                        }

                        currentCluePositions = [];
                    }
                };
                for (const point of normalizedPoints) {
                    if (neighborCenters.contains(point)) {
                        currentCluePositions.push(point);
                    } else {
                        releaseCluePositions();
                    }
                }
                releaseCluePositions();
            }

            if (isFinalCheck && finishedSegments.length !== clues.length) {
                result = result.toggleAll(
                    [...finishedSegments, ...unfinishedSegments].flatMap(({lines}) => lines),
                    true
                );
            } else {
                for (const {lines, points: {length}} of finishedSegments) {
                    const remaining = remainingCluesMap[length] >= 0 ? remainingCluesMap[length] : remainingCluesMap[0];
                    if (remaining < 0 || (isFinalCheck && remaining > 0)) {
                        result = result.toggleAll(lines, true);
                    }
                }

                const remainingLengths = Object.entries(remainingCluesMap)
                    .filter(([, value]) => value > 0)
                    .map(([key]) => Number(key));
                if (!remainingLengths.includes(0)) {
                    const maxRemainingLength = Math.max(-1, ...remainingLengths);

                    for (const {lines, points: {length}} of unfinishedSegments) {
                        if (length > maxRemainingLength) {
                            result = result.toggleAll(lines, true);
                        }
                    }
                }
            }

            return result.items;
        },
    };
};
