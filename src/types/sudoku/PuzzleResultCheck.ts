import {PartiallyTranslatable} from "../translations/Translatable";

export interface PuzzleResultCheck<T extends (string | PartiallyTranslatable)> {
    isCorrectResult: boolean;
    resultPhrase: T;
}
