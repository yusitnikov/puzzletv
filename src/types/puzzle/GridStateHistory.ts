import { areGridStatesEqual, cloneGridState, GridState, serializeGridState, unserializeGridState } from "./GridState";
import { SetStateAction } from "react";
import { AnyPTM } from "./PuzzleTypeMap";
import { PuzzleContext } from "./PuzzleContext";
import { makeAutoObservable } from "mobx";
import { PuzzleDefinition } from "./PuzzleDefinition";
import { profiler } from "../../utils/profiler";

export class GridStateHistory<T extends AnyPTM> {
    readonly current: GridState<T>;
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
        makeAutoObservable(this, { states: false });

        this.current = unserializeGridState(JSON.parse(states[currentIndex]), puzzle);
        this.statesCount = states.length;
    }

    undo() {
        return this.canUndo ? this.seek(Math.max(0, this.currentIndex - 1)) : this;
    }

    redo() {
        return this.canRedo ? this.seek(Math.min(this.statesCount - 1, this.currentIndex + 1)) : this;
    }

    seek(index: number) {
        return new GridStateHistory(this.puzzle, this.states, index);
    }

    equals(other: GridStateHistory<T>) {
        return (
            this.statesCount === other.statesCount &&
            this.currentIndex === other.currentIndex &&
            this.states.every((value, index) => value === other.states[index])
        );
    }
}

export const gridStateHistoryAddState = <T extends AnyPTM>(
    context: PuzzleContext<T>,
    clientId: string,
    actionId: string,
    state: SetStateAction<GridState<T>>,
): GridStateHistory<T> => {
    const { puzzle, currentGridState, gridStateHistory } = context;

    if (typeof state === "function") {
        state = state(cloneGridState(puzzle.typeManager, currentGridState, clientId, actionId));
    }

    state = { ...state, clientId, actionId };

    if (
        currentGridState.clientId === clientId &&
        currentGridState.actionId === actionId &&
        gridStateHistory.currentIndex > 0
    ) {
        // Replace the last state of the same action by the current action
        return gridStateHistoryAddState(
            new PuzzleContext({
                ...context,
                applyPendingMessages: false,
                myGameState: {
                    ...context.state,
                    gridStateHistory: new GridStateHistory(
                        puzzle,
                        gridStateHistory.states.slice(0, gridStateHistory.currentIndex),
                        gridStateHistory.currentIndex - 1,
                    ),
                },
            }),
            clientId,
            actionId,
            state,
        );
    }

    if (areGridStatesEqual(context, state, currentGridState)) {
        return gridStateHistory;
    }

    const stateStr = JSON.stringify(serializeGridState(state, puzzle));

    // No history for multi-player games
    if (context.multiPlayer.isEnabled) {
        return new GridStateHistory(puzzle, [stateStr], 0);
    }

    return new GridStateHistory(
        puzzle,
        [...gridStateHistory.states.slice(0, gridStateHistory.currentIndex + 1), stateStr],
        gridStateHistory.currentIndex + 1,
    );
};
