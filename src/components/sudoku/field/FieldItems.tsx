import { Rect, transformRect } from "../../../types/layout/Rect";
import { emptyPosition } from "../../../types/layout/Position";
import { PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { TransformedRectGraphics } from "../../../contexts/TransformContext";
import { FieldLoop } from "./FieldLoop";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { FieldLayer } from "../../../types/sudoku/FieldLayer";
import { doesGridRegionContainCell, GridRegion } from "../../../types/sudoku/GridRegion";
import { SingleCellFieldItemPositionFix } from "./SingleCellFieldItemPositionFix";
import { ReactElement } from "react";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface FieldItemsProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    layer: FieldLayer;
    region?: GridRegion;
    regionIndex?: number;
}

export const FieldItems = observer(function FieldItems<T extends AnyPTM>(props: FieldItemsProps<T>) {
    profiler.trace();

    return (
        <FieldLoop context={props.context}>
            <FieldItemsInner {...props} />
        </FieldLoop>
    );
}) as <T extends AnyPTM>(props: FieldItemsProps<T>) => ReactElement;

const FieldItemsInner = observer(function FieldItemsInner<T extends AnyPTM>({
    context,
    layer,
    region,
    regionIndex,
}: FieldItemsProps<T>) {
    profiler.trace();

    return (
        <>
            {context
                .getVisibleItemsForLayer(layer)
                .map(({ component, cells, renderSingleCellInUserArea, ...otherData }, index) => {
                    const Component = component![layer]!;

                    if (
                        region &&
                        layer !== FieldLayer.noClip &&
                        (!context.puzzle.customCellBounds || region.cells) &&
                        cells.length &&
                        cells.every(({ top, left }) => top % 1 === 0 && left % 1 === 0) &&
                        !cells.some((cell) => doesGridRegionContainCell(region, cell))
                    ) {
                        return null;
                    }

                    if (renderSingleCellInUserArea && cells.length === 1) {
                        const position = cells[0];

                        if (position.top % 1 === 0 && position.left % 1 === 0) {
                            return (
                                <SingleCellFieldItemPositionFix
                                    key={index}
                                    context={context}
                                    position={position}
                                    region={region}
                                >
                                    <Component
                                        context={context.readOnlySafeContext}
                                        region={region}
                                        regionIndex={regionIndex}
                                        cells={[emptyPosition]}
                                        {...otherData}
                                    />
                                </SingleCellFieldItemPositionFix>
                            );
                        }
                    }

                    if (renderSingleCellInUserArea && cells.length === 2) {
                        const [cell1, cell2] = cells.map(({ top, left }) => {
                            const cellInfo = context.puzzleIndex.allCells[top]?.[left];
                            return cellInfo
                                ? { ...cellInfo.center, radius: cellInfo.bounds.userArea.width / 2 }
                                : { left: left + 0.5, top: top + 0.5, radius: 0.5 };
                        });
                        const centerPoint = {
                            top: (cell1.top * cell2.radius + cell2.top * cell1.radius) / (cell1.radius + cell2.radius),
                            left:
                                (cell1.left * cell2.radius + cell2.left * cell1.radius) / (cell1.radius + cell2.radius),
                            radius: (cell1.radius + cell2.radius) / 2,
                        };
                        const centerRect: Rect = {
                            top: centerPoint.top - centerPoint.radius,
                            left: centerPoint.left - centerPoint.radius,
                            width: centerPoint.radius * 2,
                            height: centerPoint.radius * 2,
                        };
                        return (
                            <TransformedRectGraphics key={index} rect={transformRect(centerRect)}>
                                <Component
                                    context={context.readOnlySafeContext}
                                    region={region}
                                    regionIndex={regionIndex}
                                    cells={[emptyPosition, emptyPosition]}
                                    {...otherData}
                                />
                            </TransformedRectGraphics>
                        );
                    }

                    return (
                        <Component
                            key={index}
                            context={context.readOnlySafeContext}
                            region={region}
                            regionIndex={regionIndex}
                            cells={cells}
                            {...otherData}
                        />
                    );
                })}
        </>
    );
}) as <T extends AnyPTM>(props: FieldItemsProps<T>) => ReactElement;
