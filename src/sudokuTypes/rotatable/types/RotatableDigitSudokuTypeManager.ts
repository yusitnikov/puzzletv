import {RotatableDigit} from "./RotatableDigit";
import {isUpsideDownAngle} from "../utils/rotation";
import {RotatableDigitCellDataComponentType} from "../components/RotatableDigitCellData";
import {getCellDataSortIndexes} from "../../../components/sudoku/cell/CellDigits";
import {PositionWithAngle} from "../../../types/layout/Position";
import {defaultProcessArrowDirection, SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {CenteredCalculatorDigitComponentType} from "../../../components/sudoku/digit/CalculatorDigit";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {isCageConstraint, KillerCageProps} from "../../../components/sudoku/constraints/killer-cage/KillerCage";
import {ControlButtonRegion} from "../../../components/sudoku/controls/ControlButtonsManager";
import {RotateLeftButton, RotateRightButton} from "../components/RotateButton";
import {StickyModeButton} from "../components/StickyModeButton";
import {loop, roundToStep} from "../../../utils/math";
import {RotatableDigitPTM} from "./RotatablePTM";
import {isRotatableDigit, rotateDigit, rotateNumber} from "../../../components/sudoku/digit/DigitComponentType";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {AddGameStateEx, addGameStateExToSudokuManager} from "../../../types/sudoku/SudokuTypeManagerPlugin";
import {RotatableGameState} from "./RotatableGameState";
import {PuzzleImportOptions} from "../../../types/sudoku/PuzzleImportOptions";

const isRotatableCellData = (puzzle: PuzzleDefinition<RotatableDigitPTM>, {digit, sticky}: RotatableDigit) =>
    !sticky && isRotatableDigit(puzzle, digit) && rotateDigit(puzzle, digit, 180) !== digit;

const rotateCellData = (puzzle: PuzzleDefinition<RotatableDigitPTM>, data: RotatableDigit, angle = 180) =>
    data.sticky ? data.digit : rotateDigit(puzzle, data.digit, roundToStep(angle, 180));

export const RotatableDigitSudokuTypeManagerBase = <T extends AnyPTM>(
    baseTypeManager: SudokuTypeManager<T>,
    startAngle: number,
    angleDelta: number,
    showBackButton: boolean,
    showStickyMode: boolean,
    compensateConstraintDigitAngle: boolean,
): SudokuTypeManager<AddGameStateEx<T, RotatableGameState, {}>> => ({
    ...addGameStateExToSudokuManager(baseTypeManager, {
        initialGameStateExtension: {
            isStickyMode: false,
        },
    }),
    initialAngle: startAngle,
    angleStep: angleDelta,
    allowRotation: true,
    isFreeRotation: false,
    compensateConstraintDigitAngle,

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
    ) {
        return {extension: {isStickyMode}};
    },

    rotationallySymmetricDigits: true,
});

export const RotatableDigitSudokuTypeManager = ({stickyDigits = false}: Partial<PuzzleImportOptions> = {}): SudokuTypeManager<RotatableDigitPTM> => RotatableDigitSudokuTypeManagerBase<RotatableDigitPTM>(
    {
        areSameCellData(
            data1,
            data2,
            context,
            cell1,
        ) {
            const {puzzle} = context;

            const forConstraints = cell1 !== undefined;
            if (forConstraints) {
                const angle = context.angle;
                return rotateCellData(puzzle, data1, angle) === rotateCellData(puzzle, data2, angle);
            }

            const {digit, sticky = false} = data1;
            const {digit: digit2, sticky: sticky2 = false} = data2;
            return digit === digit2 && (sticky === sticky2 || rotateDigit(puzzle, digit, 180) === digit);
        },

        compareCellData(data1, data2, context, useState = true, forConstraints = true): number {
            const angle = useState ? context.angle : 0;

            return rotateCellData(context.puzzle, data1, angle) - rotateCellData(context.puzzle, data2, angle)
                || (forConstraints ? 0 : (data1.sticky ? 1 : 0) - (data2.sticky ? 1 : 0));
        },

        getCellDataHash(data, puzzle): string {
            return `${data.digit}-${isRotatableCellData(puzzle, data)}`;
        },

        cloneCellData(digit) {
            return {...digit};
        },

        serializeCellData(data): any {
            return data;
        },

        unserializeCellData(data: any): RotatableDigit {
            return data as RotatableDigit;
        },

        createCellDataByDisplayDigit(digit, {stateExtension: {isStickyMode}, puzzle}): RotatableDigit {
            return {
                digit,
                sticky: isStickyMode || !!puzzle.importOptions?.stickyDigits,
            };
        },

        createCellDataByTypedDigit(digit, {puzzle, angle, stateExtension: {isStickyMode}}): RotatableDigit {
            const naiveResult: RotatableDigit = {
                digit,
                sticky: isStickyMode || !!puzzle.importOptions?.stickyDigits,
            };

            return {
                ...naiveResult,
                digit: rotateCellData(puzzle, naiveResult, angle)
            };
        },

        createCellDataByImportedDigit(digit, importOptions): RotatableDigit {
            return {
                digit,
                sticky: !!importOptions.stickyDigits,
            };
        },

        getDigitByCellData(data, {puzzle, angle}) {
            return rotateCellData(puzzle, data, angle);
        },

        transformNumber(num, {puzzle, angle}) {
            return isUpsideDownAngle(angle) ? rotateNumber(puzzle, num) : num;
        },

        processCellDataPosition(
            context,
            basePosition,
            dataSet,
            dataIndex,
            positionFunction,
            cellPosition,
        ): PositionWithAngle | undefined {
            const {puzzle} = context;

            const upsideDownIndexes = getCellDataSortIndexes<RotatableDigit>(
                dataSet,
                (a, b) => rotateCellData(puzzle, a) - rotateCellData(puzzle, b) || (a.sticky ? 1 : 0) - (b.sticky ? 1 : 0),
                "sortUpsideDownIndexes"
            );

            const upsideDownPosition = positionFunction(upsideDownIndexes[dataIndex] ?? 0);
            if (!upsideDownPosition) {
                return undefined;
            }

            const animatedAngle = cellPosition ? context.animatedAngle : 0;
            const angleCoeff = Math.abs(loop(animatedAngle, 360) / 180 - 1);
            const getAnimatedValue = (straight: number, upsideDown: number) => straight * angleCoeff + upsideDown * (1 - angleCoeff);

            const data = dataSet.at(dataIndex);

            return {
                left: getAnimatedValue(basePosition.left, -upsideDownPosition.left),
                top: getAnimatedValue(basePosition.top, -upsideDownPosition.top),
                angle: getAnimatedValue(basePosition.angle, -upsideDownPosition.angle)
                    + (!data || data.sticky || !isRotatableDigit(puzzle, data.digit) ? -animatedAngle : 0),
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

            const coeff = isUpsideDownAngle(context.angle) ? -1 : 1;

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
                items: (context) => (typeof items === "function" ? items(context) : items).map(
                    (item) => isCageConstraint(item)
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
    },
    -90,
    180,
    false,
    !stickyDigits,
    stickyDigits,
);
