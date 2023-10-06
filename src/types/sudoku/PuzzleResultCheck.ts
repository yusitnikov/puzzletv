import {ReactNode} from "react";
import {PartiallyTranslatable} from "../translations/Translatable";

export interface PuzzleResultCheck<T extends (ReactNode | PartiallyTranslatable<ReactNode>)> {
    isCorrectResult: boolean;
    resultPhrase: T;
    forceShowResult?: boolean;
}
