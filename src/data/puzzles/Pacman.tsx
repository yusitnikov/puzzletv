import {
    allDrawingModes,
    isValidFinishedPuzzleByEmbeddedSolution,
    PuzzleDefinition,
} from "../../types/puzzle/PuzzleDefinition";
import { createRegularGridSize, createRegularRegions } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { createCellsMapFromArray } from "../../types/puzzle/CellsMap";
import { DecorativeCageConstraint } from "../../components/puzzle/constraints/killer-cage/KillerCage";
import { KropkiDotConstraint } from "../../components/puzzle/constraints/kropki-dot/KropkiDot";
import {
    darkBlueColor,
    lightOrangeColor,
    lightRedColor,
    orangeColor,
    pinkColor,
    textColor,
    blueColor,
} from "../../components/app/globals";
import { Constraint, ConstraintProps } from "../../types/puzzle/Constraint";
import { GridLayer } from "../../types/puzzle/GridLayer";
import { observer } from "mobx-react-lite";
import { profiler } from "../../utils/profiler";
import { parsePositionLiteral, PositionLiteral } from "../../types/layout/Position";

const gridSize = createRegularGridSize(9, 3);

const CageSumConstraint = (cellLiteral: string, sum: number) =>
    DecorativeCageConstraint([cellLiteral], sum, false, undefined, "transparent", undefined, true);

interface BitmapProps {
    image: (string | undefined)[][];
}

const Bitmap = {
    [GridLayer.regular]: observer(function Bitmap({ props: { image } }: ConstraintProps<NumberPTM, BitmapProps>) {
        profiler.trace();

        const size = 1 / (image.length + 2);

        return (
            <g opacity={0.5}>
                {image.flatMap((row, top) =>
                    row.map(
                        (color, left) =>
                            color && (
                                <rect
                                    key={`${top}-${left}`}
                                    x={0.5 + size * (left - image.length / 2)}
                                    y={0.5 + size * (top - image.length / 2)}
                                    // Render the "pixels" a bit larger to make sure
                                    // that there are no white lines between them
                                    width={size * 1.1}
                                    height={size * 1.1}
                                    fill={color}
                                    stroke={"none"}
                                    strokeWidth={0}
                                />
                            ),
                    ),
                )}
            </g>
        );
    }),
};
const BitmapConstraint = (
    name: string,
    cellLiteral: PositionLiteral,
    image: (string | undefined)[][],
): Constraint<NumberPTM, BitmapProps> => ({
    name,
    cells: [parsePositionLiteral(cellLiteral)],
    renderSingleCellInUserArea: true,
    props: { image },
    component: Bitmap,
});

const t = undefined;
const b = textColor;
const w = "#ffffff";
const e = darkBlueColor;
const y = lightOrangeColor;

const PacmanConstraint = () =>
    BitmapConstraint("pacman", "R5C2", [
        [t, t, t, t, t, t, b, b, b, b, t, t, t, t, t, t],
        [t, t, t, t, b, b, y, y, y, y, b, b, t, t, t, t],
        [t, t, t, b, y, y, y, y, y, y, y, y, b, t, t, t],
        [t, t, b, y, y, y, y, y, y, y, y, y, y, b, t, t],
        [t, b, y, y, y, y, y, b, y, y, y, y, y, y, b, t],
        [t, b, y, y, y, y, y, y, y, y, y, y, b, b, t, t],
        [b, y, y, y, y, y, y, y, y, b, b, b, t, t, t, t],
        [b, y, y, y, y, y, b, b, b, t, t, t, t, t, t, t],
        [b, y, y, y, y, y, y, y, b, t, t, t, t, t, t, t],
        [b, y, y, y, y, y, y, y, y, b, b, b, t, t, t, t],
        [t, b, y, y, y, y, y, y, y, y, y, y, b, b, t, t],
        [t, b, y, y, y, y, y, y, y, y, y, y, y, y, b, t],
        [t, t, b, y, y, y, y, y, y, y, y, y, y, b, t, t],
        [t, t, t, b, y, y, y, y, y, y, y, y, b, t, t, t],
        [t, t, t, t, b, b, y, y, y, y, b, b, t, t, t, t],
        [t, t, t, t, t, t, b, b, b, b, t, t, t, t, t, t],
    ]);

