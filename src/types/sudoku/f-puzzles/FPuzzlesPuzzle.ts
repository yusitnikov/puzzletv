import {FPuzzlesGridCell} from "./FPuzzlesGridCell";
import {FPuzzlesLittleKillerSum} from "./constraints/FPuzzlesLittleKillerSum";
import {FPuzzlesKillerCage} from "./constraints/FPuzzlesKillerCage";
import {FPuzzlesCellCoords} from "./constraints/FPuzzlesCellCoords";
import {FPuzzlesLine} from "./constraints/FPuzzlesLine";
import {FPuzzlesLineCoords} from "./constraints/FPuzzlesLineCoords";
import {FPuzzlesArrow} from "./constraints/FPuzzlesArrow";
import {FPuzzlesQuadruple} from "./constraints/FPuzzlesQuadruple";
import {FPuzzlesCellsCoords} from "./constraints/FPuzzlesCellsCoords";
import {FPuzzlesXV} from "./constraints/FPuzzlesXV";
import {FPuzzlesKropkiDot} from "./constraints/FPuzzlesKropkiDot";
import {FPuzzlesText} from "./constraints/FPuzzlesText";
import {FPuzzlesShape} from "./constraints/FPuzzlesShape";
import {FPuzzlesSandwichSum} from "./constraints/FPuzzlesSandwichSum";
import {FPuzzlesClone} from "./constraints/FPuzzlesClone";

export interface FPuzzlesPuzzle {
    // region Core fields
    size: number;
    grid: FPuzzlesGridCell[][];
    title?: string;
    author?: string;
    ruleset?: string;
    // region Constraints
    "diagonal+"?: boolean;
    "diagonal-"?: boolean;
    antiknight?: boolean;
    antiking?: boolean;
    disjointgroups?: boolean;
    nonconsecutive?: boolean;
    littlekillersum?: FPuzzlesLittleKillerSum[];
    arrow?: FPuzzlesArrow[];
    killercage?: FPuzzlesKillerCage<string | number>[];
    cage?: FPuzzlesKillerCage<string>[];
    ratio?: FPuzzlesKropkiDot[];
    difference?: FPuzzlesKropkiDot[];
    xv?: FPuzzlesXV[];
    thermometer?: FPuzzlesLineCoords[];
    palindrome?: FPuzzlesLineCoords[];
    sandwichsum?: FPuzzlesSandwichSum[];
    even?: FPuzzlesCellCoords[];
    odd?: FPuzzlesCellCoords[];
    extraregion?: FPuzzlesCellsCoords[];
    clone?: FPuzzlesClone[];
    quadruple?: FPuzzlesQuadruple[];
    betweenline?: FPuzzlesLineCoords[];
    // Undocumented
    lockout?: any;
    minimum?: FPuzzlesCellCoords[];
    maximum?: FPuzzlesCellCoords[];
    line?: FPuzzlesLine[];
    rectangle?: FPuzzlesShape[];
    circle?: FPuzzlesShape[];
    text?: FPuzzlesText[];
    // endregion
    // endregion
    // region Extensions
    disabledlogic?: string[];
    truecandidatesoptions?: string[];
    solution?: number[];
    // region Constraints
    renban?: FPuzzlesLineCoords[];
    whispers?: FPuzzlesLineCoords[];
    fogofwar?: FPuzzlesCellsCoords["cells"];
    foglight?: FPuzzlesCellsCoords["cells"];
    // endregion
    // endregion
}
