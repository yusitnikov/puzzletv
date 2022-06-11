import {FPuzzlesCellsCoords} from "./FPuzzlesCellsCoords";

export interface FPuzzlesShape extends FPuzzlesCellsCoords {
    width: number;
    height: number;
    value?: string;
    baseC?: string;
    outlineC?: string;
    fontC?: string;
    angle?: number;
}
