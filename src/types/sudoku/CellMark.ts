import {Position} from "../layout/Position";
import {getPuzzlePositionHasher, PuzzleDefinition} from "./PuzzleDefinition";
import {HashSet} from "../struct/Set";
import {CellColorValue} from "./CellColor";
import {GivenDigitsMap} from "./GivenDigitsMap";
import {SudokuCellsIndex} from "./SudokuCellsIndex";
import {CellPart} from "./CellPart";

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
}

export const getMarkHasher = (puzzle: PuzzleDefinition<any, any, any>) => {
    const positionHasher = getPuzzlePositionHasher(puzzle);

    return ({position, isCenter = false}: CellMark) => `${positionHasher(position)}:${isCenter}`;
};

export class CellMarkSet extends HashSet<CellMark> {
    constructor(
        puzzle: PuzzleDefinition<any, any, any>,
        items: CellMark[] = []
    ) {
        const hasher = getMarkHasher(puzzle);

        super(items, {
            hasher,
            comparer: (item1, item2) => hasher(item1) === hasher(item2) && item1.type === item2.type,
        });
    }

    static unserialize(
        puzzle: PuzzleDefinition<any, any, any>,
        items: any
    ) {
        return new CellMarkSet(puzzle, items);
    }
}

export const getCenterMarksMap = <CellType, ExType, ProcessedExType>(
    marks: CellMark[],
    cellsIndex: SudokuCellsIndex<CellType, ExType, ProcessedExType>,
): GivenDigitsMap<CellMark> => {
    const map: GivenDigitsMap<CellMark> = {};

    for (const mark of marks) {
        const cellInfo = cellsIndex.getPointInfo(mark.position);
        if (cellInfo?.type === CellPart.center) {
            const {top, left} = cellInfo.cells.first()!;
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
