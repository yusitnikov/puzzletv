import {memo} from "react";
import {getRegionBorderWidth} from "../../../app/globals";
import {useFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {gameStateGetCurrentFieldState} from "../../../../types/sudoku/GameState";
import {getLineVector, Position} from "../../../../types/layout/Position";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {CellMark} from "../../../../types/sudoku/CellMark";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";

const regularBorderColor = "#080";
const removingBorderColor = "#e00";

export const UserLines = memo(({context}: ConstraintProps) => {
    const layer = useFieldLayer();

    const {
        cellSize,
        puzzle: {
            fieldSize: {
                rowsCount,
                columnsCount,
            },
            loopHorizontally,
            loopVertically,
        },
        state,
    } = context;

    const {currentMultiLine, isAddingLine} = state;

    const {lines, marks} = gameStateGetCurrentFieldState(state);

    const borderWidth = getRegionBorderWidth(cellSize) * 1.5;

    return <>
        {layer === FieldLayer.givenUserLines && lines.items.map((line, index) => {
            const vector = getLineVector(line);

            let {start: {left, top}} = line;
            if (loopVertically) {
                top = ((top % rowsCount) + rowsCount) % rowsCount;
            }
            if (loopHorizontally) {
                left = ((left % columnsCount) + columnsCount) % columnsCount;
            }

            return <RoundedPolyLine
                key={`existing-line-${index}`}
                points={[{left, top}, {left: left + vector.left, top: top + vector.top}]}
                stroke={regularBorderColor}
                strokeWidth={borderWidth}
            />;
        })}

        {layer === FieldLayer.givenUserLines && marks.items.map((mark, index) => <UserMarkByData
            key={`mark-${index}`}
            context={context}
            cellSize={cellSize}
            {...mark}
        />)}

        {layer === FieldLayer.newUserLines && <UserLinesByData
            key={"new-line"}
            cellSize={cellSize}
            currentMultiLine={currentMultiLine}
            isAdding={isAddingLine}
        />}
    </>;
});

export interface UserMarkByDataProps extends CellMark {
    context?: PuzzleContext<any, any, any>;
    cellSize: number;
}

export const UserMarkByData = (
    {
        context,
        cellSize,
        position: {top, left},
        isCircle,
    }: UserMarkByDataProps
) => {
    const borderWidth = getRegionBorderWidth(cellSize) * 1.5;

    if (context) {
        const {
            puzzle: {
                fieldSize: {
                    rowsCount,
                    columnsCount,
                },
                loopHorizontally,
                loopVertically,
            },
        } = context;

        if (loopVertically) {
            top = ((top % rowsCount) + rowsCount) % rowsCount;
        }

        if (loopHorizontally) {
            left = ((left % columnsCount) + columnsCount) % columnsCount;
        }
    }

    const isCenter = left % 1 !== 0 && top % 1 !== 0;
    const radius = isCenter ? 0.3 : 0.15;
    const lineWidth = isCenter ? borderWidth : borderWidth / 2;

    return <AutoSvg
        top={top}
        left={left}
        stroke={regularBorderColor}
        strokeWidth={borderWidth}
    >
        {isCircle && <circle
            cx={0}
            cy={0}
            r={radius}
            stroke={regularBorderColor}
            strokeWidth={lineWidth}
            fill={"none"}
        />}

        {!isCircle && <>
            <line
                x1={-radius}
                y1={-radius}
                x2={radius}
                y2={radius}
                stroke={regularBorderColor}
                strokeWidth={lineWidth}
            />

            <line
                x1={radius}
                y1={-radius}
                x2={-radius}
                y2={radius}
                stroke={regularBorderColor}
                strokeWidth={lineWidth}
            />
        </>}
    </AutoSvg>;
};

export interface UserLinesByDataProps {
    cellSize: number;
    currentMultiLine: Position[];
    isAdding?: boolean;
}

export const UserLinesByData = ({cellSize, currentMultiLine, isAdding = true}: UserLinesByDataProps) => {
    const borderWidth = getRegionBorderWidth(cellSize) * 2;

    return <>
        {currentMultiLine.length > 1 && <RoundedPolyLine
            key={"current"}
            points={currentMultiLine}
            stroke={isAdding ? regularBorderColor : removingBorderColor}
            strokeWidth={borderWidth}
        />}
    </>;
};

export const UserLinesConstraint: Constraint<any> = {
    name: "user lines",
    cells: [],
    component: UserLines,
};
