import {createContext, useContext} from "react";
import {Rect} from "../types/layout/Rect";

export const PuzzleContainerContext = createContext<Rect | undefined>(undefined);

export const usePuzzleContainer = () => useContext(PuzzleContainerContext);
