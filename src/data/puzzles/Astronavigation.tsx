import {
    allDrawingModes,
    isValidFinishedPuzzleByEmbeddedSolution,
    PuzzleDefinition,
} from "../../types/puzzle/PuzzleDefinition";
import { RotatableCluesPTM } from "../../puzzleTypes/rotatable-clues/types/RotatableCluesPTM";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { ImportedRotatableCluesTypeManager } from "../../puzzleTypes/rotatable-clues/types/RotatableCluesTypeManager";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import {
    DecorativeShapeComponent,
    DecorativeShapeConstraint,
    EllipseConstraint,
} from "../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { observer } from "mobx-react-lite";
import { profiler } from "../../utils/profiler";
import { PositionLiteral } from "../../types/layout/Position";
import { GridLayer } from "../../types/puzzle/GridLayer";
import { textColor } from "../../components/app/globals";
import { Constraint } from "../../types/puzzle/Constraint";
import { createGivenDigitsMapFromArray } from "../../types/puzzle/GivenDigitsMap";
import { CellColor } from "../../types/puzzle/CellColor";

const ArrowComponent = DecorativeShapeComponent(
    observer(function ArrowFc(props) {
        profiler.trace();

        return <path d={"M -0.2 0.4 L -0.2 0 L -0.4 0 L 0 -0.4 L 0.4 0 L 0.2 0 L 0.2 0.4 z"} {...props} />;
    }),
);

const DecorativeArrowConstraint = (
    cellLiteral: PositionLiteral,
    angle?: number,
): Constraint<RotatableCluesPTM<NumberPTM>, any>[] => [
    DecorativeShapeConstraint(
        "decorative arrow",
        GridLayer.regular,
        ArrowComponent,
        [cellLiteral],
        1,
        "#fff",
        textColor,
        undefined,
        undefined,
        undefined,
        angle,
    ),
    EllipseConstraint([cellLiteral], 1),
];

const T = [CellColor.black];
const F = [CellColor.green];

export const Astronavigation: PuzzleDefinition<RotatableCluesPTM<NumberPTM>> = {
    slug: "astronavigation",
    author: {
        [LanguageCode.en]: "fjam",
    },
    title: {
        [LanguageCode.en]: "Astronavigation",
    },
    typeManager: ImportedRotatableCluesTypeManager({ baseTypeManager: DigitPuzzleTypeManager() }),
    gridSize: GridSize9,
    regions: Regions9,
    rules: () => (
        <>
            <RulesParagraph>Normal Sudoku rules apply.</RulesParagraph>
            <RulesParagraph>
                Guide Arrow: Shade some empty cells so that no two shaded cells are orthogonally adjacent and the
                remaining unshaded cells form one orthogonally connected area. No complete loop of cells may be unshaded
                (including 2×2s). An arrow indicates the only direction in which one could begin a path to the star
                without going through a shaded cell or backtracking.
            </RulesParagraph>
            <RulesParagraph>
                Each arrow must be rotated clockwise by D×90°, where D is the digit in that arrow's cell.
            </RulesParagraph>
            <RulesParagraph>
                For each arrow, the sum of the next two digits along the path to the star must equal the digit in that
                arrow's cell.
            </RulesParagraph>
            <RulesParagraph>
                The location of the star is to be discovered, but it must not be in a cell that is part of an arrow's
                sum.
            </RulesParagraph>
        </>
    ),
    items: [
        ...DecorativeArrowConstraint("R1C2", 0),
        ...DecorativeArrowConstraint("R1C4", 90),
        ...DecorativeArrowConstraint("R1C8", 180),
        ...DecorativeArrowConstraint("R2C1", -90),
        ...DecorativeArrowConstraint("R4C1", 180),
        ...DecorativeArrowConstraint("R4C3", 180),
        ...DecorativeArrowConstraint("R4C5", 0),
        ...DecorativeArrowConstraint("R4C9", 0),
        ...DecorativeArrowConstraint("R5C7", 0),
        ...DecorativeArrowConstraint("R6C9", -90),
        ...DecorativeArrowConstraint("R8C4", 0),
        ...DecorativeArrowConstraint("R8C6", -90),
        ...DecorativeArrowConstraint("R8C9", 180),
        ...DecorativeArrowConstraint("R9C1", 90),
        ...DecorativeArrowConstraint("R9C3", -90),
    ],
    allowDrawing: allDrawingModes,
    solution: createGivenDigitsMapFromArray([
        [6, 5, 1, 4, 3, 2, 9, 8, 7],
        [7, 8, 2, 9, 1, 5, 4, 6, 3],
        [3, 9, 4, 7, 6, 8, 5, 2, 1],
        [4, 7, 8, 2, 9, 3, 1, 5, 6],
        [1, 3, 5, 8, 4, 6, 7, 9, 2],
        [2, 6, 9, 5, 7, 1, 8, 3, 4],
        [5, 4, 7, 3, 2, 9, 6, 1, 8],
        [9, 1, 3, 6, 8, 7, 2, 4, 5],
        [8, 2, 6, 1, 5, 4, 3, 7, 9],
    ]),
    solutionColors: createGivenDigitsMapFromArray([
        [F, T, T, T, T, F, T, T, F],
        [T, F, T, F, T, T, F, T, T],
        [T, T, F, T, T, F, T, T, F],
        [T, F, T, F, T, T, F, T, T],
        [T, T, T, T, F, T, T, F, T],
        [F, T, F, T, T, T, F, T, T],
        [T, T, T, F, T, F, [], T, F],
        [F, T, F, T, F, T, F, T, T],
        [T, T, T, T, T, T, T, T, F],
    ]),
    allowMappingSolutionColors: true,
    ignoreEmptySolutionColors: true,
    resultChecker: isValidFinishedPuzzleByEmbeddedSolution,
    successMessage: "Congratulations!\nYou found your way to the star!\nThe solution is correct.",
};
