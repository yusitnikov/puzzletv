import {SudokuTypeManager} from "../../../types/sudoku/SudokuTypeManager";
import {ChessColor} from "./ChessColor";
import {ChessPTM} from "./ChessPTM";
import {ChessSudokuTypeManager} from "./ChessSudokuTypeManager";
import {FieldState} from "../../../types/sudoku/FieldState";
import {ChessPieceType} from "./ChessPieceType";
import {comparer, IReactionDisposer, reaction} from "mobx";
import {fieldStateHistoryAddState} from "../../../types/sudoku/FieldStateHistory";
import {myClientId} from "../../../hooks/useMultiPlayer";
import {getNextActionId} from "../../../types/sudoku/GameStateAction";
import {PuzzleDefinition} from "../../../types/sudoku/PuzzleDefinition";
import {ChessEngine, ChessEngineManager} from "../components/ChessEngine";
import {ChessHistory} from "../components/ChessHistory";
import {FieldStateChessBoard} from "./ChessBoard";
import {CellSelectionByDataProps, CellSelectionColor} from "../../../components/sudoku/cell/CellSelection";
import {arrayContainsPosition} from "../../../types/layout/Position";

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

    getCellSelectionType(cell, context): Required<Pick<CellSelectionByDataProps<ChessPTM>, "color" | "strokeWidth">> | undefined {
        const {movesForSelectedCell = []} = ChessEngineManager.getInstance(context);
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
            ...ChessSudokuTypeManager.getReactions?.(context) ?? [],
            reaction(
                () => context.selectedCellsCount === 1 ? context.firstSelectedCell : undefined,
                (nextCell, cell) => {
                    if (!nextCell || !cell) {
                        return;
                    }

                    const {top, left} = cell;
                    const {top: nextTop, left: nextLeft} = nextCell;

                    const moves = ChessEngineManager.getInstance(context).getMovesForCell(top, left);
                    if (moves && !arrayContainsPosition(moves, nextCell)) {
                        return;
                    }

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
                                const board = new FieldStateChessBoard(cells);

                                board.move(cell, nextCell);

                                return {
                                    ...state,
                                    cells: board.cells,
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

    getAboveRules(_translate, context) {
        return <ChessEngine context={context}/>;
    },

    postProcessPuzzle(puzzle): PuzzleDefinition<ChessPTM> {
        puzzle = ChessSudokuTypeManager.postProcessPuzzle?.(puzzle) ?? puzzle;

        return {
            ...puzzle,
            rules(translate, context) {
                return <>
                    {puzzle.rules?.(translate, context)}

                    <ChessHistory context={context}/>
                </>;
            }
        };
    },

    applyArrowsToHistory: true,
};
