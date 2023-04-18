import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PropsWithChildren} from "react";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {getPointsBoundingBox, getRectByBounds, getRectPoints} from "../../../types/layout/Rect";
import {getFieldRectTransform} from "./FieldRect";

export const FieldSvg = <T extends AnyPTM>({context, children}: PropsWithChildren<PuzzleContextProps<T>>) => {
    const {puzzle, cellSize} = context;
    let {
        fieldSize: {fieldSize, rowsCount, columnsCount},
        fieldMargin = 0,
        fieldFitsWrapper,
        ignoreRowsColumnCountInTheWrapper,
        loopHorizontally,
        loopVertically,
        typeManager: {getRegionsWithSameCoordsTransformation},
    } = puzzle;

    if (ignoreRowsColumnCountInTheWrapper) {
        rowsCount = fieldSize;
        columnsCount = fieldSize;
    }

    let viewBox = {
        left: -fieldMargin,
        top: -fieldMargin,
        width: columnsCount + 2 * fieldMargin,
        height: rowsCount + 2 * fieldMargin,
    };

    if (getRegionsWithSameCoordsTransformation) {
        viewBox = getPointsBoundingBox(
            ...getRectPoints(viewBox),
            ...getRegionsWithSameCoordsTransformation(context).flatMap((region) => {
                const {base, rightVector, bottomVector} = getFieldRectTransform(context, region);

                return [0, region.width].flatMap((right) => [0, region.height].map((bottom) => ({
                    top: base.top + right * rightVector.top + bottom * bottomVector.top,
                    left: base.left + right * rightVector.left + bottom * bottomVector.left,
                })));
            })
        );
    }

    const extraMargin = loopHorizontally || loopVertically ? fieldSize : 0.5;
    viewBox = getRectByBounds(
        {
            top: Math.floor(viewBox.top - extraMargin),
            left: Math.floor(viewBox.left - extraMargin),
        },
        {
            top: Math.ceil(viewBox.top + viewBox.height + extraMargin),
            left: Math.ceil(viewBox.left + viewBox.width + extraMargin),
        }
    );

    return <AutoSvg
        left={cellSize * (fieldMargin + (fieldSize - columnsCount) / 2 + viewBox.left)}
        top={cellSize * (fieldMargin + (fieldSize - rowsCount) / 2 + viewBox.top)}
        width={cellSize * viewBox.width}
        height={cellSize * viewBox.height}
        fitParent={fieldFitsWrapper}
        viewBox={fieldFitsWrapper ? undefined : viewBox}
    >
        {children}
    </AutoSvg>;
};
