import {CellState, isEmptyCellState} from "../../../types/sudoku/CellState";
import {emptyPositionWithAngle, Position, PositionWithAngle} from "../../../types/layout/Position";
import {Set, SetInterface} from "../../../types/struct/Set";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {getExcludedDigitDataHash, getMainDigitDataHash} from "../../../utils/playerDataHash";
import {FieldCellUserArea} from "../field/FieldCellUserArea";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {observer} from "mobx-react-lite";
import React, {ReactElement, useCallback, useMemo} from "react";
import {settings} from "../../../types/layout/Settings";
import {PencilmarksCheckerMode} from "../../../types/sudoku/PencilmarksCheckerMode";
import {isValidUserDigit} from "../../../types/sudoku/Constraint";
import {mergeGivenDigitsMaps} from "../../../types/sudoku/GivenDigitsMap";
import {profiler} from "../../../utils/profiler";
import {useComputedValue} from "../../../hooks/useComputed";
import {comparer} from "mobx";

export const mainDigitCoeff = 0.7;

const centerDigitCoeff = 0.35;

const cornerDigitCoeff = 0.3;
const corners: Position[] = [
    {left: -1, top: -1},
    {left: 1, top: -1},
    {left: -1, top: 1},
    {left: 1, top: 1},
    {left: 0, top: -1},
    {left: 0, top: 1},
    {left: -1, top: 0},
    {left: 1, top: 0},
    {left: 0, top: 0},
];

const emptyPositionFunction = () => emptyPositionWithAngle;

export interface FieldCellDigitsProps<T extends AnyPTM> extends Position {
    context: PuzzleContext<T>;
}

export const FieldCellDigits = observer(function FieldCellDigits<T extends AnyPTM>(
    {context, top, left}: FieldCellDigitsProps<T>
) {
    profiler.trace();

    const cellState = context.getCell(top, left);
    const initialData = context.puzzle.initialDigits?.[top]?.[left] || context.stateInitialDigits?.[top]?.[left];
    const cellExcludedDigits = context.excludedDigits[top][left];

    const cellPosition = useMemo((): Position => ({top, left}), [top, left]);

    const isValidUserDigitFn = useCallback(
        (digit: T["cell"] | undefined) =>
            !(settings.enableConflictChecker.get() || context.puzzle.forceEnableConflictChecker) ||
            context.puzzle.typeManager.disableConflictChecker ||
            (digit !== undefined && settings.pencilmarksCheckerMode.get() === PencilmarksCheckerMode.Off) ||
            isValidUserDigit(
                cellPosition,
                digit === undefined
                    ? context.userDigits
                    : mergeGivenDigitsMaps(context.userDigits, {[top]: {[left]: digit}}),
                context,
                false,
                digit !== undefined,
                digit !== undefined && settings.pencilmarksCheckerMode.get() === PencilmarksCheckerMode.CheckObvious
            ),
        [context, cellPosition, top, left]
    );

    if (initialData === undefined && !cellExcludedDigits?.size && isEmptyCellState(cellState, true)) {
        return null;
    }

    return <CellDigits
        context={context}
        data={cellState}
        initialData={initialData}
        excludedDigits={cellExcludedDigits}
        size={1}
        cellPosition={cellPosition}
        isValidUserDigit={isValidUserDigitFn}
    />;
}) as <T extends AnyPTM>(props: FieldCellDigitsProps<T>) => ReactElement | null;

export interface CellDigitsProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    data: Partial<CellState<T>>;
    initialData?: T["cell"];
    excludedDigits?: SetInterface<T["cell"]>;
    size: number;
    cellPosition?: Position;
    mainColor?: boolean;
    isValidUserDigit?: (digit?: T["cell"]) => boolean;
}

