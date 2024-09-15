import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {ChessColor} from "./ChessColor";
import {ChessPTM} from "./ChessPTM";
import {ChessSudokuTypeManager} from "./ChessSudokuTypeManager";
import {FieldState, unserializeFieldState} from "../../../types/sudoku/FieldState";
import {ChessPieceType, ChessPieceTypeNotation} from "./ChessPieceType";
import {comparer, IReactionDisposer, reaction} from "mobx";
import {fieldStateHistoryAddState} from "../../../types/sudoku/FieldStateHistory";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {getNextActionId} from "../../../types/sudoku/GameStateAction";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {RulesParagraph} from "../../../components/sudoku/rules/RulesParagraph";
import {Line, Position} from "../../../types/layout/Position";
import {alphabet} from "../../../data/alphabet";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {observer} from "mobx-react-lite";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {purpleColor} from "../../../components/app/globals";
import {lightenColorStr} from "../../../utils/color";

const initialHeavyPieces = [
    ChessPieceType.rook,
    ChessPieceType.knight,
    ChessPieceType.bishop,
    ChessPieceType.queen,
    ChessPieceType.king,
    ChessPieceType.bishop,
    ChessPieceType.knight,
    ChessPieceType.rook,
];
const initialPieces: Record<number, { color: ChessColor, pieces: ChessPieceType[] }> = {
    0: {
        color: ChessColor.black,
        pieces: initialHeavyPieces,
    },
    1: {
        color: ChessColor.black,
        pieces: Array(8).fill(ChessPieceType.pawn),
    },
    6: {
        color: ChessColor.white,
        pieces: Array(8).fill(ChessPieceType.pawn),
    },
    7: {
        color: ChessColor.white,
        pieces: initialHeavyPieces,
    },
}

