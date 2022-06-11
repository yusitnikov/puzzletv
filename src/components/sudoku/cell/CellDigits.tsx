import {CellState, isEmptyCellState} from "../../../types/sudoku/CellState";
import {emptyPositionWithAngle, Position, PositionWithAngle} from "../../../types/layout/Position";
import {Set, SetInterface} from "../../../types/struct/Set";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {getExcludedDigitDataHash, getMainDigitDataHash} from "../../../utils/playerDataHash";
import {FieldCellUserArea} from "../field/FieldCellUserArea";
import {CellDataSet} from "../../../types/sudoku/CellDataSet";

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

export interface CellDigitsProps<CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}> {
    context: PuzzleContext<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    data: Partial<CellState<CellType>>;
    initialData?: CellType;
    excludedDigits?: SetInterface<CellType>;
    size: number;
    cellPosition?: Position;
    mainColor?: boolean;
    isValidUserDigit?: boolean;
}

export const shouldSkipCellDigits = <CellType,>(initialData: CellType | undefined, excludedDigits: SetInterface<CellType> | undefined, data: Partial<CellState<CellType>>) =>
    initialData === undefined && !excludedDigits?.size && isEmptyCellState(data, true);

export const CellDigits = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {context, data, initialData, excludedDigits, size, cellPosition, mainColor, isValidUserDigit = true}: CellDigitsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    if (shouldSkipCellDigits(initialData, excludedDigits, data)) {
        return null;
    }

    const state = cellPosition ? context.state : undefined;

    const {puzzle, multiPlayer: {isEnabled}} = context;

    const {
        params,
        typeManager: {
            cellDataComponentType: {
                component: CellData,
                widthCoeff,
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
        digits: SetInterface<CellType>,
        digitSize: number,
        positionFunction: (index: number) => PositionWithAngle | undefined,
        isInitial = false,
        isValid: boolean | ((cellData: CellType) => boolean) = true,
        isRecent: boolean | ((cellData: CellType) => boolean) = false
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
                data={cellData}
                size={digitSize}
                {...position}
                state={state}
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
                    size * 0.7,
                    () => emptyPositionWithAngle,
                    true,
                    true,
                    cellPosition && context.state.lastPlayerObjects[getMainDigitDataHash(cellPosition)]
                )}

                {initialData === undefined && usersDigit !== undefined && renderAnimatedDigitsSet(
                    "users",
                    new CellDataSet(puzzle, [usersDigit]),
                    size * 0.7,
                    () => emptyPositionWithAngle,
                    false,
                    isValidUserDigit
                )}

                {initialData === undefined && !!allCenterDigits.size && renderAnimatedDigitsSet(
                    "center",
                    allCenterDigits,
                    size * centerDigitsCoeff,
                    (index) => ({
                        left: size * centerDigitsCoeff * widthCoeff * (index - (allCenterDigits.size - 1) / 2),
                        top: 0,
                        angle: 0,
                    }),
                    false,
                    (cellData) => !excludedDigits?.contains(cellData),
                    (cellData) => !!cellPosition && context.state.lastPlayerObjects[getExcludedDigitDataHash(cellPosition, cellData, context)]
                )}

                {initialData === undefined && cornerDigits?.size && renderAnimatedDigitsSet(
                    "corner",
                    cornerDigits,
                    size * cornerDigitCoeff,
                    (index) => (corners[index] && {
                        left: size * corners[index].left * (0.45 - cornerDigitCoeff * 0.5),
                        top: size * corners[index].top * (0.45 - cornerDigitCoeff * 0.5),
                        angle: 0,
                    })
                )}
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
