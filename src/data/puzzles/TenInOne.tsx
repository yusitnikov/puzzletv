import {PuzzleDefinition} from "../../types/sudoku/PuzzleDefinition";
import {LanguageCode} from "../../types/translations/LanguageCode";
import {MultiStageGameState} from "../../sudokuTypes/multi-stage/types/MultiStageGameState";
import {
    isValidFinishedPuzzleByStageConstraints,
    TenInOneSudokuTypeManager
} from "../../sudokuTypes/ten-in-one/types/TenInOneSudokuTypeManager";
import {createRegularFieldSize} from "../../types/sudoku/FieldSize";
import {KillerCageConstraintByRect} from "../../components/sudoku/constraints/killer-cage/KillerCage";
import {KropkiDotConstraint} from "../../components/sudoku/constraints/kropki-dot/KropkiDot";

const remainingIndexes = [0, 4, 8];

export const AbstractKillerDots: PuzzleDefinition<number, MultiStageGameState, MultiStageGameState> = {
    noIndex: true,
    title: {
        [LanguageCode.en]: "Abstract Killer Dots",
        [LanguageCode.ru]: "Абстрактные точки-клетки",
    },
    slug: "abstract-killer-dots",
    typeManager: TenInOneSudokuTypeManager(
        ({top, left}) => remainingIndexes.includes(top) && remainingIndexes.includes(left)
    ),
    fieldSize: {
        ...createRegularFieldSize(9, 3),
        regions: [],
    },
    items: [
        KillerCageConstraintByRect("R1C4", 3, 1, 13),
        KillerCageConstraintByRect("R2C2", 1, 2, 7),
        KillerCageConstraintByRect("R2C3", 1, 2, 9),
        KillerCageConstraintByRect("R2C6", 1, 2, 9),
        KillerCageConstraintByRect("R4C1", 2, 1, 17),
        KillerCageConstraintByRect("R4C6", 1, 2, 9),
        KillerCageConstraintByRect("R4C7", 1, 2, 10),
        KillerCageConstraintByRect("R5C4", 1, 2, 11),
        KillerCageConstraintByRect("R5C8", 2, 1, 12),
        KillerCageConstraintByRect("R6C5", 2, 1, 10),
        KillerCageConstraintByRect("R7C9", 1, 3, 10),
        KillerCageConstraintByRect("R8C5", 1, 2, 17),
        KillerCageConstraintByRect("R9C1", 2, 1, 5),
        KillerCageConstraintByRect("R9C7", 2, 1, 9),

        KropkiDotConstraint("R1C5", "R1C6", false),
        KropkiDotConstraint("R1C7", "R2C7", false),
        KropkiDotConstraint("R2C7", "R2C8", true),
        KropkiDotConstraint("R2C7", "R3C7", false),
        KropkiDotConstraint("R3C1", "R3C2", true),
        KropkiDotConstraint("R3C5", "R3C6", true),
        KropkiDotConstraint("R3C8", "R3C9", true),
        KropkiDotConstraint("R4C5", "R4C6", false),
        KropkiDotConstraint("R4C7", "R4C8", true),
        KropkiDotConstraint("R4C5", "R5C5", false),
        KropkiDotConstraint("R5C1", "R5C2", false),
        KropkiDotConstraint("R5C2", "R6C2", false),
        KropkiDotConstraint("R6C7", "R6C8", true),
        KropkiDotConstraint("R7C1", "R7C2", false),
        KropkiDotConstraint("R7C2", "R7C3", false),
        KropkiDotConstraint("R7C1", "R8C1", true),
        KropkiDotConstraint("R7C3", "R8C3", false),
        KropkiDotConstraint("R7C4", "R8C4", true),
        KropkiDotConstraint("R8C7", "R8C8", false),
        KropkiDotConstraint("R8C6", "R9C6", true),
        KropkiDotConstraint("R8C7", "R9C7", true),
    ],
    resultChecker: isValidFinishedPuzzleByStageConstraints(2),
};
