import {Position} from "../../../types/layout/Position";
import {alphabet} from "../../../data/alphabet";
import {LanguageCode} from "../../../types/translations/LanguageCode";

const chessColumns = alphabet[LanguageCode.en].toLowerCase();

export const stringifyChessCell = ({top, left}: Position) => `${chessColumns[left]}${8 - top}`;

export const parseChessCell = (cell: string): Position => ({
    top: 8 - Number(cell[1]),
    left: chessColumns.indexOf(cell[0]),
});
