import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { AddPuzzleEx } from "../../../types/sudoku/SudokuTypeManagerPlugin";
import { SlideAndSeekPuzzleExtension } from "./SlideAndSeekPuzzleExtension";

export type SlideAndSeekPTM<T extends AnyPTM> = AddPuzzleEx<T, SlideAndSeekPuzzleExtension>;
