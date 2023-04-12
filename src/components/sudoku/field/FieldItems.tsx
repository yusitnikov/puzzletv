import {Rect, transformRect} from "../../../types/layout/Rect";
import {emptyPosition} from "../../../types/layout/Position";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {Constraint} from "../../../types/sudoku/Constraint";
import {HashSet} from "../../../types/struct/Set";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FieldCellUserArea} from "./FieldCellUserArea";
import {TransformedRectGraphics} from "../../../contexts/TransformScaleContext";

export interface FieldItemsProps<CellType, ExType = {}, ProcessedExType = {}> {
    context: PuzzleContext<CellType, ExType, ProcessedExType>;
    items: Constraint<CellType, any, ExType, ProcessedExType>[];
}

export const FieldItems = <CellType, ExType = {}, ProcessedExType = {}>(
    {context, items}: FieldItemsProps<CellType, ExType, ProcessedExType>
) => <>
    {items.map(({component: Component, cells, renderSingleCellInUserArea, ...otherData}, index) => {
        if (!Component) {
            return null;
        }

        if (renderSingleCellInUserArea && cells.length === 1) {
            const position = cells[0];

            if (position.top % 1 === 0 && position.left % 1 === 0) {
                const processedPosition = context.puzzle.typeManager.processCellDataPosition?.(
                    context.puzzle,
                    {...position, angle: 0},
                    new HashSet<CellType>(),
                    0,
                    () => undefined,
                    position,
                    context.state
                );

                return <AutoSvg key={index} {...(context.puzzle.customCellBounds ? {} : position)}>
                    <FieldCellUserArea context={context} cellPosition={position}>
                        <AutoSvg top={0.5} left={0.5} angle={processedPosition?.angle}>
                            <AutoSvg top={-0.5} left={-0.5}>
                                <Component
                                    context={context}
                                    cells={[emptyPosition]}
                                    {...otherData}
                                />
                            </AutoSvg>
                        </AutoSvg>
                    </FieldCellUserArea>
                </AutoSvg>;
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
                top: (cell1.top + cell2.top) / 2,
                left: (cell1.left + cell2.left) / 2,
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
                    cells={[emptyPosition, emptyPosition]}
                    {...otherData}
                />
            </TransformedRectGraphics>
        }

        return <Component
            key={index}
            context={context}
            cells={cells}
            {...otherData}
        />;
    })}
</>;
