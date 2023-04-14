import {
    ControlButtonItem,
    ControlButtonItemProps,
    ControlButtonRegion
} from "../../../components/sudoku/controls/ControlButtonsManager";
import {JigsawPTM} from "../types/JigsawPTM";
import {useEventListener} from "../../../hooks/useEventListener";
import {useEffect} from "react";
import {getActiveJigsawPieceIndex, getJigsawPieceIndexByCell, getJigsawPiecesWithCache} from "../types/helpers";
import {jigsawPieceBringOnTopAction} from "../types/JigsawPieceState";
import {getRectCenter} from "../../../types/layout/Rect";
import {incrementArrayItem} from "../../../utils/array";
import {useLastValueRef} from "../../../hooks/useLastValueRef";

const JigsawPieceHighlightHandler = ({context: {cellsIndex, state: {selectedCells, extension: {pieces: piecesState}}, onStateChange}}: ControlButtonItemProps<JigsawPTM>) => {
    const onStateChangeRef = useLastValueRef(onStateChange);
    const selectedCell = selectedCells.last();
    const selectedRegionIndex = selectedCell && getJigsawPieceIndexByCell(cellsIndex, selectedCell);
    useEffect(() => {
        if (selectedRegionIndex !== undefined) {
            onStateChangeRef.current(jigsawPieceBringOnTopAction(selectedRegionIndex, false));
        }
    }, [selectedRegionIndex, onStateChangeRef]);

    const activePieceIndex = getActiveJigsawPieceIndex(piecesState);

    useEventListener(window, "keydown", (ev) => {
        const {code, ctrlKey, metaKey, altKey, shiftKey} = ev;

        if (code === "Tab" && !ctrlKey && !metaKey && !altKey) {
            const pieces = getJigsawPiecesWithCache(cellsIndex);
            const sortedPieceCoords = piecesState
                .map(({top, left}, index) => {
                    const center = getRectCenter(pieces[index].boundingRect);
                    return {
                        index,
                        top: top + center.top,
                        left: left + center.left,
                    };
                })
                .sort((a, b) => Math.sign(a.top - b.top) || Math.sign(a.left - b.left) || (a.index - b.index));
            const newActivePieceIndex = incrementArrayItem(
                sortedPieceCoords,
                ({index}) => index === activePieceIndex,
                shiftKey ? -1 : 1
            ).index;
            onStateChange([
                jigsawPieceBringOnTopAction(newActivePieceIndex),
                selectedCells.size !== 0
                    ? {
                        // TODO: select the top-left-most cell according to the current angle
                        selectedCells: selectedCells.set(pieces[newActivePieceIndex].cells.slice(0, 1)),
                    }
                    : {},
            ]);

            ev.preventDefault();
        }
    });

    return null;
};

export const JigsawPieceHighlightHandlerControlButtonItem: ControlButtonItem<JigsawPTM> = {
    key: "jigsaw-piece-highlight",
    region: ControlButtonRegion.custom,
    Component: JigsawPieceHighlightHandler,
};
