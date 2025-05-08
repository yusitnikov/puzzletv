import { PTM } from "../../../types/puzzle/PuzzleTypeMap";
import { RotatableGameState } from "./RotatableGameState";
import { RotatableDigit } from "./RotatableDigit";

export type RotatablePTM<CellType> = PTM<CellType, RotatableGameState>;

export type RotatableDigitPTM = RotatablePTM<RotatableDigit>;

export type AnyRotatablePTM = RotatablePTM<any>;
