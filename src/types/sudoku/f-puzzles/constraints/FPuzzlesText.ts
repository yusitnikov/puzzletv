import {FPuzzlesCellsCoords} from "./FPuzzlesCellsCoords";

export interface FPuzzlesText extends FPuzzlesCellsCoords {
    value?: string;
    fontC?: string;
    size?: number;
    angle?: number;
}
