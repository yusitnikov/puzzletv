import {CellState} from "../../../types/sudoku/CellState";
import {emptyPositionWithAngle, Position, PositionWithAngle} from "../../../types/layout/Position";
import {Set} from "../../../types/struct/Set";
import {ProcessedGameState} from "../../../types/sudoku/GameState";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";

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
    puzzle: PuzzleDefinition<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>;
    data: Partial<CellState<CellType>>;
    initialData?: CellType;
    size: number;
    cellPosition?: Position;
    state?: ProcessedGameState<CellType> & ProcessedGameStateExtensionType;
    mainColor?: boolean;
}

export const CellDigits = <CellType, GameStateExtensionType = {}, ProcessedGameStateExtensionType = {}>(
    {puzzle, data, initialData, size, cellPosition, state, mainColor}: CellDigitsProps<CellType, GameStateExtensionType, ProcessedGameStateExtensionType>
) => {
    const {
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

    const centerDigitsCoeff = centerDigitCoeff / Math.max(1, centerDigitCoeff * widthCoeff * ((centerDigits?.size || 0) + 1));

    const renderAnimatedDigitsSet = (
        keyPrefix: string,
        digits: Set<CellType>,
        digitSize: number,
        positionFunction: (index: number) => PositionWithAngle | undefined,
        isInitial = false
    ) => {
        const straightIndexes = getCellDataSortIndexes(digits, compareCellData);

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
            />;
        });
    };

    return <AutoSvg
        width={size}
        height={size}
    >
        <AutoSvg
            left={size / 2}
            top={size / 2}
            width={size}
            height={size}
        >
            {initialData && renderAnimatedDigitsSet(
                "initial",
                new Set([initialData]),
                size * 0.7,
                () => emptyPositionWithAngle,
                true
            )}

            {!initialData && usersDigit && renderAnimatedDigitsSet(
                "users",
                new Set([usersDigit]),
                size * 0.7,
                () => emptyPositionWithAngle
            )}

            {centerDigits && renderAnimatedDigitsSet(
                "center",
                centerDigits,
                size * centerDigitsCoeff,
                (index) => ({
                    left: size * centerDigitsCoeff * widthCoeff * (index - (centerDigits.size - 1) / 2),
                    top: 0,
                    angle: 0,
                })
            )}

            {cornerDigits && renderAnimatedDigitsSet(
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
    </AutoSvg>;
};

export const getCellDataSortIndexes = <CellType,>(
    digits: Set<CellType>,
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
