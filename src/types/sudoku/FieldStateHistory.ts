import {areFieldStatesEqual, cloneFieldState, FieldState} from "./FieldState";
import {SetStateAction} from "react";

export interface FieldStateHistory {
    states: FieldState[];
    currentIndex: number;
}

export const fieldStateHistoryGetCurrent = ({states, currentIndex}: FieldStateHistory) => states[currentIndex];

export const fieldStateHistoryCanUndo = ({currentIndex}: FieldStateHistory) => currentIndex > 0;

export const fieldStateHistoryUndo = (history: FieldStateHistory) => fieldStateHistoryCanUndo(history)
    ? {
        ...history,
        currentIndex: Math.max(0, history.currentIndex - 1),
    }
    : history;

export const fieldStateHistoryCanRedo = ({currentIndex, states}: FieldStateHistory) => currentIndex < states.length - 1;

export const fieldStateHistoryRedo = (history: FieldStateHistory) => fieldStateHistoryCanRedo(history)
    ? {
        ...history,
        currentIndex: Math.min(history.states.length - 1, history.currentIndex + 1),
    }
    : history;

export const fieldStateHistoryAddState = (history: FieldStateHistory, state: SetStateAction<FieldState>) => {
    const currentState = fieldStateHistoryGetCurrent(history);

    if (typeof state === "function") {
        state = state(cloneFieldState(currentState));
    }

    if (areFieldStatesEqual(state, currentState)) {
        return history;
    }

    return {
        ...history,
        states: [...history.states.slice(0, history.currentIndex + 1), state],
        currentIndex: history.currentIndex + 1,
    };
};
