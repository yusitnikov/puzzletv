export interface RotatableDigit {
    digit: number;
    sticky?: boolean;
}

export const isStickyRotatableDigit = ({digit, sticky}: RotatableDigit) => sticky || [3, 4, 7].includes(digit);

export const cloneRotatableDigit = (digit: RotatableDigit) => ({...digit});

export const areSameRotatableDigits = ({digit, sticky = false}: RotatableDigit, {digit: digit2, sticky: sticky2 = false}: RotatableDigit) =>
    digit === digit2 && (sticky === sticky2 || ![6, 9].includes(digit));
