import {RushHourGameCarState} from "./RushHourGameCarState";
import {Position} from "../../../types/layout/Position";

export interface RushHourGameState {
    cars: RushHourGameCarState[];
    hideCars: boolean;
}

export interface RushHourProcessedGameState {
    cars: Position[];
}
