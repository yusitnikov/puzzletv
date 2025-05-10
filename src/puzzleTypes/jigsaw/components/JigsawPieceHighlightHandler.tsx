import {
    ControlButtonItem,
    ControlButtonItemProps,
    ControlButtonRegion,
} from "../../../components/puzzle/controls/ControlButtonsManager";
import { JigsawPTM } from "../types/JigsawPTM";
import { useEventListener } from "../../../hooks/useEventListener";
import { useEffect } from "react";
import {
    getActiveJigsawPieceZIndex,
    getJigsawPieceIndexesByCell,
    groupJigsawPiecesByZIndex,
    moveJigsawPieceByGroupGesture,
} from "../types/helpers";
import { jigsawPieceBringOnTopAction, jigsawPieceStateChangeAction } from "../types/JigsawGamePieceState";
import { incrementArrayItem } from "../../../utils/array";
import { myClientId } from "../../../hooks/useMultiPlayer";
import { getNextActionId } from "../../../types/puzzle/GameStateAction";
import { emptyGestureMetrics, GestureMetrics } from "../../../utils/gestures";
import { comparer } from "mobx";
import { observer } from "mobx-react-lite";
import { useComputedValue } from "../../../hooks/useComputed";
import { profiler } from "../../../utils/profiler";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";

const JigsawPieceHighlightHandler = observer(function JigsawPieceHighlightHandler({
    context,
}: ControlButtonItemProps<JigsawPTM>) {
    profiler.trace();

    // TODO: make sure that the last selected cell with Ctrl+A is the bottom-right-most cell according to the pieces' state
    const hasSelectedCell = useComputedValue(
        function getHasSelectedCell() {
            return !!context.lastSelectedCell;
        },
        { equals: comparer.structural },
    );
    const selectedRegionIndexes = useComputedValue(
        function getSelectedRegionIndexes() {
            return (
                context.lastSelectedCell &&
                getJigsawPieceIndexesByCell(context.puzzle, context.gridExtension.pieces, context.lastSelectedCell)
            );
        },
        { equals: comparer.structural },
    );
    useEffect(() => {
        if (selectedRegionIndexes?.length) {
            context.onStateChange(jigsawPieceBringOnTopAction(selectedRegionIndexes, false));
        } else if (hasSelectedCell) {
            context.onStateChange({ extension: { highlightCurrentPiece: false } });
        }
    }, [context, selectedRegionIndexes, hasSelectedCell]);

    useEventListener(window, "keydown", (ev) => {
        const { code, ctrlKey, metaKey, altKey, shiftKey } = ev;

        if (ctrlKey || metaKey || altKey) {
            return;
        }

        const {
            puzzle,
            stateExtension: { highlightCurrentPiece },
            gridExtension: { pieces: piecePositions },
        } = context;

        const { importOptions: { angleStep } = {} } = puzzle;
        const activeZIndex = getActiveJigsawPieceZIndex(piecePositions);
        const groups = groupJigsawPiecesByZIndex(context);

        const movePiece = (dx: number, dy: number) => {
            if (highlightCurrentPiece && context.cellWriteMode === CellWriteMode.move) {
                const activeGroup = groups.find(({ zIndex }) => zIndex === activeZIndex);
                if (activeGroup) {
                    context.onStateChange(
                        jigsawPieceStateChangeAction(
                            undefined,
                            myClientId,
                            getNextActionId(),
                            activeGroup.indexes,
                            ({ position: { top, left } }) => ({
                                position: {
                                    top: top + dy,
                                    left: left + dx,
                                },
                                state: { animating: true },
                            }),
                            false,
                        ),
                    );
                    ev.preventDefault();
                }
            }
        };

        switch (code) {
            case "Tab":
                const sortedPieceGroups = [...groups].sort(
                    ({ center: a }, { center: b }) => Math.sign(a.top - b.top) || Math.sign(a.left - b.left),
                );
                const newActivePieces = incrementArrayItem(
                    sortedPieceGroups,
                    ({ zIndex }) => zIndex === activeZIndex,
                    shiftKey ? -1 : 1,
                );
                // TODO: scroll the active piece into view
                context.onStateChange([
                    jigsawPieceBringOnTopAction(newActivePieces.indexes),
                    context.selectedCellsCount !== 0
                        ? {
                              // TODO: select the top-left-most cell according to the current angle
                              selectedCells: context.selectedCells.set(newActivePieces.cells.slice(0, 1)),
                          }
                        : {},
                ]);

                ev.preventDefault();
                break;
            case "KeyR":
            case "Space":
                if (highlightCurrentPiece && angleStep) {
                    const activeGroup = groups.find(({ zIndex }) => zIndex === activeZIndex);
                    if (activeGroup) {
                        const groupGesture: GestureMetrics = {
                            ...emptyGestureMetrics,
                            rotation: angleStep * (shiftKey ? -1 : 1),
                        };
                        context.onStateChange(
                            jigsawPieceStateChangeAction(
                                undefined,
                                myClientId,
                                getNextActionId(),
                                activeGroup.indexes,
                                ({ position }, pieceIndex) => ({
                                    position: moveJigsawPieceByGroupGesture(
                                        activeGroup.center,
                                        groupGesture,
                                        puzzle.extension!.pieces[pieceIndex],
                                        position,
                                    ),
                                    state: { animating: true },
                                }),
                                false,
                            ),
                        );
                    }
                }
                ev.preventDefault();
                break;
            case "ArrowDown":
                movePiece(0, 1);
                break;
            case "ArrowUp":
                movePiece(0, -1);
                break;
            case "ArrowRight":
                movePiece(1, 0);
                break;
            case "ArrowLeft":
                movePiece(-1, 0);
                break;
        }
    });

    return null;
});

export const JigsawPieceHighlightHandlerControlButtonItem: ControlButtonItem<JigsawPTM> = {
    key: "jigsaw-piece-highlight",
    region: ControlButtonRegion.custom,
    Component: JigsawPieceHighlightHandler,
};
