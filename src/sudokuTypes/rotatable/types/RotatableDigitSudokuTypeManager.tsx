import {isStickyRotatableDigit, RotatableDigit} from "./RotatableDigit";
import {isStartAngle, isUpsideDownAngle} from "../utils/rotation";
import {RotatableDigitCellDataComponentType} from "../components/RotatableDigitCellData";
import {RotatableGameState, RotatableProcessedGameState} from "./RotatableGameState";
import {RotatableMainControls} from "../components/RotatableMainControls";
import {getCellDataSortIndexes} from "../../../components/sudoku/cell/CellDigits";
import {PositionWithAngle} from "../../../types/layout/Position";
import {useAnimatedValue} from "../../../hooks/useAnimatedValue";
import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {AnimationSpeed} from "../../../types/sudoku/AnimationSpeed";
import {CalculatorDigitComponentType} from "../../../components/sudoku/digit/CalculatorDigit";

const isRotatableDigit = (digit: number) => [6, 9].includes(digit);
const isRotatableCellData = ({digit, sticky}: RotatableDigit) => !sticky && isRotatableDigit(digit);

const toggleDigit = (digit: number, upsideDown = true) => upsideDown && isRotatableDigit(digit) ? 15 - digit : digit;

const toggleNumber = (digit: number, upsideDown = true) =>
    !upsideDown
        ? digit
        : Number(
            digit
                .toString()
                .split("")
                .map(c => toggleDigit(Number(c)))
                .reverse()
                .join("")
        );

const toggleData = (data: RotatableDigit, upsideDown = true) =>
    toggleDigit(data.digit, upsideDown && isRotatableCellData(data));

export const RotatableDigitSudokuTypeManager: SudokuTypeManager<RotatableDigit, RotatableGameState, RotatableProcessedGameState> = {
    areSameCellData(
        {digit, sticky = false},
        {digit: digit2, sticky: sticky2 = false}
    ) {
        return digit === digit2 && (sticky === sticky2 || !isRotatableDigit(digit));
    },

    compareCellData(
        data1,
        data2,
        state,
        forConstraints
    ): number {
        const upsideDown = isUpsideDownAngle(state?.angle || 0);

        return toggleData(data1, upsideDown) - toggleData(data2, upsideDown)
            || (forConstraints ? 0 : (data1.sticky ? 1 : 0) - (data2.sticky ? 1 : 0));
    },

    getCellDataHash(data: RotatableDigit): string {
        return `${data.digit}-${isRotatableCellData(data)}`;
    },

    cloneCellData(digit: RotatableDigit) {
        return {...digit};
    },

    createCellDataByDisplayDigit(digit: number, {isStickyMode}: RotatableGameState): RotatableDigit {
        return {
            digit,
            sticky: isStickyMode,
        };
    },

    createCellDataByTypedDigit(digit: number, {isStickyMode, angle}: RotatableGameState): RotatableDigit {
        const naiveResult: RotatableDigit = {
            digit,
            sticky: isStickyMode,
        };

        return {
            ...naiveResult,
            digit: toggleData(naiveResult, isUpsideDownAngle(angle))
        }
    },

    getDigitByCellData(data, {angle}) {
        return toggleData(data, isUpsideDownAngle(angle));
    },

    transformDigit(digit, puzzle, {angle}) {
        return toggleNumber(digit, isUpsideDownAngle(angle));
    },

    processCellDataPosition(
        puzzle,
        basePosition,
        dataSet,
        dataIndex,
        positionFunction,
        cellPosition?,
        state?
    ): PositionWithAngle | undefined {
        const upsideDownIndexes = getCellDataSortIndexes<RotatableDigit>(
            dataSet,
            (a, b) =>
                toggleData(a) - toggleData(b) || (a.sticky ? 1 : 0) - (b.sticky ? 1 : 0),
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
            angle: getAnimatedValue(basePosition.angle, -upsideDownPosition.angle)
                + (isStickyRotatableDigit(dataSet.at(dataIndex)) ? -(state?.animatedAngle || 0) : 0),
        }
    },

    digitComponentType: CalculatorDigitComponentType,

    cellDataComponentType: RotatableDigitCellDataComponentType,

    initialGameStateExtension: {
        angle: -90,
        isStickyMode: false,
        animationSpeed: AnimationSpeed.regular,
    },

    isReady({angle}: RotatableGameState): boolean {
        return !isStartAngle(angle);
    },

    useProcessedGameStateExtension({angle, animationSpeed}: RotatableGameState): Omit<RotatableProcessedGameState, keyof RotatableGameState> {
        const animatedAngle = useAnimatedValue(angle, animationSpeed);

        return {animatedAngle};
    },

    getFieldAngle({animatedAngle}: RotatableProcessedGameState): number {
        return animatedAngle;
    },

    processArrowDirection(
        currentCell,
        xDirection,
        yDirection,
        fieldSize,
        isMainKeyboard,
        gameState
    ) {
        if (!isMainKeyboard) {
            return undefined;
        }

        const coeff = isUpsideDownAngle(gameState.angle || 0) ? -1 : 1;

        return defaultProcessArrowDirection(
            currentCell,
            coeff * xDirection,
            coeff * yDirection,
            fieldSize
        );
    },

    hasBottomRowControls: true,

    mainControlsComponent: RotatableMainControls,
};
