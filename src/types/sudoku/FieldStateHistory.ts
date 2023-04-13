import {areFieldStatesEqual, cloneFieldState, FieldState} from "./FieldState";
import {SetStateAction} from "react";
import {SudokuTypeManager} from "./SudokuTypeManager";
import {AnyPTM} from "./PuzzleTypeMap";

export interface FieldStateHistory<T extends AnyPTM> {
    states: FieldState<T>[];
    currentIndex: number;
}

export const fieldStateHistoryGetCurrent = <T extends AnyPTM>({states, currentIndex}: FieldStateHistory<T>) => states[currentIndex];

export const fieldStateHistoryCanUndo = <T extends AnyPTM>({currentIndex}: FieldStateHistory<T>) => currentIndex > 0;

export const fieldStateHistoryUndo = <T extends AnyPTM>(history: FieldStateHistory<T>): FieldStateHistory<T> => fieldStateHistoryCanUndo(history)
    ? {
        ...history,
        currentIndex: Math.max(0, history.currentIndex - 1),
    }
    : history;

export const fieldStateHistoryCanRedo = <T extends AnyPTM>({currentIndex, states}: FieldStateHistory<T>) => currentIndex < states.length - 1;

export const fieldStateHistoryRedo = <T extends AnyPTM>(history: FieldStateHistory<T>): FieldStateHistory<T> => fieldStateHistoryCanRedo(history)
    ? {
        ...history,
        currentIndex: Math.min(history.states.length - 1, history.currentIndex + 1),
    }
    : history;

export const fieldStateHistoryAddState = <T extends AnyPTM>(
    typeManager: SudokuTypeManager<T>,
    history: FieldStateHistory<T>,
    state: SetStateAction<FieldState<T>>
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
