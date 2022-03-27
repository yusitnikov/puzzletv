import {Position} from "../layout/Position";
import {Set} from "../struct/Set";

export type SelectedCells = Set<Position>;

export const noSelectedCells = new Set<Position>();
