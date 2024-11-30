import { GameStateActionCallback } from "../../../types/sudoku/GameStateAction";
import { JigsawPTM } from "./JigsawPTM";
import { fieldStateHistoryAddState } from "../../../types/sudoku/FieldStateHistory";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { getActiveJigsawPieceZIndex } from "./helpers";
import { JigsawFieldPieceState } from "./JigsawFieldState";
import { indexes } from "../../../utils/indexes";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";

export interface JigsawGamePieceState {
    animating: boolean;
}

interface JigsawPieceStateUpdate {
    position?: Partial<JigsawFieldPieceState>;
    state?: Partial<JigsawGamePieceState>;
}

export const jigsawPieceStateChangeAction =
    (
        startContext: PuzzleContext<JigsawPTM> | undefined,
        clientId: string,
        actionId: string,
        pieceIndexes: number[] | number | undefined,
        updates:
            | JigsawPieceStateUpdate
            | ((
                  prevPieceData: {
                      position: JigsawFieldPieceState;
                      state: JigsawGamePieceState;
                      allPositions: JigsawFieldPieceState[];
                      allStates: JigsawGamePieceState[];
                  },
                  index: number,
              ) => JigsawPieceStateUpdate),
        resetSelectedCells = true,
    ): GameStateActionCallback<JigsawPTM> =>
    (context) => {
        const {
            stateExtension: { pieces: pieceStates },
        } = context;

        if (pieceIndexes === undefined) {
            pieceIndexes = indexes(pieceStates.length);
        }
        if (!Array.isArray(pieceIndexes)) {
            pieceIndexes = [pieceIndexes];
        }
        const indexReverseMap: Record<number, number> = {};
        for (const [index1, index2] of pieceIndexes.entries()) {
            indexReverseMap[index2] = index1;
        }

        let updatesPerIndex: JigsawPieceStateUpdate[];
        if (typeof updates === "function") {
            let {
                fieldExtension: { pieces: piecePositions },
            } = context;
            if (startContext) {
                // Take the position from the start state, but z-index from the current state
                // (because "bring on top" action could be executed in the middle of the gesture)
                const {
                    fieldExtension: { pieces: startPiecePositions },
                } = startContext;
                piecePositions = startPiecePositions.map((startPosition, index) => ({
                    ...startPosition,
                    zIndex: piecePositions[index].zIndex,
                }));
            }

            updatesPerIndex = pieceIndexes.map((pieceIndex) =>
                updates(
                    {
                        position: piecePositions[pieceIndex],
                        state: pieceStates[pieceIndex],
                        allPositions: piecePositions,
                        allStates: pieceStates,
                    },
                    pieceIndex,
                ),
            );
        } else {
            updatesPerIndex = pieceIndexes.map(() => updates);
        }

        return {
            ...(updatesPerIndex.some(({ position }) => position) && {
                fieldStateHistory: fieldStateHistoryAddState(
                    context,
                    clientId,
                    actionId,
                    ({ extension: { pieces: piecePositions }, ...fieldState }) => ({
                        ...fieldState,
                        extension: {
                            // TODO: re-index all pieces to avoid meaningless history slots?
                            pieces: piecePositions.map((position, index) =>
                                indexReverseMap[index] !== undefined
                                    ? { ...position, ...updatesPerIndex[indexReverseMap[index]].position }
                                    : position,
                            ),
                        },
                    }),
                ),
            }),
            extension: {
                pieces: pieceStates.map((state, index) =>
                    indexReverseMap[index] !== undefined
                        ? { ...state, ...updatesPerIndex[indexReverseMap[index]].state }
                        : state,
                ),
                highlightCurrentPiece: true,
            },
            ...(resetSelectedCells && { selectedCells: context.selectedCells.clear() }),
        };
    };

export const jigsawPieceBringOnTopAction = (pieceIndexes: number[], resetSelectedCells = true) =>
    jigsawPieceStateChangeAction(
        undefined,
        myClientId,
        "jigsaw-bring-on-top",
        pieceIndexes,
        ({ allPositions }) => ({
            position: {
                zIndex: getActiveJigsawPieceZIndex(allPositions) + 1,
            },
        }),
        resetSelectedCells,
    );
