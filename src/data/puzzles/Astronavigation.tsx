import {
    allDrawingModes,
    isValidFinishedPuzzleByEmbeddedSolution,
    PuzzleDefinition
} from "../../types/sudoku/PuzzleDefinition";
import {RotatableCluesPTM} from "../../sudokuTypes/rotatable-clues/types/RotatableCluesPTM";
import {NumberPTM} from "../../types/sudoku/PuzzleTypeMap";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {RulesParagraph} from "../../components/sudoku/rules/RulesParagraph";
import {FieldSize9, Regions9} from "../../types/sudoku/FieldSize";
import {
    ImportedRotatableCluesSudokuTypeManager
} from "../../sudokuTypes/rotatable-clues/types/RotatableCluesSudokuTypeManager";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";
import {
    DecorativeShapeComponent,
    DecorativeShapeConstraint, EllipseConstraint
} from "../../components/sudoku/constraints/decorative-shape/DecorativeShape";
import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";
import {PositionLiteral} from "../../types/layout/Position";
import {FieldLayer} from "../../types/sudoku/FieldLayer";
import {textColor} from "../../components/app/globals";
import {Constraint} from "../../types/sudoku/Constraint";
import {createGivenDigitsMapFromArray} from "../../types/sudoku/GivenDigitsMap";
import {CellColor} from "../../types/sudoku/CellColor";

const ArrowComponent = DecorativeShapeComponent(observer(function ArrowFc(props) {
    profiler.trace();

    return <path
        d={"M -0.2 0.4 L -0.2 0 L -0.4 0 L 0 -0.4 L 0.4 0 L 0.2 0 L 0.2 0.4 z"}
        {...props}
    />;
}));

const DecorativeArrowConstraint = (
    cellLiteral: PositionLiteral,
    angle?: number,
): Constraint<RotatableCluesPTM<NumberPTM>, any>[] => [
    DecorativeShapeConstraint(
        "decorative arrow",
        FieldLayer.regular,
        ArrowComponent,
        [cellLiteral],
        1,
        "#fff",
        textColor,
        undefined,
        undefined,
        undefined,
        angle
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
    typeManager: ImportedRotatableCluesSudokuTypeManager({baseTypeManager: DigitSudokuTypeManager()}),
    fieldSize: FieldSize9,
    regions: Regions9,
    rules: () => <>
        <RulesParagraph>Normal Sudoku rules apply.</RulesParagraph>
        <RulesParagraph>
            Guide Arrow: Shade some empty cells so that no two shaded cells are orthogonally adjacent
            and the remaining unshaded cells form one orthogonally connected area.
            No complete loop of cells may be unshaded (including 2×2s).
            An arrow indicates the only direction in which one could begin a path to the star without going through a shaded cell or backtracking.
        </RulesParagraph>
        <RulesParagraph>Each arrow must be rotated clockwise by D×90°, where D is the digit in that arrow's cell.</RulesParagraph>
        <RulesParagraph>For each arrow, the sum of the next two digits along the path to the star must equal the digit in that arrow's cell.</RulesParagraph>
        <RulesParagraph>The location of the star is to be discovered, but it must not be in a cell that is part of an arrow's sum.</RulesParagraph>
    </>,
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
    successMessage: "Congratulations!\n" +
        "You found your way to the star!\n" +
        "The solution is correct."
};
