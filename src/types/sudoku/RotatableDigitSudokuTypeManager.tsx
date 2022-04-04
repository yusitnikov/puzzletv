import {RotatableDigit} from "./RotatableDigit";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {ProcessedGameState} from "../../hooks/sudoku/useGame";
import {isUpsideDownAngle} from "../../utils/rotation";
import {CalculatorDigitComponentType} from "../../components/sudoku/digit/CalculatorDigit";
import {RotatableDigitCellDataComponentType} from "../../components/sudoku/cell/RotatableDigitCellData";
import {Position} from "../layout/Position";
import {getCellDataSortIndexes} from "../../components/sudoku/cell/CellDigits";
import {Set} from "../struct/Set";

const isRotatableDigit = (digit: number) => [6, 9].includes(digit);
const isRotatableCellData = ({digit, sticky}: RotatableDigit) => !sticky && isRotatableDigit(digit);

const toggleDigit = (data: RotatableDigit, upsideDown = true) =>
    upsideDown && isRotatableCellData(data) ? 15 - data.digit : data.digit;

export const RotatableDigitSudokuTypeManager: SudokuTypeManager<RotatableDigit> = {
    areSameCellData({digit, sticky = false}: RotatableDigit, {digit: digit2, sticky: sticky2 = false}: RotatableDigit) {
        return digit === digit2 && (sticky === sticky2 || !isRotatableDigit(digit));
    },

    compareCellData(data1: RotatableDigit, data2: RotatableDigit, upsideDown = false): number {
        return toggleDigit(data1, upsideDown) - toggleDigit(data2, upsideDown)
            || (data1.sticky ? 1 : 0) - (data2.sticky ? 1 : 0);
    },

    getCellDataHash(data: RotatableDigit): string {
        return `${data.digit}-${isRotatableCellData(data)}`;
    },

    cloneCellData(digit: RotatableDigit) {
        return {...digit};
    },

    createCellDataByDisplayDigit(digit: number, {isStickyMode}: ProcessedGameState<RotatableDigit>): RotatableDigit {
        return {
            digit,
            sticky: isStickyMode,
        };
    },

    createCellDataByTypedDigit(
        digit: number,
        {isStickyMode, angle}: ProcessedGameState<RotatableDigit>
    ): RotatableDigit {
        const naiveResult: RotatableDigit = {
            digit,
            sticky: isStickyMode,
        };

        return {
            ...naiveResult,
            digit: toggleDigit(naiveResult, isUpsideDownAngle(angle))
        }
    },

    processCellDataPosition(
        basePosition: Position,
        dataSet: Set<RotatableDigit>,
        dataIndex: number,
        positionFunction: (index: number) => (Position | undefined),
        state?: ProcessedGameState<RotatableDigit>
    ): Position | undefined {
        const upsideDownIndexes = getCellDataSortIndexes<RotatableDigit>(
            dataSet,
            (a, b) =>
                toggleDigit(a) - toggleDigit(b) || (a.sticky ? 1 : 0) - (b.sticky ? 1 : 0),
            "sortUpsideDownIndexes"
        );

        const upsideDownPosition = positionFunction(upsideDownIndexes[dataIndex]);
        if (!upsideDownPosition) {
            return undefined;
        }

        const angleCoeff = Math.abs(((state?.animatedAngle || 0) % 360) / 180 - 1);
        const getAnimatedValue = (straight: number, upsideDown: number) =>
            straight * angleCoeff + upsideDown * (1 - angleCoeff);

        return {
            left: getAnimatedValue(basePosition.left, -upsideDownPosition.left),
            top: getAnimatedValue(basePosition.top, -upsideDownPosition.top),
        }
    },

    digitComponentType: CalculatorDigitComponentType,

    cellDataComponentType: RotatableDigitCellDataComponentType,
};
