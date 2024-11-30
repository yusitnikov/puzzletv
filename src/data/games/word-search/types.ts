import { Position } from "../../../types/layout/Position";

export interface WordSearchLobbyDynamicState {
    roomHostId?: string;
    roomId?: string;
    playing?: boolean;
}

export interface WordSearchRoomSettings {
    fieldWidth: number;
    fieldHeight: number;
}

export type WordSearchLobbyState = WordSearchLobbyDynamicState & WordSearchRoomSettings;

export interface WordSearchGameSettings {
    playerIds: string[];
    letters: string[][];
}

export interface WordSearchGameState extends WordSearchGameSettings {
    turnIndex: number;
    words: string[];
    letterOwners: string[][];
}

export interface WordSearchSelectedLetter extends Position {
    letter: string;
}

export interface WordSearchPlayerState {
    turnIndex: number;
    word: WordSearchSelectedLetter[];
    commit?: boolean;
}
