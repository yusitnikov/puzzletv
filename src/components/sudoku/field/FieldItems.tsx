import {Rect, transformRect} from "../../../types/layout/Rect";
import {emptyPosition} from "../../../types/layout/Position";
import {Constraint} from "../../../types/sudoku/Constraint";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {TransformedRectGraphics} from "../../../contexts/TransformContext";
import {FieldLoop} from "./FieldLoop";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {doesGridRegionContainCell, GridRegion} from "../../../types/sudoku/GridRegion";
import {SingleCellFieldItemPositionFix} from "./SingleCellFieldItemPositionFix";

export interface FieldItemsProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    items: Constraint<T, any>[];
    layer: FieldLayer;
    region?: GridRegion;
    regionIndex?: number;
}

export const FieldItems = <T extends AnyPTM>(
    {context, items, layer, region, regionIndex}: FieldItemsProps<T>
) => <FieldLoop context={context}>
    {items.map(({component: {[layer]: Component} = {}, cells, renderSingleCellInUserArea, ...otherData}, index) => {
        if (!Component) {
            return null;
        }

        if (
            region &&
            layer !== FieldLayer.noClip &&
            (!context.puzzle.customCellBounds || region.cells) &&
            cells.length &&
            cells.every(({top, left}) => top % 1 === 0 && left % 1 === 0) &&
            !cells.some((cell) => doesGridRegionContainCell(region, cell))
        ) {
            return null;
        }

        if (renderSingleCellInUserArea && cells.length === 1) {
            const position = cells[0];

            if (position.top % 1 === 0 && position.left % 1 === 0) {
                return <SingleCellFieldItemPositionFix
                    key={index}
                    context={context}
                    position={position}
                    region={region}
                >
                    <Component
                        context={context}
                        region={region}
                        regionIndex={regionIndex}
                        cells={[emptyPosition]}
                        {...otherData}
                    />
                </SingleCellFieldItemPositionFix>;
            }
        }

        if (renderSingleCellInUserArea && cells.length === 2) {
            const [cell1, cell2] = cells.map(({top, left}) => {
                const cellInfo = context.cellsIndex.allCells[top]?.[left];
                return cellInfo
                    ? {...cellInfo.center, radius: cellInfo.bounds.userArea.width / 2}
                    : {left: left + 0.5, top: top + 0.5, radius: 0.5};
            });
            const centerPoint = {
                top: (cell1.top * cell2.radius + cell2.top * cell1.radius) / (cell1.radius + cell2.radius),
                left: (cell1.left * cell2.radius + cell2.left * cell1.radius) / (cell1.radius + cell2.radius),
                radius: (cell1.radius + cell2.radius) / 2,
            };
            const centerRect: Rect = {
                top: centerPoint.top - centerPoint.radius,
                left: centerPoint.left - centerPoint.radius,
                width: centerPoint.radius * 2,
                height: centerPoint.radius * 2,
            };
            return <TransformedRectGraphics key={index} rect={transformRect(centerRect)}>
                <Component
                    context={context}
                    region={region}
                    regionIndex={regionIndex}
                    cells={[emptyPosition, emptyPosition]}
                    {...otherData}
                />
            </TransformedRectGraphics>
        }

        return <Component
            key={index}
            context={context}
            region={region}
            regionIndex={regionIndex}
            cells={cells}
            {...otherData}
        />;
    })}
</FieldLoop>;
