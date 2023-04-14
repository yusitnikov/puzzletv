import {isStickyRotatableDigit, RotatableDigit} from "./RotatableDigit";
import {isUpsideDownAngle} from "../utils/rotation";
import {RotatableDigitCellDataComponentType} from "../components/RotatableDigitCellData";
import {getCellDataSortIndexes} from "../../../components/sudoku/cell/CellDigits";
import {PositionWithAngle} from "../../../types/layout/Position";
import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {CenteredCalculatorDigitComponentType} from "../../../components/sudoku/digit/CalculatorDigit";
import {PartialGameStateEx} from "../../../types/sudoku/GameState";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {cageTag, KillerCageProps} from "../../../components/sudoku/constraints/killer-cage/KillerCage";
import {ControlButtonRegion} from "../../../components/sudoku/controls/ControlButtonsManager";
import {RotateLeftButton, RotateRightButton} from "../components/RotateButton";
import {AnimationSpeedControlButtonItem} from "../../../components/sudoku/controls/AnimationSpeedControlButton";
import {StickyModeButton} from "../components/StickyModeButton";
import {loop} from "../../../utils/math";
import {RotatableDigitPTM, RotatablePTM} from "./RotatablePTM";

export const isRotatableDigit = (digit: number) => [6, 9].includes(digit);
export const isSelfRotatableDigit = (digit: number) => [0, 1, 2, 5, 8].includes(digit);
const isRotatableCellData = ({digit, sticky}: RotatableDigit) => !sticky && isRotatableDigit(digit);

export const toggleDigit = (digit: number, upsideDown = true) => upsideDown && isRotatableDigit(digit) ? 15 - digit : digit;

export const toggleNumber = (digit: number, upsideDown = true) =>
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

export const RotatableDigitSudokuTypeManagerBase = <CellType,>(
    startAngle: number,
    angleDelta: number,
    showBackButton: boolean,
    showStickyMode: boolean
): Required<Pick<
    SudokuTypeManager<RotatablePTM<CellType>>,
    "initialAngle" | "angleStep" | "allowRotation" | "isFreeRotation" | "serializeGameState" | "unserializeGameState" |
    "initialGameStateExtension" | "isReady" | "controlButtons" | "getInternalState" | "unserializeInternalState" |
    "rotationallySymmetricDigits"
>> => ({
    initialAngle: startAngle,
    angleStep: angleDelta,
    allowRotation: true,
    isFreeRotation: false,

    serializeGameState() {
        return {};
    },

    unserializeGameState() {
        return {};
    },

    initialGameStateExtension: {
        isStickyMode: false,
    },

    isReady({angle}): boolean {
        return startAngle === 0 || angle !== startAngle;
    },

    controlButtons: [
        {
            key: "rotate-right",
            region: ControlButtonRegion.additional,
            Component: RotateRightButton,
        },
        showBackButton && {
            key: "rotate-left",
            region: ControlButtonRegion.additional,
            Component: RotateLeftButton,
        },
        showStickyMode && {
            key: "sticky-mode",
            region: ControlButtonRegion.additional,
            Component: StickyModeButton,
        },
        AnimationSpeedControlButtonItem(),
    ],

    getInternalState(
        puzzle,
        {extension: {isStickyMode}}
    ): any {
        return {isStickyMode};
    },

    unserializeInternalState(
        puzzle,
        {isStickyMode}: any
    ): PartialGameStateEx<RotatablePTM<CellType>> {
        return {extension: {isStickyMode}};
    },

    rotationallySymmetricDigits: true,
});

