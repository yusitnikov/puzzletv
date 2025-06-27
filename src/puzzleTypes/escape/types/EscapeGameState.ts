import { Position } from "../../../types/layout/Position";

export interface EscapeGameState {
    isReady: boolean;
    isDead: boolean;
    monsterPosition: Position;
}
