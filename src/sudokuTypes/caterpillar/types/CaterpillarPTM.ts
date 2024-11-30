import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { AddPuzzleEx } from "../../../types/sudoku/SudokuTypeManagerPlugin";
import { CaterpillarPuzzleExtension } from "./CaterpillarPuzzleExtension";

export type CaterpillarPTM<T extends AnyPTM> = AddPuzzleEx<T, CaterpillarPuzzleExtension>;
