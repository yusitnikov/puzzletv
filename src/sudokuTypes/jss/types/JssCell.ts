import {Position} from "../../../types/layout/Position";

export interface JssCell extends Position {
    backgroundColor?: string;
    text?: string;
    textColor?: string;
    textSize?: number;
}
