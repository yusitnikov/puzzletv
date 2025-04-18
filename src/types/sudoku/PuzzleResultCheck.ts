import { ReactNode } from "react";
import { translate } from "../../utils/translate";
import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleDefinition } from "./PuzzleDefinition";
import { LanguageCode } from "../translations/LanguageCode";

export interface PuzzleResultCheck {
    isCorrectResult: boolean;
    // isPending === true means that the puzzle is not finished, but not broken yet either
    isPending: boolean;
    resultPhrase: ReactNode;
    forceShowResult?: boolean;
}

export const successResultCheck = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>): PuzzleResultCheck => ({
    isCorrectResult: true,
    isPending: false,
    resultPhrase:
        puzzle.successMessage ??
        `${translate({
            [LanguageCode.en]: "Absolutely right",
            [LanguageCode.ru]: "Совершенно верно",
            [LanguageCode.de]: "Absolut richtig",
        })}!`,
});

export const notFinishedResultCheck = (): PuzzleResultCheck => {
    return {
        isCorrectResult: false,
        isPending: true,
        resultPhrase: translate({
            [LanguageCode.en]: "The puzzle is not finished yet",
            [LanguageCode.ru]: "Головоломка еще не завершена",
            [LanguageCode.de]: "Das Puzzle ist noch nicht fertig",
        }),
    };
};

export const errorResultCheck = (): PuzzleResultCheck => {
    return {
        isCorrectResult: false,
        isPending: false,
        resultPhrase: `${translate({
            [LanguageCode.en]: "Something's wrong here",
            [LanguageCode.ru]: "Что-то тут не так",
            [LanguageCode.de]: "Irgendetwas ist hier falsch",
        })}...`,
    };
};
