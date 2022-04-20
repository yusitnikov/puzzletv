import {createContext, useContext} from "react";
import {FieldLayer} from "../types/sudoku/FieldLayer";

export const FieldLayerContext = createContext<FieldLayer>(FieldLayer.regular);

export const useFieldLayer = () => useContext(FieldLayerContext);

export const useIsFieldLayer = (expected: FieldLayer) => useFieldLayer() === expected || null;
