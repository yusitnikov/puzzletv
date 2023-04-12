import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {indexesFromTo} from "../../../utils/indexes";
import {ReactNode} from "react";
import {Position} from "../../../types/layout/Position";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";

export interface FieldLoopProps extends PuzzleContextProps<any, any, any> {
    children: ReactNode | ((offset: Position) => ReactNode);
}

export const FieldLoop = ({context: {puzzle}, children}: FieldLoopProps) => {
    let {
        fieldSize: {fieldSize, rowsCount, columnsCount},
        ignoreRowsColumnCountInTheWrapper,
        loopHorizontally,
        loopVertically,
    } = puzzle;

    if (ignoreRowsColumnCountInTheWrapper) {
        rowsCount = fieldSize;
        columnsCount = fieldSize;
    }

    return <>
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
    </>;
};