export const CellDigits = observer(function CellDigits<T extends AnyPTM>(
    {context, data, initialData, excludedDigits, size, cellPosition, mainColor = false, isValidUserDigit = () => true}: CellDigitsProps<T>
) {
    profiler.trace();

    const {puzzle} = context;

    const {
        typeManager: {
            digitComponentType,
            cellDataDigitComponentType = digitComponentType,
            cellDataComponentType: {
                widthCoeff = cellDataDigitComponentType.widthCoeff,
            },
        },
    } = puzzle;

    const {
        usersDigit,
        centerDigits,
        cornerDigits
    } = data;

    const initialDataSet = useMemo(
        () => initialData && new CellDataSet(puzzle, [initialData]),
        [puzzle, initialData]
    );

    const isRecentInitialData = useCallback(
        () => !!cellPosition && context.lastPlayerObjects[getMainDigitDataHash(cellPosition)],
        [context, cellPosition]
    );

    const usersDigitSet = useMemo(
        () => usersDigit && new CellDataSet(puzzle, [usersDigit]),
        [puzzle, usersDigit]
    );

    const isValidMainDigit = useCallback(
        () => isValidUserDigit(),
        [isValidUserDigit]
    );

    const allCenterDigits = useMemo(
        () => Set.merge(
            ...[centerDigits, excludedDigits]
                .filter(set => set)
                .map(set => set!)
        ),
        [centerDigits, excludedDigits]
    );
    const centerDigitsCount = allCenterDigits.size;
    const centerDigitsCoeff = centerDigitCoeff / Math.max(1, centerDigitCoeff * widthCoeff * (centerDigitsCount + 1));
    const centerDigitPositionFn = useCallback(
        (index: number): PositionWithAngle => ({
            left: size * centerDigitsCoeff * widthCoeff * (index - (centerDigitsCount - 1) / 2),
            top: 0,
            angle: 0,
        }),
        [size, centerDigitsCoeff, widthCoeff, centerDigitsCount]
    );
    const isValidCenterDigit = useCallback(
        (cellData: T["cell"]) => !excludedDigits?.contains(cellData) && isValidUserDigit(cellData),
        [excludedDigits, isValidUserDigit]
    );
    const isRecentCenterDigit = useCallback(
        (cellData: T["cell"]) => !!cellPosition && context.lastPlayerObjects[getExcludedDigitDataHash(cellPosition, cellData, context)],
        [context, cellPosition]
    );

    const cornerDigitPositionFn = useCallback(
        (index: number): PositionWithAngle => (corners[index] && {
            left: size * corners[index].left * (0.45 - cornerDigitCoeff * 0.5),
            top: size * corners[index].top * (0.45 - cornerDigitCoeff * 0.5),
            angle: 0,
        }),
        [size]
    );

    return <AutoSvg
        width={size}
        height={size}
    >
        <FieldCellUserArea
            context={context}
            cellPosition={cellPosition}
        >
            <AutoSvg
                left={size / 2}
                top={size / 2}
                width={size}
                height={size}
            >
                {initialDataSet !== undefined && <AnimatedDigitsSet
                    context={context}
                    cellPosition={cellPosition}
                    digits={initialDataSet}
                    digitSize={size * mainDigitCoeff}
                    positionFunction={emptyPositionFunction}
                    isInitial={true}
                    isValid={true}
                    isRecent={isRecentInitialData}
                />}

                {initialData === undefined && <>
                    {usersDigitSet !== undefined && <AnimatedDigitsSet
                        context={context}
                        cellPosition={cellPosition}
                        digits={usersDigitSet}
                        digitSize={size * mainDigitCoeff}
                        positionFunction={emptyPositionFunction}
                        isInitial={mainColor}
                        isValid={isValidMainDigit}
                    />}

                    {usersDigit === undefined && <>
                        {!!centerDigitsCount && <AnimatedDigitsSet
                            context={context}
                            cellPosition={cellPosition}
                            digits={allCenterDigits}
                            digitSize={size * centerDigitsCoeff}
                            positionFunction={centerDigitPositionFn}
                            isInitial={mainColor}
                            isValid={isValidCenterDigit}
                            isRecent={isRecentCenterDigit}
                        />}

                        {!!cornerDigits?.size && <AnimatedDigitsSet
                            context={context}
                            cellPosition={cellPosition}
                            digits={cornerDigits}
                            digitSize={size * cornerDigitCoeff}
                            positionFunction={cornerDigitPositionFn}
                            isInitial={mainColor}
                            isValid={isValidUserDigit}
                        />}
                    </>}
                </>}
            </AutoSvg>
        </FieldCellUserArea>
    </AutoSvg>;
}) as <T extends AnyPTM>(props: CellDigitsProps<T>) => ReactElement | null;

