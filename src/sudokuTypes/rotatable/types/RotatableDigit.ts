export interface RotatableDigit {
    digit: number;
    sticky?: boolean;
}

export const isStickyRotatableDigit = ({digit, sticky}: RotatableDigit) => sticky || [3, 4, 7].includes(digit);
