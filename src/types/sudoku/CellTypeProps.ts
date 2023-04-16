import {AnyPTM} from "./PuzzleTypeMap";
import {PuzzleContext} from "./PuzzleContext";
import {CellWriteModeInfo} from "./CellWriteModeInfo";

export interface CellTypeProps<T extends AnyPTM> {
    isVisible?: boolean;
    isVisibleForState?: (context: PuzzleContext<T>) => boolean;
    isSelectable?: boolean;
    forceCellWriteMode?: CellWriteModeInfo<T>;
    noInteraction?: boolean;
}

export const isVisibleCell = <T extends AnyPTM>({isVisible = true}: CellTypeProps<T> = {}): boolean => isVisible;

export const isInteractableCell = <T extends AnyPTM>(props: CellTypeProps<T> = {}): boolean =>
    isVisibleCell(props) && !props.noInteraction;

export const isSelectableCell = <T extends AnyPTM>(props: CellTypeProps<T> = {}): boolean =>
    isInteractableCell(props) && props.isSelectable !== false;
