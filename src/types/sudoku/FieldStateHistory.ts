import {areFieldStatesEqual, cloneFieldState, FieldState} from "./FieldState";
import {SetStateAction} from "react";
import {AnyPTM} from "./PuzzleTypeMap";
import {PuzzleDefinition} from "./PuzzleDefinition";

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
    puzzle: PuzzleDefinition<T>,
    history: FieldStateHistory<T>,
    clientId: string,
    actionId: string,
    state: SetStateAction<FieldState<T>>
): FieldStateHistory<T> => {
    const currentState = fieldStateHistoryGetCurrent(history);

    if (typeof state === "function") {
        state = state(cloneFieldState(puzzle.typeManager, currentState, clientId, actionId));
    }

    state = {...state, clientId, actionId};

    if (currentState.clientId === clientId && currentState.actionId === actionId && history.currentIndex > 0) {
        // Replace the last state of the same action by the current action
        return fieldStateHistoryAddState(
            puzzle,
            {
                states: history.states.slice(0, history.currentIndex),
                currentIndex: history.currentIndex - 1,
            },
            clientId,
            actionId,
            state,
        );
    }

    if (areFieldStatesEqual(puzzle, state, currentState)) {
        return history;
    }

    return {
        states: [...history.states.slice(0, history.currentIndex + 1), state],
        currentIndex: history.currentIndex + 1,
    };
};
