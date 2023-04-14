import {CellState, isEmptyCellState} from "../../../types/sudoku/CellState";
import {emptyPositionWithAngle, Position, PositionWithAngle} from "../../../types/layout/Position";
import {Set, SetInterface} from "../../../types/struct/Set";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {getExcludedDigitDataHash, getMainDigitDataHash} from "../../../utils/playerDataHash";
import {FieldCellUserArea} from "../field/FieldCellUserArea";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

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

export const shouldSkipCellDigits = <T extends AnyPTM>(
    initialData: T["cell"] | undefined,
    excludedDigits: SetInterface<T["cell"]> | undefined,
    data: Partial<CellState<T>>,
) =>
    initialData === undefined && !excludedDigits?.size && isEmptyCellState(data, true);

export const CellDigits = <T extends AnyPTM>(
    {context, data, initialData, excludedDigits, size, cellPosition, mainColor, isValidUserDigit = () => true}: CellDigitsProps<T>
) => {
    if (shouldSkipCellDigits(initialData, excludedDigits, data)) {
        return null;
    }

    const state = cellPosition ? context.state : undefined;

    const {puzzle, multiPlayer: {isEnabled}} = context;

    const {
        params,
        typeManager: {
            digitComponentType,
            cellDataDigitComponentType = digitComponentType,
            cellDataComponentType: {
                component: CellData,
                widthCoeff = cellDataDigitComponentType.widthCoeff,
            },
            processCellDataPosition,
            getCellDataHash,
            compareCellData,
        },
    } = puzzle;

    const {
        usersDigit,
        centerDigits,
        cornerDigits
    } = data;

    const allCenterDigits = Set.merge(...[centerDigits, excludedDigits].filter(set => set).map(set => set!));

    const centerDigitsCoeff = centerDigitCoeff / Math.max(1, centerDigitCoeff * widthCoeff * (allCenterDigits.size + 1));

    const renderAnimatedDigitsSet = (
        keyPrefix: string,
        digits: SetInterface<T["cell"]>,
        digitSize: number,
        positionFunction: (index: number) => PositionWithAngle | undefined,
        isInitial = false,
        isValid: boolean | ((cellData: T["cell"]) => boolean) = true,
        isRecent: boolean | ((cellData: T["cell"]) => boolean) = false
    ) => {
        const straightIndexes = getCellDataSortIndexes(digits, (a, b) => compareCellData(a, b, undefined, false));

        return digits.items.map((cellData, index) => {
            let position = positionFunction(straightIndexes[index]);
            if (!position) {
                return undefined;
            }

            if (processCellDataPosition) {
                position = processCellDataPosition(puzzle, position, digits, index, positionFunction, cellPosition, state);
                if (!position) {
                    return undefined;
                }
            }

            return <CellData
                key={`${keyPrefix}-${getCellDataHash(cellData)}`}
                puzzle={puzzle}
                data={cellData}
                size={digitSize}
                {...position}
                isInitial={isInitial || mainColor}
                isValid={typeof isValid === "function" ? isValid(cellData) : isValid}
                isRecent={isEnabled && !params?.share && (typeof isRecent === "function" ? isRecent(cellData) : isRecent)}
            />;
        });
    };

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
                {initialData !== undefined && renderAnimatedDigitsSet(
                    "initial",
                    new CellDataSet(puzzle, [initialData]),
                    size * mainDigitCoeff,
                    () => emptyPositionWithAngle,
                    true,
                    true,
                    cellPosition && context.state.processed.lastPlayerObjects[getMainDigitDataHash(cellPosition)]
                )}

                {initialData === undefined && <>
                    {usersDigit !== undefined && renderAnimatedDigitsSet(
                        "users",
                        new CellDataSet(puzzle, [usersDigit]),
                        size * mainDigitCoeff,
                        () => emptyPositionWithAngle,
                        false,
                        isValidUserDigit()
                    )}

                    {usersDigit === undefined && <>
                        {!!allCenterDigits.size && renderAnimatedDigitsSet(
                            "center",
                            allCenterDigits,
                            size * centerDigitsCoeff,
                            (index) => ({
                                left: size * centerDigitsCoeff * widthCoeff * (index - (allCenterDigits.size - 1) / 2),
                                top: 0,
                                angle: 0,
                            }),
                            false,
                            (cellData) => !excludedDigits?.contains(cellData) && isValidUserDigit(cellData),
                            (cellData) => !!cellPosition && context.state.processed.lastPlayerObjects[getExcludedDigitDataHash(cellPosition, cellData, context)]
                        )}

                        {cornerDigits?.size && renderAnimatedDigitsSet(
                            "corner",
                            cornerDigits,
                            size * cornerDigitCoeff,
                            (index) => (corners[index] && {
                                left: size * corners[index].left * (0.45 - cornerDigitCoeff * 0.5),
                                top: size * corners[index].top * (0.45 - cornerDigitCoeff * 0.5),
                                angle: 0,
                            }),
                            false,
                            (cellData) => isValidUserDigit(cellData)
                        )}
                    </>}
                </>}
            </AutoSvg>
        </FieldCellUserArea>
    </AutoSvg>;
};

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