export const RotatableDigitSudokuTypeManager: SudokuTypeManager<RotatableDigitPTM> = {
    ...RotatableDigitSudokuTypeManagerBase<RotatableDigit>(-90, 180, false, true),

    areSameCellData(
        data1,
        data2,
        state,
        forConstraint
    ) {
        if (forConstraint) {
            const isUpsideDown = isUpsideDownAngle(state?.angle ?? 0);
            return toggleData(data1, isUpsideDown) === toggleData(data2, isUpsideDown);
        }

        const {digit, sticky = false} = data1;
        const {digit: digit2, sticky: sticky2 = false} = data2;
        return digit === digit2 && (sticky === sticky2 || !isRotatableDigit(digit));
    },

    compareCellData(
        data1,
        data2,
        state,
        forConstraints
    ): number {
        const upsideDown = isUpsideDownAngle(state?.angle ?? 0);

        return toggleData(data1, upsideDown) - toggleData(data2, upsideDown)
            || (forConstraints ? 0 : (data1.sticky ? 1 : 0) - (data2.sticky ? 1 : 0));
    },

    getCellDataHash(data: RotatableDigit): string {
        return `${data.digit}-${isRotatableCellData(data)}`;
    },

    cloneCellData(digit: RotatableDigit) {
        return {...digit};
    },

    serializeCellData(data: RotatableDigit): any {
        return data;
    },

    unserializeCellData(data: any): RotatableDigit {
        return data as RotatableDigit;
    },

    createCellDataByDisplayDigit(digit, {extension: {isStickyMode}}): RotatableDigit {
        return {
            digit,
            sticky: isStickyMode,
        };
    },

    createCellDataByTypedDigit(digit, {state: {angle, extension: {isStickyMode}}}): RotatableDigit {
        const naiveResult: RotatableDigit = {
            digit,
            sticky: isStickyMode,
        };

        return {
            ...naiveResult,
            digit: toggleData(naiveResult, isUpsideDownAngle(angle))
        };
    },

    createCellDataByImportedDigit(digit): RotatableDigit {
        return {digit};
    },

    getDigitByCellData(data, {state: {angle}}) {
        return toggleData(data, isUpsideDownAngle(angle));
    },

    transformNumber(num, {state: {angle}}) {
        return toggleNumber(num, isUpsideDownAngle(angle));
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
            (a, b) => toggleData(a) - toggleData(b) || (a.sticky ? 1 : 0) - (b.sticky ? 1 : 0),
            "sortUpsideDownIndexes"
        );

        const upsideDownPosition = positionFunction(upsideDownIndexes[dataIndex]);
        if (!upsideDownPosition) {
            return undefined;
        }

        const animatedAngle = state?.processed.animated.angle ?? 0;
        const angleCoeff = Math.abs(loop(animatedAngle, 360) / 180 - 1);
        const getAnimatedValue = (straight: number, upsideDown: number) => straight * angleCoeff + upsideDown * (1 - angleCoeff);

        return {
            left: getAnimatedValue(basePosition.left, -upsideDownPosition.left),
            top: getAnimatedValue(basePosition.top, -upsideDownPosition.top),
            angle: getAnimatedValue(basePosition.angle, -upsideDownPosition.angle)
                + (isStickyRotatableDigit(dataSet.at(dataIndex)!) ? -animatedAngle : 0),
        };
    },

    digitComponentType: CenteredCalculatorDigitComponentType(),

    cellDataComponentType: RotatableDigitCellDataComponentType(),

    processArrowDirection(
        currentCell,
        xDirection,
        yDirection,
        context,
        isMainKeyboard
    ) {
        if (!isMainKeyboard) {
            return {};
        }

        const coeff = isUpsideDownAngle(context.state.angle) ? -1 : 1;

        return defaultProcessArrowDirection(
            currentCell,
            coeff * xDirection,
            coeff * yDirection,
            context
        );
    },

    postProcessPuzzle({items = [], ...puzzle}): PuzzleDefinition<RotatableDigitPTM> {
        return {
            ...puzzle,
            items: (state) => (typeof items === "function" ? items(state) : items).map(
                (item) => item.tags?.includes(cageTag)
                    ? {
                        ...item,
                        props: {
                            ...item.props,
                            showBottomSum: true,
                        } as KillerCageProps,
                    }
                    : item
            ),
        };
    },
};