interface AnimatedDigitsSetProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    cellPosition?: Position;
    digits: SetInterface<T["cell"]>;
    digitSize: number;
    positionFunction: (index: number) => PositionWithAngle | undefined;
    isInitial?: boolean;
    isValid?: boolean | ((cellData: T["cell"]) => boolean);
    isRecent?: boolean | ((cellData: T["cell"]) => boolean);
}

const AnimatedDigitsSet = observer(function AnimatedDigitsSet<T extends AnyPTM>(
    {
        context,
        cellPosition,
        digits,
        digitSize,
        positionFunction,
        isInitial = false,
        isValid = true,
        isRecent = false,
    }: AnimatedDigitsSetProps<T>
) {
    profiler.trace();

    const {puzzle} = context;

    const {
        typeManager: {
            cellDataComponentType: {
                component: CellData,
            },
        },
    } = puzzle;

    const areValid = useComputedValue(
        function areValidDigits() {
            return digits.items.map((cellData) => {
                return typeof isValid === "function" ? isValid(cellData) : isValid;
            });
        },
        {equals: comparer.structural},
        [digits, isValid]
    );
    const areRecent = useComputedValue(
        function areRecentDigits() {
            return digits.items.map((cellData) => {
                return context.multiPlayer.isEnabled && !context.puzzle.params?.share &&
                    (typeof isRecent === "function" ? isRecent(cellData) : isRecent);
            });
        },
        {equals: comparer.structural},
        [digits, isRecent]
    );
    const positions = useComputedValue(
        function digitPositions() {
            return digits.items.map((cellData, index) => {
                const {
                    processCellDataPosition,
                    compareCellData,
                } = context.puzzle.typeManager;

                const straightIndexes = getCellDataSortIndexes(
                    digits,
                    (a, b) => compareCellData(a, b, context, false, false)
                );

                const position = positionFunction(straightIndexes[index]);

                if (position && processCellDataPosition) {
                    return processCellDataPosition(context, position, digits, index, positionFunction, cellPosition);
                }

                return position;
            });
        },
        {equals: comparer.structural},
        [digits, positionFunction]
    );
    return <>
        {digits.items.map((cellData, index) => {
            const position = positions[index];
            if (!position) {
                return undefined;
            }

            return <CellData
                key={context.puzzle.typeManager.getCellDataHash(cellData, puzzle)}
                puzzle={puzzle}
                data={cellData}
                size={digitSize}
                {...position}
                isInitial={isInitial}
                isValid={areValid[index]}
                isRecent={areRecent[index]}
            />;
        })}
    </>;
}) as <T extends AnyPTM>(props: AnimatedDigitsSetProps<T>) => ReactElement;

export const getCellDataSortIndexes = <CellType,>(
    digits: SetInterface<CellType>,
    compareFn: (a: CellType, b: CellType) => number,
    cacheKey: string = "sortIndexes"
) => {
    const itemsWithIndexes = digits.cached(
        "withIndexes",
        () => digits.items.map((value, index) => ({value, index}))
    );

    return digits.cached(cacheKey, () => {
        const indexes = Array<number>(digits.size);

        itemsWithIndexes
            .sort(({value: a}, {value: b}) => compareFn(a, b))
            .forEach(
                ({value, index: initialIndex}, sortedIndex) =>
                    indexes[initialIndex] = sortedIndex
            );

        return indexes;
    });
};
