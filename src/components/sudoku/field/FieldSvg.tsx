import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {PropsWithChildren} from "react";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";

export const FieldSvg = ({context: {puzzle, cellSize}, children}: PropsWithChildren<PuzzleContextProps<any, any, any>>) => {
    let {
        fieldSize: {fieldSize, rowsCount, columnsCount},
        fieldMargin: initialFieldMargin = 0,
        fieldFitsWrapper,
        ignoreRowsColumnCountInTheWrapper,
    } = puzzle;

    if (ignoreRowsColumnCountInTheWrapper) {
        rowsCount = fieldSize;
        columnsCount = fieldSize;
    }

    const extraMargin = fieldSize;

    const fieldMargin = initialFieldMargin + extraMargin;

    const totalWidth = fieldSize + 2 * fieldMargin;

    return <AutoSvg
        left={-cellSize * extraMargin}
        top={-cellSize * extraMargin}
        width={cellSize * totalWidth}
        height={cellSize * totalWidth}
        fitParent={fieldFitsWrapper}
        viewBox={fieldFitsWrapper ? undefined : {
            left: (columnsCount - fieldSize) / 2 - fieldMargin,
            top: (rowsCount - fieldSize) / 2 - fieldMargin,
            width: totalWidth,
            height: totalWidth,
        }}
    >
        {children}
    </AutoSvg>;
};
