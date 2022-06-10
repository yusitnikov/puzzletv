import {Position, stringifyPosition} from "../layout/Position";
import {HashSet, SetInterface} from "../struct/Set";

export type SelectedCells = SetInterface<Position>;

export const noSelectedCells = new HashSet<Position>([], stringifyPosition);