export const ChessGameSudokuTypeManager: SudokuTypeManager<ChessPTM> = {
    ...ChessSudokuTypeManager,

    cosmeticRegions: true,
    getRegionsForRowsAndColumns() {
        return [];
    },

    modifyInitialFieldState({cells, ...state}: FieldState<ChessPTM>): FieldState<ChessPTM> {
        return {
            ...state,
            cells: cells.map((row, top) => row.map((cell, left) => {
                const rowPieces = initialPieces[top];

                return {
                    ...cell,
                    usersDigit: rowPieces && {
                        type: rowPieces.pieces[left],
                        color: rowPieces.color,
                    },
                };
            })),
        };
    },

    getReactions(context): IReactionDisposer[] {
        return [
            ...ChessSudokuTypeManager.getReactions?.(context) ?? [],
            reaction(
                () => context.selectedCells.size === 1 ? context.selectedCells.first() : undefined,
                (nextCell, cell) => {
                    if (!nextCell || !cell) {
                        return;
                    }

                    const {top, left} = cell;
                    const {top: nextTop, left: nextLeft} = nextCell;

                    const piece = context.getCellDigit(top, left);
                    if (!piece) {
                        return;
                    }

                    const capturedPiece = context.getCellDigit(nextTop, nextLeft);
                    if (capturedPiece?.color === piece.color) {
                        return;
                    }

                    context.onStateChange({
                        fieldStateHistory: fieldStateHistoryAddState(
                            context,
                            myClientId,
                            getNextActionId(),
                            ({cells, ...state}) => {
                                // Clone the array to keep the original unchanged
                                cells = cells.map(row => [...row]);

                                cells[nextTop][nextLeft] = cells[top][left];
                                cells[top][left] = {
                                    ...cells[top][left],
                                    usersDigit: undefined,
                                };

                                if (piece.type === ChessPieceType.king && top === nextTop && Math.abs(left - nextLeft) === 2) {
                                    const rookLeft = nextLeft > left ? 7 : 0;
                                    const rook = cells[top][rookLeft].usersDigit;

                                    if (rook?.type === ChessPieceType.rook && rook.color === piece.color) {
                                        cells[top][(left + nextLeft) / 2] = cells[top][rookLeft];
                                        cells[top][rookLeft] = {
                                            ...cells[top][rookLeft],
                                            usersDigit: undefined,
                                        };
                                    }
                                }

                                return {
                                    ...state,
                                    cells,
                                };
                            }
                        ),
                        selectedCells: context.selectedCells.clear(),
                    });
                },
                {
                    name: "selected chess piece",
                    equals: comparer.structural,
                }
            ),
        ];
    },

    postProcessPuzzle(puzzle): PuzzleDefinition<ChessPTM> {
        puzzle = ChessSudokuTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;

        return {
            ...puzzle,
            rules(translate, context) {
                const {fieldStateHistory} = context;
                const states = fieldStateHistory.states.map(
                    (state) => unserializeFieldState(JSON.parse(state), context.puzzle)
                        .cells
                        .map((row) => row.map(({usersDigit}) => usersDigit))
                );

                const moves: ({ move: string, index: number } | undefined)[][] = [];
                for (let i = 0; i < states.length - 1; i++) {
                    const prev = states[i];
                    const next = states[i + 1];

                    const changes: Partial<Record<ChessColor, { captured?: boolean, movesMap: Partial<Record<ChessPieceType, Partial<Line>>> }>> = {};
                    let invalidMove = false;
                    for (const [top, prevRow] of prev.entries()) {
                        for (const [left, prevPiece] of prevRow.entries()) {
                            const nextPiece = next[top][left];
                            if (prevPiece?.type === nextPiece?.type && prevPiece?.color === nextPiece?.color) {
                                continue;
                            }

                            if (prevPiece && nextPiece) {
                                if (prevPiece.color === nextPiece.color) {
                                    invalidMove = true;
                                    break;
                                }

                                changes[nextPiece.color] ??= {movesMap: {}};
                                changes[nextPiece.color]!.captured = true;
                            }

                            if (prevPiece && !nextPiece) {
                                const {color, type} = prevPiece;
                                changes[color] ??= {movesMap: {}};
                                changes[color]!.movesMap[type] ??= {};
                                if (changes[color]!.movesMap[type]!.start) {
                                    invalidMove = true;
                                    break;
                                }
                                changes[color]!.movesMap[type]!.start = {top, left};
                            }

                            if (nextPiece) {
                                const {color, type} = nextPiece;
                                changes[color] ??= {movesMap: {}};
                                changes[color]!.movesMap[type] ??= {};
                                if (changes[color]!.movesMap[type]!.end) {
                                    invalidMove = true;
                                    break;
                                }
                                changes[color]!.movesMap[type]!.end = {top, left};
                            }
                        }

                        if (invalidMove) {
                            break;
                        }
                    }
                    if (invalidMove) {
                        continue;
                    }

                    const changesArr = Object.entries(changes);
                    if (changesArr.length !== 1) {
                        continue;
                    }
                    const [moveColorStr, {captured, movesMap}] = changesArr[0];
                    const moveColor = Number(moveColorStr) as ChessColor;

                    const movesArr = Object.entries(movesMap);
                    if (movesArr.some(([, {start, end}]) => !start || !end)) {
                        continue;
                    }

                    let moveStr: string;
                    if (movesArr.length === 2 && !captured && movesMap[ChessPieceType.king] && movesMap[ChessPieceType.rook]) {
                        const {start, end} = movesMap[ChessPieceType.king]!;
                        moveStr = end!.left > start!.left ? "0-0" : "0-0-0";
                    } else if (movesArr.length === 1) {
                        const [typeStr, {start, end}] = movesArr[0];
                        const type = Number(typeStr) as ChessPieceType;
                        moveStr = `${ChessPieceTypeNotation[type]}${stringifyChessCell(start!)}${captured ? "x" : ""}${stringifyChessCell(end!)}`;
                    } else {
                        continue;
                    }

                    let isBlackMove = moves[moves.length - 1]?.length === 1;
                    const add = (move?: string) => {
                        if (!isBlackMove) {
                            moves.push([]);
                        }
                        moves[moves.length - 1].push(move ? {move, index: i + 1} : undefined);
                        isBlackMove = !isBlackMove;
                    };
                    if (moveColor !== (isBlackMove ? ChessColor.black : ChessColor.white)) {
                        add();
                    }
                    add(moveStr);
                }

                return <>
                    {puzzle.rules?.(translate, context)}

                    <RulesParagraph>
                        {moves.map(([white, black], index) => <div key={index}>
                            {index + 1}.
                            &nbsp;
                            {white ? <Move context={context} {...white}/> : "..."}
                            &nbsp;
                            {black ? <Move context={context} {...black}/> : index === moves.length - 1 ? undefined : "..."}
                        </div>)}
                    </RulesParagraph>
                </>;
            }
        };
    },

    applyArrowsToHistory: true,
};

interface MoveProps {
    context: PuzzleContext<ChessPTM>;
    move: string;
    index: number;
}
const Move = observer(function Move({context, move, index}: MoveProps) {
    return <span
        onClick={() => context.onStateChange({
            fieldStateHistory: context.fieldStateHistory.seek(index),
        })}
        style={{
            cursor: "pointer",
            background: context.fieldStateHistory.currentIndex === index
                ? lightenColorStr(purpleColor, 0.7)
                : undefined,
        }}
    >
        {move}
    </span>;
});

const chessColumns = alphabet[LanguageCode.en].toLowerCase();
const stringifyChessCell = ({top, left}: Position) => `${chessColumns[left]}${8 - top}`;
