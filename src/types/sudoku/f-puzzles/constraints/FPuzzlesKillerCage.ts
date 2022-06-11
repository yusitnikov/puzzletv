import {FPuzzlesCellsCoords} from "./FPuzzlesCellsCoords";

export interface FPuzzlesKillerCage<ValueT> extends FPuzzlesCellsCoords {
    value?: ValueT;
    outlineC?: string;
    fontC?: string;
}
