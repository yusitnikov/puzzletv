import {ComponentType, createContext, memo, useContext} from "react";
import {FieldLayer} from "../types/sudoku/FieldLayer";

export const FieldLayerContext = createContext<FieldLayer>(FieldLayer.regular);

export const useFieldLayer = () => useContext(FieldLayerContext);

export const useIsFieldLayer = (expected: FieldLayer) => useFieldLayer() === expected || null;

export const withFieldLayer = <PropsT,>(expected: FieldLayer, component: ComponentType<PropsT>, useMemo = true): ComponentType<PropsT> => {
    const Component: ComponentType<PropsT> = useMemo
        ? memo(component) as any
        : component;

    return (props) => useIsFieldLayer(expected) && <Component {...props}/>;
};
