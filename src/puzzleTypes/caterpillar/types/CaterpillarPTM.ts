import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AddPuzzleEx } from "../../../types/puzzle/PuzzleTypeManagerPlugin";
import { CaterpillarPuzzleExtension } from "./CaterpillarPuzzleExtension";

export type CaterpillarPTM<T extends AnyPTM> = AddPuzzleEx<T, CaterpillarPuzzleExtension>;
