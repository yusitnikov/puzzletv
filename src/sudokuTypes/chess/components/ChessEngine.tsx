import {observer} from "mobx-react-lite";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {ChessPTM} from "../types/ChessPTM";
import {useEffect, useMemo, useRef, useState} from "react";
import {useChessHistory} from "./ChessHistory";
import {ChessEngineResult} from "../types/ChessEngineResult";
import {ChessBoardBase, FieldStateChessBoard, ReadOnlyChessBoard} from "../types/ChessBoard";
import {parseChessCell} from "../types/utils";
import {ChessMove, getChessMoveDescription} from "../types/ChessMove";
import {ChessPieceTypeReverseMap} from "../types/ChessPieceType";

let autoIncrementId = 0;

interface ChessEngineProps {
    context: PuzzleContext<ChessPTM>;
}

export const ChessEngine = observer(function ChessEngine({context}: ChessEngineProps) {
    const {currentFieldState} = context;

    const halfMoves = useChessHistory(context, true).length;

    const fen = useMemo(
        () => new FieldStateChessBoard(currentFieldState.cells).getFen(halfMoves),
        [currentFieldState, halfMoves]
    );

    const [socketState, setSocketState] = useState("initializing");
    const messageIdRef = useRef(0);
    const [moves, setMoves] = useState<string[]>([]);
    const [variations, setVariations] = useState<string[]>([]);
    const socket = useMemo(() => {
        const socket = new WebSocket("ws://localhost:3002");
        socket.addEventListener("open", () => {
            console.log("Open!");
            setSocketState("ready");
        });
        socket.addEventListener("message", (ev) => {
            const result: ChessEngineResult = JSON.parse(ev.data.toString());
            if (result.mid !== messageIdRef.current) {
                return;
            }

            const board = new FieldStateChessBoard(context.currentFieldState.cells);

            switch (result.type) {
                case "moves":
                    setMoves(result.moves.map((moveStr) => getEngineMoveDescription(board, moveStr, false)));
                    break;
                case "variation": {
                    const {depth, multipv, pv, score: {unit, value}} = result;

                    const moves = pv
                        .split(" ")
                        .map((moveStr) => getEngineMoveDescription(board, moveStr, true))
                        .join(" ");

                    const line = `[${depth}] [${unit}=${value}] ${multipv}. ${moves}`;
                    console.log(line);
                    setVariations((prev) => {
                        if (multipv === 1) {
                            return [line];
                        }
                        const next = [...prev];
                        next[multipv - 1] = line;
                        return next;
                    });
                    break;
                }
            }
        });
        socket.addEventListener("close", () => {
            console.log("Closed!");
            setSocketState("closed");
        });
        socket.addEventListener("error", () => {
            console.log("Error!");
        });
        return socket;
    }, [context]);
    useEffect(() => {
        messageIdRef.current = ++autoIncrementId;
        setMoves([]);
        setVariations([]);
        if (socketState === "ready" && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({mid: messageIdRef.current, fen, variant: "sudoku"}));
        }
    }, [socket, socketState, fen]);
    useEffect(() => {
        return () => {
            setSocketState("disposed");
            socket.close();
        };
    }, [socket]);

    return <div style={{
        fontSize: context.cellSizeForSidePanel * 0.2,
        marginBottom: "0.5em",
    }}>
        {/*<div>FEN: {fen}</div>*/}

        {variations.map((line, index) => <div
            key={index}
            title={line}
            style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
            }}
        >
            {line}
        </div>)}

        {moves.length > 0 && <div>Possible moves: {moves.join(", ")}</div>}
    </div>;
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

const getEngineMoveDescription = (board: ChessBoardBase, moveStr: string, doTheMove: boolean): string => {
    const parsedMove = parseEngineMove(moveStr);
    if (!parsedMove) {
        return moveStr;
    }

    const move = (doTheMove ? board : new ReadOnlyChessBoard(board))
        .move(parsedMove.start, parsedMove.end, parsedMove.promotionPiece);
    if (!move.piece) {
        console.warn("Got invalid move string from the engine", moveStr);
        return moveStr;
    }

    return getChessMoveDescription(move, true);
};
