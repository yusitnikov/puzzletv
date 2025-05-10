import { observer } from "mobx-react-lite";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { ChessPTM } from "../types/ChessPTM";
import { useEffect, useMemo } from "react";
import { ChessHistoryManager } from "./ChessHistory";
import { ChessEngineResult, VariationChessEngineResult } from "../types/ChessEngineResult";
import { ChessBoardBase, GridStateChessBoard, ReadOnlyChessBoard } from "../types/ChessBoard";
import { parseChessCell } from "../types/utils";
import { ChessMove, getChessMoveDescription } from "../types/ChessMove";
import { ChessPieceTypeReverseMap } from "../types/ChessPieceType";
import { profiler } from "../../../utils/profiler";
import { makeAutoObservable, reaction, runInAction } from "mobx";
import { isSamePosition } from "../../../types/layout/Position";
import { computedFn } from "mobx-utils";
import { useEventListener } from "../../../hooks/useEventListener";
import { settings } from "../../../types/layout/Settings";
import { makeChessMove } from "../types/ChessGameTypeManager";

interface ChessEngineProps {
    context: PuzzleContext<ChessPTM>;
}

export class ChessEngineManager {
    private engineMoves: string[] | undefined = undefined;
    private engineVariations: VariationChessEngineResult[] = [];

    static getInstance(context: PuzzleContext<ChessPTM>): ChessEngineManager {
        return context.getCachedItem(ChessEngineManager.name, () => new ChessEngineManager(context));
    }

    private constructor(private context: PuzzleContext<ChessPTM>) {
        makeAutoObservable(this);
    }

    get history() {
        profiler.trace();
        return ChessHistoryManager.getInstance(this.context).getChessHistory(true);
    }

    get halfMoves() {
        profiler.trace();
        return this.history.length;
    }

    get board() {
        profiler.trace();
        return new GridStateChessBoard(this.context.currentGridState.cells);
    }

    get fen() {
        profiler.trace();
        return this.board.getFen(this.halfMoves);
    }

    get parsedMoves() {
        profiler.trace();
        return this.engineMoves
            ?.map((moveStr) => parseEngineMoveOnBoard(this.board, moveStr, false))
            ?.filter((move): move is ChessMove => move !== undefined);
    }

    readonly getMovesForCell = computedFn((top: number, left: number) => {
        return this.parsedMoves?.filter(({ start }) => isSamePosition(start, { top, left }))?.map(({ end }) => end);
    });

    get movesForSelectedCell() {
        if (this.context.selectedCellsCount !== 1) {
            return [];
        }

        const { top, left } = this.context.firstSelectedCell!;
        return this.getMovesForCell(top, left);
    }

    get formattedMoves() {
        profiler.trace();
        return this.engineMoves?.map((moveStr) => getEngineMoveDescription(this.board, moveStr, false));
    }

    get formattedVariations() {
        profiler.trace();

        return this.engineVariations.filter(Boolean).map(({ depth, multipv, pv, score: { unit, value } }) => {
            const board = new GridStateChessBoard(this.context.currentGridState.cells);

            const moves = pv
                .split(" ")
                .map((moveStr) => getEngineMoveDescription(board, moveStr, true))
                .join(" ");

            return `[${depth}] [${unit}=${value}] ${multipv}. ${moves}`;
        });
    }

    makeMove() {
        const bestMoveStr = this.engineVariations[0]?.pv.split(" ")[0];
        if (!bestMoveStr) {
            return;
        }

        const bestMove = parseEngineMove(bestMoveStr);
        if (!bestMove) {
            return;
        }

        makeChessMove(this.context, bestMove.start, bestMove.end);
    }

    run() {
        let disposeLastAction = () => {};

        const disposeReaction = reaction(
            () => this.fen,
            (fen) => {
                disposeLastAction();

                runInAction(() => {
                    this.engineMoves = undefined;
                    this.engineVariations = [];
                });

                let aborted = false;

                const socket = new WebSocket("ws://localhost:3002");

                socket.addEventListener("open", () => {
                    if (aborted) {
                        return;
                    }

                    console.debug("Open!");
                    socket.send(JSON.stringify({ variant: "sudoku", fen }));
                });

                socket.addEventListener("message", (ev) => {
                    if (aborted) {
                        return;
                    }

                    const result: ChessEngineResult = JSON.parse(ev.data.toString());

                    switch (result.type) {
                        case "moves":
                            runInAction(() => {
                                this.engineMoves = result.moves;
                            });
                            break;
                        case "variation":
                            runInAction(() => {
                                if (result.multipv === 1) {
                                    this.engineVariations = [result];
                                } else {
                                    this.engineVariations[result.multipv - 1] = result;
                                }
                            });
                            break;
                    }
                });

                socket.addEventListener("close", () => {
                    if (aborted) {
                        return;
                    }

                    console.debug("Closed!");
                });

                socket.addEventListener("error", () => {
                    if (aborted) {
                        return;
                    }

                    console.debug("Error!");
                });

                disposeLastAction = () => {
                    aborted = true;
                    socket.close();
                };
            },
            {
                name: "runChessEngine",
                fireImmediately: true,
            },
        );

        return () => {
            disposeLastAction();
            disposeReaction();
        };
    }
}

export const ChessEngine = observer(function ChessEngine({ context }: ChessEngineProps) {
    const manager = ChessEngineManager.getInstance(context);

    const dispose = useMemo(() => manager.run(), [manager]);
    useEffect(() => dispose, [dispose]);

    useEventListener(window, "keydown", (ev) => {
        if (!settings.isOpened && ev.code === "Space" && manager.formattedVariations.length) {
            manager.makeMove();
        }
    });

    return (
        <div
            style={{
                fontSize: context.cellSizeForSidePanel * 0.2,
                marginBottom: "0.5em",
            }}
        >
            {/*<div>FEN: {manager.fen}</div>*/}

            {manager.formattedVariations.map((line, index) => (
                <div
                    key={index}
                    title={line}
                    style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {line}
                </div>
            ))}

            {manager.formattedMoves !== undefined && (
                <div>Possible moves: {manager.formattedMoves.join(", ") || "none"}</div>
            )}
        </div>
    );
});

const parseEngineMove = (moveStr: string): Omit<ChessMove, "piece"> | undefined => {
    if (moveStr.length !== 4 && moveStr.length !== 5) {
        console.warn("Got invalid move string from the engine", moveStr);
        return undefined;
    }

    return {
        start: parseChessCell(moveStr.substring(0, 2)),
        end: parseChessCell(moveStr.substring(2, 4)),
        promotionPiece: ChessPieceTypeReverseMap[moveStr.substring(4).toUpperCase()],
    };
};

const parseEngineMoveOnBoard = (board: ChessBoardBase, moveStr: string, doTheMove: boolean) => {
    const parsedMove = parseEngineMove(moveStr);
    if (!parsedMove) {
        return undefined;
    }

    const move = (doTheMove ? board : new ReadOnlyChessBoard(board)).move(
        parsedMove.start,
        parsedMove.end,
        parsedMove.promotionPiece,
    );
    if (!move.piece) {
        console.warn("Got invalid move string from the engine", moveStr);
        return undefined;
    }

    return move;
};

const getEngineMoveDescription = (board: ChessBoardBase, moveStr: string, doTheMove: boolean): string => {
    const move = parseEngineMoveOnBoard(board, moveStr, doTheMove);

    return move ? getChessMoveDescription(move, true) : moveStr;
};
