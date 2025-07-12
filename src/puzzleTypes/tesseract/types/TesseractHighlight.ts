import { useCallback, useState } from "react";
import { loadStringFromLocalStorage, saveStringToLocalStorage } from "../../../utils/localStorage";
import { isSamePosition, Position } from "../../../types/layout/Position";
import { CellHighlightColor } from "../../../components/puzzle/cell/CellHighlight";
import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

export enum TesseractHighlightType {
    Always = "always",
    Clues = "clues",
    Never = "never",
}

const localStorageKey = "tesseractHighlight";

const getTesseractHighlightType = () =>
    loadStringFromLocalStorage<TesseractHighlightType>(localStorageKey, TesseractHighlightType.Clues);

export const useTesseractHighlightType = (): [TesseractHighlightType, (type: TesseractHighlightType) => void] => {
    const [type, setType] = useState<TesseractHighlightType>(getTesseractHighlightType);

    const handleSetType = useCallback(
        (type: TesseractHighlightType) => {
            setType(type);
            saveStringToLocalStorage(localStorageKey, type);
        },
        [setType],
    );

    return [type, handleSetType];
};

export const getTesseractCellHighlight = <T extends AnyPTM>(
    cell: Position,
    context: PuzzleContext<T>,
): ReturnType<Required<PuzzleTypeManager<T>>["getCellHighlight"]> => {
    if (context.selectedCellsCount !== 1) {
        return undefined;
    }
    const selectedCell = context.firstSelectedCell!;

    switch (getTesseractHighlightType()) {
        case TesseractHighlightType.Never:
            return undefined;
        case TesseractHighlightType.Clues:
            if (
                !context.allItems.some(
                    ({ name, cells }) => name === "ellipse" && isSamePosition(cells[0], selectedCell),
                )
            ) {
                return undefined;
            }
            break;
    }

    const getTesseractsCoords = ({ top, left }: Position) => [
        top % 3,
        left % 3,
        Math.floor(top / 3),
        Math.floor(left / 3),
    ];

    const cell4D = getTesseractsCoords(cell);
    const selected4D = getTesseractsCoords(selectedCell);

    if (cell4D.some((value, index) => Math.abs(value - selected4D[index]) > 1)) {
        return undefined;
    }

    return {
        color: CellHighlightColor.secondary,
        strokeWidth: 1,
    };
};
