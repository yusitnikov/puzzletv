import {
    areFieldStatesEqual,
    cloneFieldState,
    FieldState,
    serializeFieldState, unserializeFieldState,
} from "./FieldState";
import {SetStateAction} from "react";
import {AnyPTM} from "./PuzzleTypeMap";
import {PuzzleContext} from "./PuzzleContext";
import {makeAutoObservable} from "mobx";
import {PuzzleDefinition} from "./PuzzleDefinition";
import {profiler} from "../../utils/profiler";

export class FieldStateHistory<T extends AnyPTM> {
    readonly current: FieldState<T>;
    readonly statesCount: number;

    get canUndo() {
        profiler.trace();
        return this.currentIndex > 0;
    }

    get canRedo() {
        profiler.trace();
        return this.currentIndex < this.statesCount - 1;
    }

    constructor(
        private puzzle: PuzzleDefinition<T>,
        public states: string[],
        public currentIndex: number,
    ) {
        makeAutoObservable(this, {states: false});

        this.current = unserializeFieldState(JSON.parse(states[currentIndex]), puzzle);
        this.statesCount = states.length;
    }

    undo() {
        return this.canUndo
            ? this.seek(Math.max(0, this.currentIndex - 1))
            : this;
    }

    redo() {
        return this.canRedo
            ? this.seek(Math.min(this.statesCount - 1, this.currentIndex + 1))
            : this;
    }

    seek(index: number) {
        return new FieldStateHistory(this.puzzle, this.states, index);
    }

    equals(other: FieldStateHistory<T>) {
        return this.statesCount === other.statesCount && this.currentIndex === other.currentIndex
            && this.states.every((value, index) => value === other.states[index]);
    }
}

export const fieldStateHistoryAddState = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    clientId: string,
    actionId: string,
    state: SetStateAction<FieldState<T>>
): FieldStateHistory<T> => {
    const {puzzle, currentFieldState, fieldStateHistory} = context;

    if (typeof state === "function") {
        state = state(cloneFieldState(puzzle.typeManager, currentFieldState, clientId, actionId));
    }

    state = {...state, clientId, actionId};

    if (currentFieldState.clientId === clientId && currentFieldState.actionId === actionId && fieldStateHistory.currentIndex > 0) {
        // Replace the last state of the same action by the current action
        return fieldStateHistoryAddState(
            new PuzzleContext({
                ...context,
                applyPendingMessages: false,
                myGameState: {
                    ...context.state,
                    fieldStateHistory: new FieldStateHistory(
                        puzzle,
                        fieldStateHistory.states.slice(0, fieldStateHistory.currentIndex),
                        fieldStateHistory.currentIndex - 1,
                    )
                },
            }),
            clientId,
            actionId,
            state,
        );
    }

    if (areFieldStatesEqual(context, state, currentFieldState)) {
        return fieldStateHistory;
    }

    const stateStr = JSON.stringify(serializeFieldState(state, puzzle));

    // No history for multi-player games
    if (context.multiPlayer.isEnabled) {
        return new FieldStateHistory(
            puzzle,
            [stateStr],
            0,
        );
    }

    return new FieldStateHistory(
        puzzle,
        [
            ...fieldStateHistory.states.slice(0, fieldStateHistory.currentIndex + 1),
            stateStr,
        ],
        fieldStateHistory.currentIndex + 1,
    );
};
