import {Position} from "../../../types/layout/Position";

export interface CaterpillarGrid {
    guid: number;
    data: string;
    offset: Position;
    size?: number;
    dashed?: boolean;
}
