import {FPuzzlesCellsCoords} from "./FPuzzlesCellsCoords";
import {FPuzzlesCellCoords} from "./FPuzzlesCellCoords";

export interface FPuzzlesLittleKillerSum extends FPuzzlesCellCoords, FPuzzlesCellsCoords {
    direction: FPuzzlesLittleKillerSumDirection;
    value?: string | number;
}

export enum FPuzzlesLittleKillerSumDirection {
    UpLeft = "UL",
    UpRight = "UR",
    DownLeft = "DL",
    DownRight = "DR",
}
