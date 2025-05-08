import { RotatableCluesGameClueState } from "./RotatableCluesGameClueState";

export interface RotatableCluesGameState {
    clues: RotatableCluesGameClueState[];
}

export interface RotatableCluesProcessedGameState {
    clueAngles: number[];
}
