import {FieldStateInitialDigitsMap} from "./FieldState";
import {ReactNode} from "react";

export interface PuzzleDefinition<CellType> {
    title: ReactNode;
    author?: ReactNode;
    rules: ReactNode;
    initialDigits?: FieldStateInitialDigitsMap<CellType>;
    backgroundItems?: ReactNode;
    topItems?: ReactNode;
}
