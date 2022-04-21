import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {AnimationSpeed} from "../../../types/sudoku/AnimationSpeed";
import {RotatablePuzzleBoxGameState, RotatablePuzzleBoxProcessedGameState} from "./RotatablePuzzleBoxGameState";
import {DigitSudokuTypeManager} from "../../default/types/DigitSudokuTypeManager";
import {CellDataComponentType} from "../../../components/sudoku/cell/CellDataComponentType";
import {RotatablePuzzleBoxMainControls} from "../components/RotatablePuzzleBoxMainControls";

const {
    cellDataComponentType,
    mainControlsComponent,
    secondaryControlsComponent,
    ...otherRegularImplementation
} = DigitSudokuTypeManager();

export const RotatablePuzzleBoxSudokuTypeManager: SudokuTypeManager<number, RotatablePuzzleBoxGameState, RotatablePuzzleBoxProcessedGameState> = {
    cellDataComponentType: cellDataComponentType as CellDataComponentType<number, any>,
    ...otherRegularImplementation,

    initialGameStateExtension: {
        angle: 0,
    },

    useProcessedGameStateExtension({angle}) {
        const animatedAngle = useAnimatedValue(angle, AnimationSpeed.regular);

        return {animatedAngle};
    },

    mainControlsCount: 1,

    mainControlsComponent: RotatablePuzzleBoxMainControls,
};
