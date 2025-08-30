import { Constraint } from "../../../types/puzzle/Constraint";
import { CrackTheCodePTM } from "../types/CrackTheCodePTM";
import { notFinishedResultCheck, successResultCheck } from "../../../types/puzzle/PuzzleResultCheck";

export const CrackTheCodeValidationConstraint: Constraint<CrackTheCodePTM> = {
    name: "code validation",
    cells: [],
    props: undefined,
    isValidPuzzle: (_lines, _digits, _cells, { puzzle, stateExtension: { currentWord } }) =>
        puzzle.extension.conditions.every((condition) => [1, true].includes(condition(currentWord)))
            ? successResultCheck(puzzle)
            : notFinishedResultCheck(),
};