const GhostConstraint = (cellLiteral: string, c: string) =>
    BitmapConstraint("ghost", cellLiteral, [
        [t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
        [t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
        [t, t, t, t, c, c, c, c, c, c, c, c, t, t, t, t],
        [t, t, t, c, c, c, c, c, c, c, c, c, c, t, t, t],
        [t, t, c, c, w, w, c, c, c, w, w, c, c, c, t, t],
        [t, t, c, w, w, w, w, c, w, w, w, w, c, c, t, t],
        [t, t, c, e, e, w, w, c, e, e, w, w, c, c, t, t],
        [t, t, c, e, e, w, w, c, e, e, w, w, c, c, t, t],
        [t, t, c, c, w, w, c, c, c, w, w, c, c, c, t, t],
        [t, t, c, c, c, c, c, c, c, c, c, c, c, c, t, t],
        [t, t, c, c, c, c, c, c, c, c, c, c, c, c, t, t],
        [t, t, c, c, c, c, c, c, c, c, c, c, c, c, t, t],
        [t, t, c, c, c, c, c, c, c, c, c, c, c, c, t, t],
        [t, t, t, c, c, t, c, c, t, c, c, t, c, c, t, t],
        [t, t, t, t, c, t, t, c, t, t, c, t, t, c, t, t],
        [t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
    ]);

export const Pacman: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    slug: "pacman",
    title: {
        [LanguageCode.en]: "Pac-Man Sudoku",
    },
    author: {
        [LanguageCode.en]: "Math Pesto",
    },
    rules: () => (
        <>
            <RulesParagraph>
                Normal sudoku rules apply. The leftmost and rightmost cells of a row are considered orthogonally
                adjacent for the purposes of all rules below.
            </RulesParagraph>
            <RulesParagraph>
                Cells joined by a white dot contain consecutive digits. Not all white dots are given.
            </RulesParagraph>
            <RulesParagraph>
                Shade some cells in the grid and leave the rest unshaded such that all shaded cells are orthogonally
                connected and no 2x2 region is entirely shaded. A cell containing Pac-Man, Blinky, Pinky, Inky, or Clyde
                (yellow, red, pink, blue, and orange)—or part of a white dot—must be shaded.
            </RulesParagraph>
            <RulesParagraph>
                A cell containing a killer clue must remain unshaded. Digits may not repeat within an orthogonally
                connected area of unshaded cells, and they sum to the killer clue. (Note: Unshaded regions may not touch
                each other orthogonally, and not all regions necessarily have a killer clue.)
            </RulesParagraph>
            <RulesParagraph>
                Starting in R5C2, Pac-Man must travel orthogonally through the grid. His path may not touch itself
                orthogonally, although it may do so diagonally, and the path cannot intersect or overlap itself. Pac-Man
                must go directly through each white dot; his path is completed immediately after going through the final
                dot. Pac-Man's path cannot be orthogonally adjacent to any of the ghosts (red, pink, blue, and orange)
                nor can the path enter unshaded cells.
            </RulesParagraph>
        </>
    ),
    typeManager: DigitPuzzleTypeManager(),
    gridSize,
    regions: createRegularRegions(gridSize),
    initialDigits: { 0: { 8: 3 }, 3: { 4: 8 } },
    items: [
        CageSumConstraint("R1C3", 16),
        CageSumConstraint("R1C6", 15),
        CageSumConstraint("R2C5", 14),
        CageSumConstraint("R4C7", 8),
        CageSumConstraint("R5C1", 38),
        CageSumConstraint("R6C5", 8),
        CageSumConstraint("R7C2", 34),
        CageSumConstraint("R8C7", 24),
        CageSumConstraint("R9C5", 23),
        KropkiDotConstraint("R2C2", "R3C2", false),
        KropkiDotConstraint("R3C0", "R3C1", false),
        KropkiDotConstraint("R5C9", "R6C9", false),
        KropkiDotConstraint("R8C4", "R8C3", false),
        KropkiDotConstraint("R9C1", "R9C2", false),
        PacmanConstraint(),
        GhostConstraint("R1C5", lightRedColor),
        GhostConstraint("R5C4", pinkColor),
        GhostConstraint("R7C1", orangeColor),
        GhostConstraint("R9C6", blueColor),
    ],
    solution: createCellsMapFromArray([
        [5, 8, 7, 1, 2, 6, 9, 4, 3],
        [1, 3, 9, 4, 5, 7, 8, 6, 2],
        [6, 4, 2, 8, 9, 3, 5, 1, 7],
        [7, 9, 6, 5, 8, 4, 2, 3, 1],
        [8, 1, 3, 6, 7, 2, 4, 9, 5],
        [2, 5, 4, 3, 1, 9, 7, 8, 6],
        [9, 6, 5, 7, 4, 1, 3, 2, 8],
        [4, 7, 1, 2, 3, 8, 6, 5, 9],
        [3, 2, 8, 9, 6, 5, 1, 7, 4],
    ]),
    resultChecker: isValidFinishedPuzzleByEmbeddedSolution,
    loopHorizontally: true,
    gridMargin: 0.99,
    allowDrawing: allDrawingModes,
};
