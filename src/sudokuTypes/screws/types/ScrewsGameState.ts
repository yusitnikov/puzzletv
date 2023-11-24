import {ScrewsGameClueState} from "./ScrewsGameClueState";

export interface ScrewsGameState {
    screws: ScrewsGameClueState[];
}

export interface ScrewsProcessedGameState {
    screwOffsets: number[];
}
