import { SokobanSudokuTypeManager } from "../../types/SokobanSudokuTypeManager";
import { SokobanClue } from "../../types/SokobanPuzzleExtension";
import { SudokuTypeManager } from "../../../../types/sudoku/SudokuTypeManager";
import { SokobanPTM } from "../../types/SokobanPTM";
import { PuzzleDefinition } from "../../../../types/sudoku/PuzzleDefinition";
import { Constraint } from "../../../../types/sudoku/Constraint";
import { isCageConstraint, KillerCageProps } from "../../../../components/sudoku/constraints/killer-cage/KillerCage";
import { EggConstraint, eggTag } from "../constraints/Egg";
import { SmashedEgg } from "../constraints/SmashedEgg";

const isEgg = ({ tags = [] }: SokobanClue) => tags.includes(eggTag);

const isImportedEgg = (item: Constraint<SokobanPTM, any>): item is Constraint<SokobanPTM, KillerCageProps> =>
    isCageConstraint(item) &&
    item.cells.length === 1 &&
    (!item.props.sum || item.props.sum.toString().toLowerCase() === "egg");

const baseTypeManager = SokobanSudokuTypeManager({
    // distinctMovementSteps: true,
    isLightClue: isEgg,
    isSmashableClue: isEgg,
    isFallingClue: isEgg,
    smashedComponent: SmashedEgg,
});
export const EggSokobanSudokuTypeManager: SudokuTypeManager<SokobanPTM> = {
    ...baseTypeManager,
    postProcessPuzzle(puzzle): PuzzleDefinition<SokobanPTM> {
        const { items = [] } = puzzle;
        if (!Array.isArray(items)) {
            throw new Error("puzzle.items is expected to be an array for SokobanSudokuTypeManager");
        }

        puzzle = {
            ...puzzle,
            items: [
                ...items.filter((item) => !isImportedEgg(item)),
                ...items
                    .filter(isImportedEgg)
                    .map(({ cells: [cell], props: { lineColor } }) => EggConstraint(cell, lineColor)),
            ],
        };

        return baseTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;
    },
};
