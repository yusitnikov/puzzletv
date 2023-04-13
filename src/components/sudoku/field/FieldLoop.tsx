import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {indexesFromTo} from "../../../utils/indexes";
import {ReactNode} from "react";
import {Position} from "../../../types/layout/Position";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";
import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";

export interface FieldLoopProps<T extends AnyPTM> extends PuzzleContextProps<T> {
    children: ReactNode | ((offset: Position) => ReactNode);
}

export const FieldLoop = <T extends AnyPTM>({context: {puzzle}, children}: FieldLoopProps<T>) => {
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
