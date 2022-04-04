import {areFieldStatesEqual, cloneFieldState, FieldState} from "./FieldState";
import {SetStateAction} from "react";
import {SudokuTypeManager} from "./SudokuTypeManager";

export interface FieldStateHistory<CellType> {
    states: FieldState<CellType>[];
    currentIndex: number;
}

export const fieldStateHistoryGetCurrent = <CellType>({states, currentIndex}: FieldStateHistory<CellType>) => states[currentIndex];

export const fieldStateHistoryCanUndo = <CellType>({currentIndex}: FieldStateHistory<CellType>) => currentIndex > 0;

export const fieldStateHistoryUndo = <CellType>(history: FieldStateHistory<CellType>) => fieldStateHistoryCanUndo(history)
    ? {
        ...history,
        currentIndex: Math.max(0, history.currentIndex - 1),
    }
    : history;

export const fieldStateHistoryCanRedo = <CellType>({currentIndex, states}: FieldStateHistory<CellType>) => currentIndex < states.length - 1;

export const fieldStateHistoryRedo = <CellType>(history: FieldStateHistory<CellType>) => fieldStateHistoryCanRedo(history)
    ? {
        ...history,
        currentIndex: Math.min(history.states.length - 1, history.currentIndex + 1),
    }
    : history;

export const fieldStateHistoryAddState = <CellType>(
    typeManager: SudokuTypeManager<CellType>,
    history: FieldStateHistory<CellType>,
    state: SetStateAction<FieldState<CellType>>
) => {
    const currentState = fieldStateHistoryGetCurrent(history);

    if (typeof state === "function") {
        state = state(cloneFieldState(typeManager, currentState));
    }

    if (areFieldStatesEqual(typeManager, state, currentState)) {
        return history;
    }

    return {
        ...history,
        states: [...history.states.slice(0, history.currentIndex + 1), state],
        currentIndex: history.currentIndex + 1,
    };
};
