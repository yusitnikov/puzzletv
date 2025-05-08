import { observer } from "mobx-react-lite";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { ChessPTM } from "../types/ChessPTM";
import { unserializeGridState } from "../../../types/sudoku/GridState";
import { ChessColor } from "../types/ChessColor";
import { ChessPieceType } from "../types/ChessPieceType";
import { Line } from "../../../types/layout/Position";
import { RulesParagraph } from "../../../components/sudoku/rules/RulesParagraph";
import { lightenColorStr } from "../../../utils/color";
import { purpleColor } from "../../../components/app/globals";
import { splitArrayIntoChunks } from "../../../utils/array";
import { ChessMove, getChessMoveDescription } from "../types/ChessMove";
import { ChessPiece } from "../types/ChessPiece";
import { computedFn } from "mobx-utils";
import { comparer, makeAutoObservable } from "mobx";

interface ChessHistoryProps {
    context: PuzzleContext<ChessPTM>;
}

export const ChessHistory = observer(function ChessHistory({ context }: ChessHistoryProps) {
    const moves = ChessHistoryManager.getInstance(context).getChessHistory(false);

    return (
        <RulesParagraph>
            {splitArrayIntoChunks(moves, 2).map((pair, index) => (
                <div key={index}>
                    {index + 1}. &nbsp;
                    {pair[0] ? <Move context={context} {...pair[0]} /> : "..."}
                    &nbsp;
                    {pair[1] ? <Move context={context} {...pair[1]} /> : pair.length === 2 ? "..." : undefined}
                </div>
            ))}
        </RulesParagraph>
    );
});

interface MoveProps extends ChessMove {
    context: PuzzleContext<ChessPTM>;
    index: number;
}

const Move = observer(function Move({ context, index, ...move }: MoveProps) {
    return (
        <span
            onClick={() =>
                context.onStateChange({
                    gridStateHistory: context.gridStateHistory.seek(index),
                })
            }
            style={{
                cursor: "pointer",
                background:
                    context.gridStateHistory.currentIndex === index ? lightenColorStr(purpleColor, 0.7) : undefined,
            }}
        >
            {getChessMoveDescription(move, false)}
        </span>
    );
});

export class ChessHistoryManager {
    static getInstance(context: PuzzleContext<ChessPTM>): ChessHistoryManager {
        return (context.puzzleIndex.cache[ChessHistoryManager.name] ??= new ChessHistoryManager(context));
    }

    private constructor(private context: PuzzleContext<ChessPTM>) {
        makeAutoObservable(this);
    }

    readonly getChessHistory = computedFn(
        function getChessHistory(this: ChessHistoryManager, untilCurrentState: boolean) {
            const { gridStateHistory, puzzle } = this.context;

            let states = gridStateHistory.states.map((state) =>
                unserializeGridState(JSON.parse(state), puzzle).cells.map((row) =>
                    row.map(({ usersDigit }) => usersDigit),
                ),
            );
            if (untilCurrentState) {
                states = states.slice(0, gridStateHistory.currentIndex + 1);
            }

            const moves: ((ChessMove & { index: number }) | undefined)[] = [];
            let isBlackMove = false;
            for (let i = 0; i < states.length - 1; i++) {
                const prev = states[i];
                const next = states[i + 1];

                const changes: Partial<
                    Record<
                        ChessColor,
                        {
                            captured?: ChessPiece;
                            movesMap: Partial<Record<ChessPieceType, Partial<Line>>>;
                        }
                    >
                > = {};
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

                            changes[nextPiece.color] ??= { movesMap: {} };
                            changes[nextPiece.color]!.captured = prevPiece;
                        }

                        if (prevPiece && !nextPiece) {
                            const { color, type } = prevPiece;
                            changes[color] ??= { movesMap: {} };
                            changes[color]!.movesMap[type] ??= {};
                            if (changes[color]!.movesMap[type]!.start) {
                                invalidMove = true;
                                break;
                            }
                            changes[color]!.movesMap[type]!.start = { top, left };
                        }

                        if (nextPiece) {
                            const { color, type } = nextPiece;
                            changes[color] ??= { movesMap: {} };
                            changes[color]!.movesMap[type] ??= {};
                            if (changes[color]!.movesMap[type]!.end) {
                                invalidMove = true;
                                break;
                            }
                            changes[color]!.movesMap[type]!.end = { top, left };
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
                const [moveColorStr, { captured, movesMap }] = changesArr[0];
                const moveColor = Number(moveColorStr) as ChessColor;

                let promotionPiece: ChessPieceType | undefined;
                if (movesMap[ChessPieceType.pawn]?.start && !movesMap[ChessPieceType.pawn]?.end) {
                    const otherMovePieces = Object.keys(movesMap)
                        .map((type) => Number(type) as ChessPieceType)
                        .filter((type) => type !== ChessPieceType.pawn);
                    if (otherMovePieces.length === 1) {
                        promotionPiece = otherMovePieces[0];
                        movesMap[ChessPieceType.pawn]!.end = movesMap[promotionPiece]!.end;
                        delete movesMap[promotionPiece];
                    }
                }

                const movesArr = Object.entries(movesMap);
                if (movesArr.some(([, { start, end }]) => !start || !end)) {
                    continue;
                }

                let moveObj: ChessMove;
                if (
                    movesArr.length === 2 &&
                    !captured &&
                    movesMap[ChessPieceType.king] &&
                    movesMap[ChessPieceType.rook]
                ) {
                    const { start, end } = movesMap[ChessPieceType.king]!;
                    moveObj = {
                        start: start!,
                        end: end!,
                        piece: {
                            type: ChessPieceType.king,
                            color: moveColor,
                        },
                    };
                } else if (movesArr.length === 1) {
                    const [typeStr, { start, end }] = movesArr[0];
                    const type = Number(typeStr) as ChessPieceType;
                    moveObj = {
                        start: start!,
                        end: end!,
                        piece: {
                            type,
                            color: moveColor,
                        },
                        capturedPiece: captured,
                        promotionPiece,
                    };
                } else {
                    continue;
                }

                const add = (move?: ChessMove) => {
                    moves.push(move ? { ...move, index: i + 1 } : undefined);
                    isBlackMove = !isBlackMove;
                };
                if (moveColor !== (isBlackMove ? ChessColor.black : ChessColor.white)) {
                    add();
                }
                add(moveObj);
            }

            return moves;
        },
        { equals: comparer.structural },
    );
}
