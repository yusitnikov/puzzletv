import { useCallback, useState } from "react";
import { loadStringFromLocalStorage, saveStringToLocalStorage } from "../../../utils/localStorage";
import { isSamePosition, Position } from "../../../types/layout/Position";
import { CellSelectionColor } from "../../../components/puzzle/cell/CellSelection";
import { PuzzleTypeManager } from "../../../types/puzzle/PuzzleTypeManager";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

export enum TesseractSelectionType {
    Always = "always",
    Clues = "clues",
    Never = "never",
}

const localStorageKey = "tesseractSelection";

const getTesseractSelectionType = () =>
    loadStringFromLocalStorage<TesseractSelectionType>(localStorageKey, TesseractSelectionType.Clues);

export const useTesseractSelectionType = (): [TesseractSelectionType, (type: TesseractSelectionType) => void] => {
    const [type, setType] = useState<TesseractSelectionType>(getTesseractSelectionType);

    const handleSetType = useCallback(
        (type: TesseractSelectionType) => {
            setType(type);
            saveStringToLocalStorage(localStorageKey, type);
        },
        [setType],
    );

    return [type, handleSetType];
};

export const getTesseractCellSelectionType = <T extends AnyPTM>(
    cell: Position,
    context: PuzzleContext<T>,
): ReturnType<Required<PuzzleTypeManager<T>>["getCellSelectionType"]> => {
    if (context.selectedCellsCount !== 1) {
        return undefined;
    }
    const selectedCell = context.firstSelectedCell!;

    switch (getTesseractSelectionType()) {
        case TesseractSelectionType.Never:
            return undefined;
        case TesseractSelectionType.Clues:
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
        color: CellSelectionColor.secondary,
        strokeWidth: 1,
    };
};
