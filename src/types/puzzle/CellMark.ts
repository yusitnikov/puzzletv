import { Position } from "../layout/Position";
import { getPuzzlePositionHasher, PuzzleDefinition } from "./PuzzleDefinition";
import { HashSet } from "../struct/Set";
import { CellColorValue } from "./CellColor";
import { CellsMap } from "./CellsMap";
import { PuzzleCellsIndex } from "./PuzzleCellsIndex";
import { CellPart } from "./CellPart";
import { AnyPTM } from "./PuzzleTypeMap";

export enum CellMarkType {
    Any = "",
    X = "X",
    O = "O",
    LeftArrow = "←",
    RightArrow = "→",
}

export interface CellMark {
    position: Position;
    color?: CellColorValue;
    type: CellMarkType;
    isCenter?: boolean;
    regionIndex?: number;
}

export const getMarkHasher = <T extends AnyPTM>(puzzle: PuzzleDefinition<T>) => {
    const positionHasher = getPuzzlePositionHasher(puzzle);

    return ({ position, isCenter = false }: CellMark) => `${positionHasher(position)}:${isCenter}`;
};

export class CellMarkSet<T extends AnyPTM> extends HashSet<CellMark> {
    constructor(puzzle: PuzzleDefinition<T>, items: CellMark[] = []) {
        const hasher = getMarkHasher(puzzle);

        super(items, {
            hasher,
            comparer: (item1, item2) => hasher(item1) === hasher(item2) && item1.type === item2.type,
        });
    }

    static unserialize<T extends AnyPTM>(puzzle: PuzzleDefinition<T>, items: any) {
        return new CellMarkSet(puzzle, items);
    }
}

export const getCenterMarksMap = <T extends AnyPTM>(
    marks: CellMark[],
    cellsIndex: PuzzleCellsIndex<T>,
): CellsMap<CellMark> => {
    const map: CellsMap<CellMark> = {};

    for (const mark of marks) {
        const cellInfo = cellsIndex.getPointInfo(mark.position);
        if (cellInfo?.type === CellPart.center) {
            const { top, left } = cellInfo.cells.first()!;
            map[top] = map[top] ?? {};
            map[top][left] = mark;
        }
    }

    return map;
};

export const parseCellMark = (str: string): CellMarkType | undefined => {
    switch (str.toLowerCase()) {
        case ">":
        case "->":
        case "=>":
        case CellMarkType.RightArrow:
            return CellMarkType.RightArrow;
        case "<":
        case "<-":
        case "<=":
        case CellMarkType.LeftArrow:
            return CellMarkType.LeftArrow;
        case CellMarkType.X.toLowerCase():
            return CellMarkType.X;
        case CellMarkType.O.toLowerCase():
            return CellMarkType.O;
        default:
            return undefined;
    }
};
