import {createContext, useContext} from "react";
import {Rect} from "../types/layout/Rect";
import {headerHeight} from "../components/app/globals";

export const PuzzleContainerContext = createContext<Rect | undefined>(undefined);

export const usePuzzleContainer = (absolute = false): Rect | undefined => {
    const rect = useContext(PuzzleContainerContext);

    return rect && absolute
        ? {
            ...rect,
            top: rect.top + headerHeight,
        }
        : rect;
};
