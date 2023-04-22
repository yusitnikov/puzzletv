import React, {ReactNode} from "react";
import {FieldRect} from "./FieldRect";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {GridRegion} from "../../../types/sudoku/GridRegion";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {regionHighlightColor} from "../../app/globals";

interface FieldRegionsWithSameCoordsTransformationProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    children: ReactNode | ((region?: GridRegion, index?: number) => ReactNode);
    regionNoClipChildren?: ReactNode | ((region?: GridRegion, index?: number) => ReactNode);
}

export const FieldRegionsWithSameCoordsTransformation = <T extends AnyPTM>(
    {
        context,
        children,
        regionNoClipChildren,
    }: FieldRegionsWithSameCoordsTransformationProps<T>
) => {
    const {
        puzzle: {
            typeManager: {getRegionsWithSameCoordsTransformation},
        },
    } = context;

    const regions = getRegionsWithSameCoordsTransformation?.(context);
    const regionsByZIndex: Record<number, {region: GridRegion, index: number}[]> = {};
    for (const [index, region] of (regions ?? []).entries()) {
        const {zIndex = -1} = region;
        regionsByZIndex[zIndex] = regionsByZIndex[zIndex] ?? [];
        regionsByZIndex[zIndex].push({region, index});
    }

    return <>
        {
            Object.entries(regionsByZIndex)
                .map(([zIndexStr, regions]) => ({regions, zIndex: Number(zIndexStr)}))
                .sort(
                    (
                        {zIndex},
                        {zIndex: zIndex2}
                    ) => zIndex - zIndex2
                )
                .flatMap(({zIndex, regions}) => [
                    ...regions.map(({region, index}) => <FieldRect
                        key={`region-no-clip-${index}`}
                        context={context}
                        {...region}
                    >
                        <AutoSvg
                            left={-region.left}
                            top={-region.top}
                            width={1}
                            height={1}
                            style={{opacity: region.opacity}}
                        >
                            {typeof regionNoClipChildren === "function" ? regionNoClipChildren(region, index) : regionNoClipChildren}
                        </AutoSvg>
                    </FieldRect>),
                    ...regions.map(({region, index}) => region.highlighted && <FieldRect
                        key={`region-highlight-${index}`}
                        context={context}
                        {...region}
                    >
                        <AutoSvg
                            left={-region.left}
                            top={-region.top}
                            width={1}
                            height={1}
                            style={{opacity: region.opacity}}
                        >
                            {region.cells?.map(({top, left}) => <rect
                                key={`cell-${top}-${left}`}
                                x={left}
                                y={top}
                                width={1}
                                height={1}
                                fill={"none"}
                                stroke={regionHighlightColor}
                                strokeWidth={0.2}
                            />)}
                        </AutoSvg>
                    </FieldRect>),
                    ...regions.map(({region, index}) => <FieldRect
                        key={`region-clip-${index}`}
                        context={context}
                        clip={!region.noClip}
                        {...region}
                    >
                        <AutoSvg
                            left={-region.left}
                            top={-region.top}
                            width={1}
                            height={1}
                            style={{opacity: region.opacity}}
                        >
                            {typeof children === "function" ? children(region, index) : children}
                        </AutoSvg>
                    </FieldRect>),
                ])
        }

        {!regions && <FieldRect
            context={context}
            top={0}
            left={0}
        >
            {typeof regionNoClipChildren === "function" ? regionNoClipChildren() : regionNoClipChildren}
            {typeof children === "function" ? children() : children}
        </FieldRect>}
    </>;
};
