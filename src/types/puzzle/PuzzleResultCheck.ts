import { ReactNode } from "react";
import { translate } from "../../utils/translate";
import { AnyPTM } from "./PuzzleTypeMap";
import { LanguageCode } from "../translations/LanguageCode";
import { PuzzleContext } from "./PuzzleContext";

/**
 * Result object for a puzzle solution check:
 * - `isPending: false, isCorrectResult: true` - the puzzle was solved successfully.
 * - `isPending: false, isCorrectResult: false` - the puzzle is broken.
 * - `isPending: true` - the puzzle solving is in process: the puzzle is not finished, but not broken yet either.
 *
 * @see PuzzleDefinition.resultChecker
 */
export interface PuzzleResultCheck {
    /**
     * Did the user enter the full and correct solution to the puzzle.
     */
    isCorrectResult: boolean;
    /**
     * Is puzzle solving still in process
     * (the puzzle is not finished, but not broken yet either).
     */
    isPending: boolean;
    /**
     * User-friendly description of the puzzle solving state.
     * It will be displayed in the popup when clicking the "check" button.
     */
    resultPhrase: ReactNode;
    /**
     * Show the message with this result to the user.
     *
     * By default, only results with `isCorrectResult: true` trigger showing the message to the user,
     * but this flag allows to show the message for intermediate results as well.
     *
     * Note: this flag does not override the "auto-check on finish" user setting.
     * No messages will pop up automatically if the user disabled the auto-check.
     */
    forceShowResult?: boolean;
}

/**
 * Callback that performs puzzle solution check for the context.
 */
export type PuzzleResultChecker<T extends AnyPTM> = (context: PuzzleContext<T>) => PuzzleResultCheck;

/**
 * Puzzle check result for finishing the puzzle successfully.
 */
export const successResultCheck = <T extends AnyPTM>(context: PuzzleContext<T>): PuzzleResultCheck => ({
    isCorrectResult: true,
    isPending: false,
    resultPhrase:
        (typeof context.puzzle.successMessage === "function" ? context.puzzle.successMessage(context) : context.puzzle.successMessage) ??
        translate({
            [LanguageCode.en]: "Absolutely right!",
            [LanguageCode.ru]: "Совершенно верно!",
            [LanguageCode.de]: "Absolut richtig!",
        }),
});

/**
 * Puzzle check result for being still in the process of solving the puzzle,
 * without finishing the puzzle or breaking anything yet.
 */
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

/**
 * Puzzle check result for breaking the puzzle.
 */
export const errorResultCheck = (): PuzzleResultCheck => {
    return {
        isCorrectResult: false,
        isPending: false,
        resultPhrase: translate({
            [LanguageCode.en]: "Something's wrong here...",
            [LanguageCode.ru]: "Что-то тут не так...",
            [LanguageCode.de]: "Irgendetwas ist hier falsch...",
        }),
    };
};
