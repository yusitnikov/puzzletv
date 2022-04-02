import {FieldStateInitialDigitsMap} from "./FieldState";
import {ReactNode} from "react";

export interface PuzzleDefinition {
    title: ReactNode;
    author?: ReactNode;
    rules: ReactNode;
    initialDigits?: FieldStateInitialDigitsMap;
    backgroundItems?: ReactNode;
    topItems?: ReactNode;
}
