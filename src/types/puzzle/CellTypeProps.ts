import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleContext } from "./PuzzleContext";
import { PuzzleInputModeInfo } from "./PuzzleInputModeInfo";

export interface CellTypeProps<T extends AnyPTM> {
    isVisible?: boolean;
    isVisibleForState?: (context: PuzzleContext<T>) => boolean;
    isSelectable?: boolean;
    isCheckingSolution?: boolean;
    forcedPuzzleInputMode?: PuzzleInputModeInfo<T>;
    noInteraction?: boolean;
    noMainDigit?: (context: PuzzleContext<T>) => boolean;
    noBorders?: boolean;
}

export const isVisibleCell = <T extends AnyPTM>({ isVisible = true }: CellTypeProps<T> = {}): boolean => isVisible;

export const isInteractableCell = <T extends AnyPTM>(props: CellTypeProps<T> = {}): boolean =>
    isVisibleCell(props) && !props.noInteraction;

export const isSelectableCell = <T extends AnyPTM>(props: CellTypeProps<T> = {}): boolean =>
    isInteractableCell(props) && props.isSelectable !== false;

export const isSolutionCheckCell = <T extends AnyPTM>(props: CellTypeProps<T> = {}): boolean =>
    isInteractableCell(props) && props.isCheckingSolution !== false;

export const isCellWithBorders = <T extends AnyPTM>(props: CellTypeProps<T> = {}): boolean =>
    isVisibleCell(props) && !props.noBorders;
