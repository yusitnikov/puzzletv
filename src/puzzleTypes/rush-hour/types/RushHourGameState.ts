import { RushHourGameCarState } from "./RushHourGameCarState";

export interface RushHourGameState {
    cars: RushHourGameCarState[];
    hideCars: boolean;
}
