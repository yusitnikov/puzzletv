import { GameStateActionCallback } from "../../../types/puzzle/GameStateAction";
import { JigsawPTM } from "./JigsawPTM";
import { gridStateHistoryAddState } from "../../../types/puzzle/GridStateHistory";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { getActiveJigsawPieceZIndex, groupJigsawPiecesByZIndex } from "./helpers";
import { JigsawGridPieceState } from "./JigsawGridState";
import { indexes } from "../../../utils/indexes";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";

export interface JigsawGamePieceState {
    animating: boolean;
}

interface JigsawPieceStateUpdate {
    position?: Partial<JigsawGridPieceState>;
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
                      position: JigsawGridPieceState;
                      state: JigsawGamePieceState;
                      allPositions: JigsawGridPieceState[];
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
                gridExtension: { pieces: piecePositions },
            } = context;
            if (startContext) {
                // Take the position from the start state, but z-index from the current state
                // (because "bring on top" action could be executed in the middle of the gesture)
                const {
                    gridExtension: { pieces: startPiecePositions },
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
                gridStateHistory: gridStateHistoryAddState(
                    context,
                    clientId,
                    actionId,
                    ({ extension: { pieces: piecePositions }, ...gridState }) => {
                        // TODO: re-index all pieces to avoid meaningless history slots?
                        const newPiecePositions = piecePositions.map((position, index) =>
                            indexReverseMap[index] !== undefined
                                ? { ...position, ...updatesPerIndex[indexReverseMap[index]].position }
                                : position,
                        );

                        const groups = groupJigsawPiecesByZIndex(context, newPiecePositions);

                        return {
                            ...gridState,
                            extension: {
                                // re-calculate rotation axes of all updated pieces
                                pieces: newPiecePositions.map((position, index) =>
                                    indexReverseMap[index] !== undefined
                                        ? {
                                              ...position,
                                              rotationAxis:
                                                  groups.find(({ indexes }) => indexes.includes(index))?.center ??
                                                  position.rotationAxis,
                                          }
                                        : position,
                                ),
                            },
                        };
                    },
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
