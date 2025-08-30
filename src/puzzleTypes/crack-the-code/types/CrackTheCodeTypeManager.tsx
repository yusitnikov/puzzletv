import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { CrackTheCodePTM } from "./CrackTheCodePTM";
import { addGameStateExToPuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { DigitPuzzleTypeManager } from "../../default/types/DigitPuzzleTypeManager";
import { CrackTheCodeGridControls } from "../components/CrackTheCodeGridControls";
import { mergePuzzleItems } from "../../../types/puzzle/PuzzleDefinition";
import { CrackTheCodeValidationConstraint } from "../constraints/CrackTheCodeValidation";
import { isValidFinishedPuzzleByConstraints } from "../../../types/puzzle/Constraint";
import { CrackTheCodeRules } from "../components/CrackTheCodeRules";

export const CrackTheCodeTypeManager: PuzzleTypeManager<CrackTheCodePTM> = {
    ...addGameStateExToPuzzleTypeManager(DigitPuzzleTypeManager(), {
        initialGameStateExtension: {
            currentWord: "",
            submittedWords: [],
            assumptionsPanelOpened: false,
            assumptions: [],
        },
    }),

    gridControlsComponent: CrackTheCodeGridControls,

    postProcessPuzzle(puzzle) {
        puzzle = {
            ...puzzle,
            items: mergePuzzleItems(puzzle.items, [CrackTheCodeValidationConstraint]),
            resultChecker: isValidFinishedPuzzleByConstraints,
            rules: () => <CrackTheCodeRules />,
            maxDigit: 0,
            disableColoring: true,
            hideDeleteButton: true,
            disableHistory: true,
        };

        return puzzle;
    },
};
