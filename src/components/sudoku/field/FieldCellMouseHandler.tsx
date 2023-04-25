import {Position} from "../../../types/layout/Position";
import {Rect} from "../../../types/layout/Rect";
import {globalPaddingCoeff} from "../../app/globals";
import {indexes} from "../../../utils/indexes";
import {PuzzleContext} from "../../../types/sudoku/PuzzleContext";
import {FieldCellShape} from "./FieldCellShape";
import {CellExactPosition} from "../../../types/sudoku/CellExactPosition";
import {CellPart} from "../../../types/sudoku/CellPart";
import {mergeEventHandlerProps} from "../../../utils/mergeEventHandlerProps";
import {cancelOutsideClickProps, GestureHandler, getGestureHandlerProps} from "../../../utils/gestures";
import {CellGestureExtraData, cellGestureExtraDataTag} from "../../../types/sudoku/CellGestureExtraData";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

const borderPaddingCoeff = Math.max(0.25, globalPaddingCoeff);

export interface FieldCellMouseHandlerProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    cellPosition: Position;
    regionIndex?: number;
    handlers: GestureHandler<any>[];
}

export const FieldCellMouseHandler = <T extends AnyPTM>(
    {
        context,
        cellPosition,
        regionIndex,
        handlers,
    }: FieldCellMouseHandlerProps<T>
) => {
    const {cellsIndex, state} = context;

    const {processed: {cellWriteModeInfo}} = state;

    const {
        onCornerClick,
        onCornerEnter,
        disableCellHandlers,
    } = cellsIndex.getCellTypeProps(cellPosition).forceCellWriteMode ?? cellWriteModeInfo;

    if (disableCellHandlers) {
        return null;
    }

    const {areCustomBounds, center, borderSegments} = cellsIndex.allCells[cellPosition.top][cellPosition.left];

    const centerExactPosition: CellExactPosition = {
        center,
        corner: cellPosition,
        round: center,
        type: CellPart.center,
    };

    return <>
        {(onCornerClick || onCornerEnter) && <>
            {!areCustomBounds && indexes(4).flatMap(topOffset => indexes(4).map(leftOffset => {
                const isTopCenter = [1, 2].includes(topOffset);
                const isLeftCenter = [1, 2].includes(leftOffset);

                const exactPosition: CellExactPosition = {
                    center,
                    corner: {
                        left: cellPosition.left + (leftOffset >> 1),
                        top: cellPosition.top + (topOffset >> 1),
                    },
                    round: {
                        left: cellPosition.left + (isLeftCenter ? 0.5 : (leftOffset ? 1 : 0)),
                        top: cellPosition.top + (isTopCenter ? 0.5 : (topOffset ? 1 : 0)),
                    },
                    type: isTopCenter && isLeftCenter ? CellPart.center : (!isTopCenter && !isLeftCenter ? CellPart.corner : CellPart.border),
                };

                return <MouseHandlerRect
                    key={`draw-corner-${topOffset}-${leftOffset}`}
                    context={context}
                    cellPosition={cellPosition}
                    cellExactPosition={exactPosition}
                    regionIndex={regionIndex}
                    handlers={handlers}
                    left={leftOffset * 0.25}
                    top={topOffset * 0.25}
                    width={0.25}
                    height={0.25}
                />;
            }))}

            {areCustomBounds && <>
                <MouseHandlerRect
                    key={"draw-center"}
                    context={context}
                    cellPosition={cellPosition}
                    cellExactPosition={centerExactPosition}
                    regionIndex={regionIndex}
                    handlers={handlers}
                />

                {Object.entries(borderSegments).map(([key, {line, center: borderCenter}]) => {
                    const exactPosition: CellExactPosition = {
                        center,
                        corner: cellPosition,
                        round: borderCenter,
                        type: CellPart.border,
                    };

                    return <MouseHandlerRect
                        key={`draw-border-${key}`}
                        context={context}
                        cellPosition={cellPosition}
                        cellExactPosition={exactPosition}
                        regionIndex={regionIndex}
                        line={line}
                        handlers={handlers}
                    />
                })}
            </>}
        </>}

        {!(onCornerClick || onCornerEnter) && <>
            <MouseHandlerRect
                key={"cell-selection"}
                context={context}
                cellPosition={cellPosition}
                cellExactPosition={centerExactPosition}
                regionIndex={regionIndex}
                handlers={handlers}
            />

            {!areCustomBounds && indexes(2).flatMap(topOffset => indexes(2).map(leftOffset => {
                return <MouseHandlerRect
                    key={`no-interaction-corner-${topOffset}-${leftOffset}`}
                    context={context}
                    cellPosition={cellPosition}
                    cellExactPosition={centerExactPosition}
                    regionIndex={regionIndex}
                    left={leftOffset * (1 - borderPaddingCoeff)}
                    top={topOffset * (1 - borderPaddingCoeff)}
                    width={borderPaddingCoeff}
                    height={borderPaddingCoeff}
                    handlers={handlers}
                    skipEnter={true}
                />;
            }))}
        </>}
    </>;
};

interface MouseHandlerRectProps<T extends AnyPTM> extends Partial<Rect> {
    context: PuzzleContext<T>;
    cellPosition: Position;
    cellExactPosition: CellExactPosition;
    regionIndex?: number;
    line?: Position[];
    handlers: GestureHandler<any>[];
    skipEnter?: boolean;
}

const MouseHandlerRect = <T extends AnyPTM>(
    {
        context, cellPosition, cellExactPosition, regionIndex, line, handlers, skipEnter, ...rect
    }: MouseHandlerRectProps<T>
) => <FieldCellShape
    context={context}
    cellPosition={cellPosition}
    line={line}
    style={{
        cursor: "pointer",
        pointerEvents: "all",
    }}
    {...mergeEventHandlerProps(
        // Make sure that clicking on the grid won't be recognized as an outside click
        cancelOutsideClickProps,
        // Make sure that clicking on the grid won't try to drag
        {
            onMouseDown: (ev) => ev.preventDefault(),
        },
        getGestureHandlerProps(handlers, (): CellGestureExtraData => ({
            tags: [cellGestureExtraDataTag],
            cell: cellPosition,
            exact: cellExactPosition,
            regionIndex,
            skipEnter,
        })),
    )}
    {...rect}
/>;
