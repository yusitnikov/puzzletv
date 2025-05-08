import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AddPuzzleEx } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { SlideAndSeekPuzzleExtension } from "./SlideAndSeekPuzzleExtension";

export type SlideAndSeekPTM<T extends AnyPTM> = AddPuzzleEx<T, SlideAndSeekPuzzleExtension>;
