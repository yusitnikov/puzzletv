import {Absolute} from "../../layout/absolute/Absolute";
import {CellState} from "../../../types/sudoku/CellState";
import {Digit, digitSpaceCoeff} from "../digit/Digit";
import {Position} from "../../../types/layout/Position";
import {isStickyRotatableDigit, RotatableDigit} from "../../../types/sudoku/RotatableDigit";
import {Set} from "../../../types/struct/Set";

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

export interface CellDigitsProps {
    data: Partial<CellState>;
    size: number;
    sudokuAngle?: number;
    mainColor?: boolean;
}

export const CellDigits = ({data, size, sudokuAngle = 0, mainColor}: CellDigitsProps) => {
    const rotatableDigitColor = mainColor ? undefined : "#00f";
    const stickyDigitColor = mainColor ? undefined : "#0c0";

    const {
        initialDigit,
        usersDigit,
        centerDigits,
        cornerDigits
    } = data;

    const centerDigitsCoeff = centerDigitCoeff / Math.max(1, centerDigitCoeff * digitSpaceCoeff * ((centerDigits?.size || 0) + 1));

    const sudokuAngleCoeff = Math.abs((sudokuAngle % 360) / 180 - 1);

    const renderAnimatedDigitsSet = (
        keyPrefix: string,
        digits: Set<RotatableDigit>,
        digitSize: number,
        positionFunction: (index: number, upsideDown: boolean) => Position | undefined
    ) => {
        const [straightIndexes, upsideDownIndexes] = digits.cached("sortIndexes", () => {
            const itemsWithIndexes = digits.items.map((value, index) => ({value, index}));

            const getSortIndexes = (upsideDown: boolean) => {
                const getDisplayDigit = ({digit, sticky}: RotatableDigit) => upsideDown && !sticky && (digit === 6 || digit === 9) ? 15 - digit : digit;

                const indexes = Array(digits.size);

                itemsWithIndexes
                    .sort(
                        ({value: a}, {value: b}) =>
                            getDisplayDigit(a) - getDisplayDigit(b) || (a.sticky ? 1 : 0) - (b.sticky ? 1 : 0)
                    )
                    .forEach(
                        ({value, index: initialIndex}, sortedIndex) =>
                            indexes[initialIndex] = sortedIndex
                    );

                return indexes;
            };

            return [getSortIndexes(false), getSortIndexes(true)];
        });

        return digits.items.map(({digit, sticky}, index) => {
            const straight = positionFunction(straightIndexes[index], false);
            const rotated = positionFunction(upsideDownIndexes[index], true);

            const getAnimatedValue = (straight: number, rotated: number) => straight * sudokuAngleCoeff + rotated * (1 - sudokuAngleCoeff);

            return straight && rotated && <Digit
                key={`${keyPrefix}-${digit}-${sticky}`}
                digit={digit}
                size={digitSize}
                left={getAnimatedValue(straight.left, -rotated.left)}
                top={getAnimatedValue(straight.top, -rotated.top)}
                color={sticky ? stickyDigitColor : rotatableDigitColor}
                angle={isStickyRotatableDigit({digit, sticky}) ? -sudokuAngle : 0}
            />;
        });
    };

    return <Absolute left={size / 2} top={size / 2}>
        {initialDigit && <Digit
            key={"initial"}
            digit={initialDigit.digit}
            size={size * 0.7}
            angle={isStickyRotatableDigit(initialDigit) ? -sudokuAngle : 0}
        />}

        {!initialDigit && usersDigit && <Digit
            key={"users"}
            digit={usersDigit.digit}
            size={size * 0.7}
            color={usersDigit.sticky ? stickyDigitColor : rotatableDigitColor}
            angle={isStickyRotatableDigit(usersDigit) ? -sudokuAngle : 0}
        />}

        {centerDigits && renderAnimatedDigitsSet(
            "center",
            centerDigits,
            size * centerDigitsCoeff,
            (index) => ({
                left: size * centerDigitsCoeff * digitSpaceCoeff * (index - (centerDigits.size - 1) / 2),
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
