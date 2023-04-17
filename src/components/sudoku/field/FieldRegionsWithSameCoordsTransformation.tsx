import React, {Fragment, ReactNode} from "react";
import {FieldRect} from "./FieldRect";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {GridRegion} from "../../../types/sudoku/GridRegion";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

interface FieldRegionsWithSameCoordsTransformationProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    children: ReactNode | ((region?: GridRegion, index?: number) => ReactNode);
}

export const FieldRegionsWithSameCoordsTransformation = <T extends AnyPTM>(
    {
        context,
        children,
    }: FieldRegionsWithSameCoordsTransformationProps<T>
) => {
    const {
        puzzle: {
            typeManager: {getRegionsWithSameCoordsTransformation},
        },
    } = context;

    const regionsWithSameCoordsTransformation = getRegionsWithSameCoordsTransformation?.(context);

    return <>
        {
            (regionsWithSameCoordsTransformation ?? [])
                .map((region, index) => ({region, index}))
                .sort(
                    (
                        {region: {zIndex = -1}, index},
                        {region: {zIndex: zIndex2 = -1}, index: index2}
                    ) => (zIndex - zIndex2) || (index - index2)
                )
                .map(({region, index}) => <Fragment key={`items-region-${index}`}>
                    {region.highlighted && <FieldRect
                        context={context}
                        {...region}
                    >
                        <AutoSvg
                            left={-region.left}
                            top={-region.top}
                            width={1}
                            height={1}
                        >
                            {region.cells?.map(({top, left}) => <rect
                                key={`cell-${top}-${left}`}
                                x={left}
                                y={top}
                                width={1}
                                height={1}
                                fill={"none"}
                                stroke={"#fe4"}
                                strokeWidth={0.2}
                            />)}
                        </AutoSvg>
                    </FieldRect>}

                    <FieldRect
                        context={context}
                        clip={!region.noClip}
                        {...region}
                    >
                        <AutoSvg
                            left={-region.left}
                            top={-region.top}
                            width={1}
                            height={1}
                        >
                            {typeof children === "function" ? children(region, index) : children}
                        </AutoSvg>
                    </FieldRect>
                </Fragment>)
        }

        {!regionsWithSameCoordsTransformation && <FieldRect
            context={context}
            top={0}
            left={0}
        >
            {typeof children === "function" ? children() : children}
        </FieldRect>}
    </>;
};
