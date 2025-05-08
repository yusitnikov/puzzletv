import React, { ReactElement, ReactNode } from "react";
import { GridRect } from "./GridRect";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { GridRegion } from "../../../types/puzzle/GridRegion";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { regionHighlightColor } from "../../app/globals";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

interface GridRegionsWithSameCoordsTransformationProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    children: ReactNode | ((region?: GridRegion, index?: number) => ReactNode);
    regionNoClipChildren?: ReactNode | ((region?: GridRegion, index?: number) => ReactNode);
}

/**
 * Render transformed regions returned from `PuzzleTypeManager.getRegionsWithSameCoordsTransformation()`.
 */
export const GridRegionsWithSameCoordsTransformation = observer(function GridRegionsWithSameCoordsTransformationFn<
    T extends AnyPTM,
>({ context, children, regionNoClipChildren }: GridRegionsWithSameCoordsTransformationProps<T>) {
    profiler.trace();

    const { regions } = context;

    const regionsByZIndex: Record<number, { region: GridRegion; index: number }[]> = {};
    for (const [index, region] of (regions ?? []).entries()) {
        const { zIndex = -1 } = region;
        regionsByZIndex[zIndex] = regionsByZIndex[zIndex] ?? [];
        regionsByZIndex[zIndex].push({ region, index });
    }

    return (
        <>
            {Object.entries(regionsByZIndex)
                .map(([zIndexStr, regions]) => ({ regions, zIndex: Number(zIndexStr) }))
                .sort(({ zIndex }, { zIndex: zIndex2 }) => zIndex - zIndex2)
                .flatMap(({ regions }) => [
                    ...regions.map(({ region, index }) => (
                        <GridRect key={`region-no-clip-${index}`} context={context} {...region}>
                            <AutoSvg
                                left={-region.left}
                                top={-region.top}
                                width={1}
                                height={1}
                                style={{ opacity: region.opacity }}
                            >
                                {typeof regionNoClipChildren === "function"
                                    ? regionNoClipChildren(region, index)
                                    : regionNoClipChildren}
                            </AutoSvg>
                        </GridRect>
                    )),
                    ...regions.map(
                        ({ region, index }) =>
                            region.highlighted && (
                                <GridRect key={`region-highlight-${index}`} context={context} {...region}>
                                    <AutoSvg
                                        left={-region.left}
                                        top={-region.top}
                                        width={1}
                                        height={1}
                                        style={{ opacity: region.opacity }}
                                    >
                                        {region.cells?.map(({ top, left }) => (
                                            <rect
                                                key={`cell-${top}-${left}`}
                                                x={left}
                                                y={top}
                                                width={1}
                                                height={1}
                                                fill={"none"}
                                                stroke={regionHighlightColor}
                                                strokeWidth={0.2}
                                            />
                                        ))}
                                    </AutoSvg>
                                </GridRect>
                            ),
                    ),
                    ...regions.map(({ region, index }) => (
                        <GridRect key={`region-clip-${index}`} context={context} clip={!region.noClip} {...region}>
                            <AutoSvg
                                left={-region.left}
                                top={-region.top}
                                width={1}
                                height={1}
                                style={{ opacity: region.opacity }}
                            >
                                {typeof children === "function" ? children(region, index) : children}
                            </AutoSvg>
                        </GridRect>
                    )),
                ])}

            {!regions && (
                <GridRect context={context} top={0} left={0}>
                    {typeof regionNoClipChildren === "function" ? regionNoClipChildren() : regionNoClipChildren}
                    {typeof children === "function" ? children() : children}
                </GridRect>
            )}
        </>
    );
}) as <T extends AnyPTM>(props: GridRegionsWithSameCoordsTransformationProps<T>) => ReactElement;
