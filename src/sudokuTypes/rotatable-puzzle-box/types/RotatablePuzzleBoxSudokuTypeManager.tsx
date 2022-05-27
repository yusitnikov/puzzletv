import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {AnimationSpeed} from "../../../types/sudoku/AnimationSpeed";
import {RotatablePuzzleBoxGameState, RotatablePuzzleBoxProcessedGameState} from "./RotatablePuzzleBoxGameState";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {RotatablePuzzleBoxMainControls} from "../components/RotatablePuzzleBoxMainControls";
import {RegularDigitComponentType} from "../../../components/sudoku/digit/RegularDigit";

export const RotatablePuzzleBoxSudokuTypeManager: SudokuTypeManager<number, RotatablePuzzleBoxGameState, RotatablePuzzleBoxProcessedGameState> = {
    ...DigitSudokuTypeManager(
        RegularDigitComponentType,
        ({angle}) => ({angle}),
        ({angle}) => ({angle}),
    ),

    initialGameStateExtension: {
        angle: 0,
    },

    useProcessedGameStateExtension({angle}) {
        const animatedAngle = useAnimatedValue(angle, AnimationSpeed.regular);

        return {animatedAngle};
    },

    mainControlsComponent: RotatablePuzzleBoxMainControls,
};
