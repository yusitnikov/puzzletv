import {FPuzzlesLineCoords} from "./FPuzzlesLineCoords";

export interface FPuzzlesLine extends FPuzzlesLineCoords {
    outlineC?: string;
    width?: number;
    // If true, the line is a graphical representation of a constraint that CTC app can't recognize (e.g. renban, whispers)
    isNewConstraint?: boolean;
}
