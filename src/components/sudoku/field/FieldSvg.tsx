import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {indexesFromTo} from "../../../utils/indexes";
import {ReactNode} from "react";
import {Position} from "../../../types/layout/Position";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";

export interface FieldSvgProps extends PuzzleContextProps<any, any, any> {
    children: ReactNode | ((offset: Position) => ReactNode);
}

export const FieldSvg = ({context: {puzzle, cellSize}, children}: FieldSvgProps) => {
    let {
        fieldSize: {fieldSize, rowsCount, columnsCount},
        fieldMargin: initialFieldMargin = 0,
        fieldFitsWrapper,
        ignoreRowsColumnCountInTheWrapper,
        loopHorizontally,
        loopVertically,
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
        {indexesFromTo(loopVertically ? -1 : 0, loopVertically ? 1 : 0, true).flatMap(
            topOffset => indexesFromTo(loopHorizontally ? -1 : 0, loopHorizontally ? 1 : 0, true).map(
                leftOffset => <AutoSvg
                    key={`${topOffset}-${leftOffset}`}
                    left={leftOffset * columnsCount}
                    top={topOffset * rowsCount}
                >
                    {
                        typeof children === "function"
                            ? children({
                                left: leftOffset * columnsCount,
                                top: topOffset * rowsCount
                            })
                            : children
                    }
                </AutoSvg>
            )
        )}
    </AutoSvg>;
};
