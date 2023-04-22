import {Position} from "../../../types/layout/Position";
import {Rect} from "../../../types/layout/Rect";

export interface RushHourCar {
    cells: Position[];
    boundingRect: Rect;
    color: string;
}

export interface RushHourPuzzleExtension {
    cars: RushHourCar[];
}
