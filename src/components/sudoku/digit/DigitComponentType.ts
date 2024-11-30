import { ComponentType } from "react";
import { DigitProps } from "./DigitProps";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { DigitRotationInfo } from "./DigitRotationInfo";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import { loop } from "../../../utils/math";

export interface DigitComponentType<T extends AnyPTM> {
    component: ComponentType<DigitProps<T>>;
    svgContentComponent: ComponentType<DigitProps<T>>;
    widthCoeff: number;
    getDigitRotationInfo?(digit: number): DigitRotationInfo;
}

export const getDigitRotationInfo = <T extends AnyPTM>(
    { typeManager: { digitComponentType, cellDataDigitComponentType = digitComponentType } }: PuzzleDefinition<T>,
    digit: number,
): DigitRotationInfo => cellDataDigitComponentType.getDigitRotationInfo?.(digit) ?? {};

export const isRotatableDigit = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>, digit: number) =>
    getDigitRotationInfo(puzzle, digit).isRotatable ?? false;

export const rotateDigit = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>, digit: number, angle: number): number => {
    const { rotatesInto = digit } = getDigitRotationInfo(puzzle, digit);
    return typeof rotatesInto === "function" ? rotatesInto(angle) : loop(angle, 360) === 0 ? digit : rotatesInto;
};

export const rotateNumber = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>, num: number) =>
    Number(
        num
            .toString()
            .split("")
            .map((c) => rotateDigit(puzzle, Number(c), 180))
            .reverse()
            .join(""),
    );
