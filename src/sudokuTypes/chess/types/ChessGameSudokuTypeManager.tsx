import { SudokuTypeManager } from "../../../types/sudoku/SudokuTypeManager";
import { ChessColor } from "./ChessColor";
import { ChessPTM } from "./ChessPTM";
import { ChessSudokuTypeManager } from "./ChessSudokuTypeManager";
import { FieldState } from "../../../types/sudoku/FieldState";
import { ChessPieceType } from "./ChessPieceType";
import { comparer, IReactionDisposer, reaction } from "mobx";
import { fieldStateHistoryAddState } from "../../../types/sudoku/FieldStateHistory";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { getNextActionId } from "../../../types/sudoku/GameStateAction";
import { PuzzleDefinition } from "../../../types/sudoku/PuzzleDefinition";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { ChessEngine, ChessEngineManager } from "../components/ChessEngine";
import { ChessHistory } from "../components/ChessHistory";
import { FieldStateChessBoard } from "./ChessBoard";
import { CellSelectionByDataProps, CellSelectionColor } from "../../../components/sudoku/cell/CellSelection";
import { arrayContainsPosition, Position } from "../../../types/layout/Position";

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
const initialPieces: Record<number, { color: ChessColor; pieces: ChessPieceType[] }> = {
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
};

export const ChessGameSudokuTypeManager: SudokuTypeManager<ChessPTM> = {
    ...ChessSudokuTypeManager,

    cosmeticRegions: true,
    getRegionsForRowsAndColumns() {
        return [];
    },

    modifyInitialFieldState({ cells, ...state }: FieldState<ChessPTM>): FieldState<ChessPTM> {
        return {
            ...state,
            cells: cells.map((row, top) =>
                row.map((cell, left) => {
                    const rowPieces = initialPieces[top];

                    return {
                        ...cell,
                        usersDigit: rowPieces && {
                            type: rowPieces.pieces[left],
                            color: rowPieces.color,
                        },
                    };
                }),
            ),
        };
    },

    getCellSelectionType(
        cell,
        context,
    ): Required<Pick<CellSelectionByDataProps<ChessPTM>, "color" | "strokeWidth">> | undefined {
        const { movesForSelectedCell = [] } = ChessEngineManager.getInstance(context);
        if (arrayContainsPosition(movesForSelectedCell, cell)) {
            return {
                color: CellSelectionColor.secondary,
                strokeWidth: 1,
            };
        }
        return undefined;
    },

    getReactions(context): IReactionDisposer[] {
        return [
            ...(ChessSudokuTypeManager.getReactions?.(context) ?? []),
            reaction(
                () => (context.selectedCellsCount === 1 ? context.firstSelectedCell : undefined),
                (to, from) => {
                    if (!to || !from) {
                        return;
                    }

                    const moves = ChessEngineManager.getInstance(context).getMovesForCell(from.top, from.left);
                    if (moves && !arrayContainsPosition(moves, to)) {
                        return;
                    }

                    makeChessMove(context, from, to);
                },
                {
                    name: "selected chess piece",
                    equals: comparer.structural,
                },
            ),
        ];
    },

    getAboveRules(_translate, context) {
        return <ChessEngine context={context} />;
    },

    postProcessPuzzle(puzzle): PuzzleDefinition<ChessPTM> {
        puzzle = ChessSudokuTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;

        return {
            ...puzzle,
            rules(translate, context) {
                return (
                    <>
                        {puzzle.rules?.(translate, context)}

                        <ChessHistory context={context} />
                    </>
                );
            },
        };
    },

    applyArrowsToHistory: true,
};

export const makeChessMove = (context: PuzzleContext<ChessPTM>, from: Position, to: Position) => {
    const piece = context.getCellDigit(from.top, from.left);
    if (!piece) {
        return;
    }

    const capturedPiece = context.getCellDigit(to.top, to.left);
    if (capturedPiece?.color === piece.color) {
        return;
    }

    context.onStateChange({
        fieldStateHistory: fieldStateHistoryAddState(context, myClientId, getNextActionId(), ({ cells, ...state }) => {
            const board = new FieldStateChessBoard(cells);

            board.move(from, to);

            return {
                ...state,
                cells: board.cells,
            };
        }),
        selectedCells: context.selectedCells.clear(),
    });
};
