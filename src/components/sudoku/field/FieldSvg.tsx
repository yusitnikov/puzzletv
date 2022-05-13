import {svgShadowStyle} from "../../app/globals";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {indexesFromTo} from "../../../utils/indexes";
import {ReactNode} from "react";
import {Position} from "../../../types/layout/Position";
import {PuzzleContextProps} from "../../../types/sudoku/PuzzleContext";

export interface FieldSvgProps extends PuzzleContextProps<any, any, any> {
    useShadow?: boolean;
    children: ReactNode | ((offset: Position) => ReactNode);
}

export const FieldSvg = ({context: {puzzle, cellSize}, useShadow = true, children}: FieldSvgProps) => {
    const {
        fieldSize: {fieldSize, rowsCount, columnsCount},
        fieldMargin: initialFieldMargin = 0,
        fieldFitsWrapper,
        loopHorizontally,
        loopVertically,
    } = puzzle;

    const extraMargin = fieldSize;

    const fieldMargin = initialFieldMargin + extraMargin;

    const totalWidth = fieldSize + 2 * fieldMargin;

    return <AutoSvg
        left={-cellSize * extraMargin}
        top={-cellSize * extraMargin}
        width={cellSize * totalWidth}
        height={cellSize * totalWidth}
        fitParent={fieldFitsWrapper}
        viewBox={fieldFitsWrapper ? undefined : `${(columnsCount - fieldSize) / 2 - fieldMargin} ${(rowsCount - fieldSize) / 2 - fieldMargin} ${totalWidth} ${totalWidth}`}
        style={useShadow ? svgShadowStyle : undefined}
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
