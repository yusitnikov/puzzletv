import {Absolute} from "../../layout/absolute/Absolute";
import {CellState} from "../../../types/sudoku/CellState";
import {Position} from "../../../types/layout/Position";
import {Set} from "../../../types/struct/Set";
import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {ProcessedGameState} from "../../../hooks/sudoku/useGame";

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

export interface CellDigitsProps<CellType> {
    typeManager: SudokuTypeManager<CellType>;
    data: Partial<CellState<CellType>>;
    size: number;
    state?: ProcessedGameState<CellType>;
    mainColor?: boolean;
}

export const CellDigits = <CellType,>({typeManager, data, size, state, mainColor}: CellDigitsProps<CellType>) => {
    const {
        cellDataComponentType: {
            component: CellData,
            widthCoeff,
        },
    } = typeManager;

    const {
        initialDigit,
        usersDigit,
        centerDigits,
        cornerDigits
    } = data;

    const centerDigitsCoeff = centerDigitCoeff / Math.max(1, centerDigitCoeff * widthCoeff * ((centerDigits?.size || 0) + 1));

    const renderAnimatedDigitsSet = (
        keyPrefix: string,
        digits: Set<CellType>,
        digitSize: number,
        positionFunction: (index: number) => Position | undefined
    ) => {
        const straightIndexes = getCellDataSortIndexes(digits, typeManager.compareCellData);

        return digits.items.map((cellData, index) => {
            let position = positionFunction(straightIndexes[index]);
            if (!position) {
                return undefined;
            }

            if (typeManager.processCellDataPosition) {
                position = typeManager.processCellDataPosition(position, digits, index, positionFunction, state);
                if (!position) {
                    return undefined;
                }
            }

            return <CellData
                key={`${keyPrefix}-${typeManager.getCellDataHash(cellData)}`}
                data={cellData}
                size={digitSize}
                {...position}
                state={state}
                isInitial={mainColor}
            />;
        });
    };

    return <Absolute left={size / 2} top={size / 2}>
        {initialDigit && <CellData
            key={"initial"}
            data={initialDigit}
            size={size * 0.7}
            state={state}
            isInitial={true}
        />}

        {!initialDigit && usersDigit && <CellData
            key={"users"}
            data={usersDigit}
            size={size * 0.7}
            state={state}
            isInitial={mainColor}
        />}

        {centerDigits && renderAnimatedDigitsSet(
            "center",
            centerDigits,
            size * centerDigitsCoeff,
            (index) => ({
                left: size * centerDigitsCoeff * widthCoeff * (index - (centerDigits.size - 1) / 2),
                top: 0,
            })
        )}

        {cornerDigits && renderAnimatedDigitsSet(
            "corner",
            cornerDigits,
            size * cornerDigitCoeff,
            (index) => (corners[index] && {
                left: size * corners[index].left * (0.45 - cornerDigitCoeff * 0.5),
                top: size * corners[index].top * (0.45 - cornerDigitCoeff * 0.5),
            })
        )}
    </Absolute>;
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
        const indexes = Array(digits.size);

        itemsWithIndexes
            .sort(({value: a}, {value: b}) => compareFn(a, b))
            .forEach(
                ({value, index: initialIndex}, sortedIndex) =>
                    indexes[initialIndex] = sortedIndex
            );

        return indexes;
    });
};
