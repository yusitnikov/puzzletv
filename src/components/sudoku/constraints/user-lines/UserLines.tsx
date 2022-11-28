import {memo, useMemo} from "react";
import {getRegionBorderWidth, lightGreyColor} from "../../../app/globals";
import {useFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {
    Constraint,
    ConstraintProps,
    getAllPuzzleConstraints,
    getInvalidUserLines,
    prepareGivenDigitsMapForConstraints
} from "../../../../types/sudoku/Constraint";
import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {gameStateGetCurrentFieldState} from "../../../../types/sudoku/GameState";
import {AutoSvg} from "../../../svg/auto-svg/AutoSvg";
import {CellMark} from "../../../../types/sudoku/CellMark";
import {PuzzleContext} from "../../../../types/sudoku/PuzzleContext";
import {normalizePuzzleLine} from "../../../../types/sudoku/PuzzleDefinition";
import {DragAction} from "../../../../types/sudoku/DragAction";
import {resolveCellColorValue} from "../../../../types/sudoku/CellColor";
import {LineWithColor} from "../../../../types/sudoku/LineWithColor";

const regularBorderColor = "#080";
const errorBorderColor = "#e00";
const removingBorderColor = lightGreyColor;

export const UserLines = memo(({context}: ConstraintProps) => {
    const layer = useFieldLayer();

    const {cellSize, puzzle, state} = context;

    const {currentMultiLine, dragAction} = state;

    const {lines, cells, marks} = gameStateGetCurrentFieldState(state);

    const borderWidth = getRegionBorderWidth(cellSize) * 1.5;

    const invalidLines = useMemo(() => getInvalidUserLines(
        lines,
        prepareGivenDigitsMapForConstraints(context, cells),
        getAllPuzzleConstraints(context),
        context
    ), [context, lines, cells]);

    return <>
        {layer === FieldLayer.givenUserLines && lines.items.map((line, index) => {
            line = normalizePuzzleLine(line, puzzle);

            return <RoundedPolyLine
                key={`existing-line-${index}`}
                points={[line.start, line.end]}
                stroke={invalidLines.contains(line) ? errorBorderColor : resolveCellColorValue(line.color ?? regularBorderColor)}
                strokeWidth={borderWidth}
            />;
        })}

        {layer === FieldLayer.givenUserLines && marks.items.map((mark, index) => <UserMarkByData
            key={`mark-${index}`}
            context={context}
            cellSize={cellSize}
            {...mark}
        />)}

        {layer === FieldLayer.newUserLines && currentMultiLine.map((line, index) => <UserLinesByData
            key={`new-line-${index}`}
            cellSize={cellSize}
            {...line}
            isAdding={dragAction === DragAction.SetTrue}
        />)}
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
        position,
        isCircle,
        color,
        // Leaving the defaults only for compatibility
        isCenter = position.left % 1 !== 0 && position.top % 1 !== 0,
    }: UserMarkByDataProps
) => {
    let {top, left} = position;

    const borderWidth = getRegionBorderWidth(cellSize) * 1.5;

    let userAreaSize = 1;

    const resolvedColor = color ? resolveCellColorValue(color) : regularBorderColor;

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
            cellsIndex,
        } = context;

        if (isCenter) {
            const cellPosition = cellsIndex.getPointInfo(position)?.cells.first();
            if (cellPosition) {
                const {bounds: {userArea}} = cellsIndex.allCells[cellPosition.top][cellPosition.left];
                userAreaSize = (userArea.width + userArea.height) / 2;
            }
        }

        if (loopVertically) {
            top = ((top % rowsCount) + rowsCount) % rowsCount;
        }

        if (loopHorizontally) {
            left = ((left % columnsCount) + columnsCount) % columnsCount;
        }
    }

    const radius = isCenter ? 0.3 * userAreaSize : 0.15;
    const lineWidth = isCenter ? borderWidth * userAreaSize : borderWidth / 2;
    const opacity = isCenter ? 0.5 : 1;

    return <AutoSvg
        top={top}
        left={left}
        stroke={resolvedColor}
        strokeWidth={borderWidth}
    >
        {isCircle && <circle
            cx={0}
            cy={0}
            r={radius}
            stroke={resolvedColor}
            strokeWidth={lineWidth}
            fill={"none"}
            opacity={opacity}
        />}

        {!isCircle && <g opacity={opacity}>
            <line
                x1={-radius}
                y1={-radius}
                x2={radius}
                y2={radius}
                stroke={resolvedColor}
                strokeWidth={lineWidth}
            />

            <line
                x1={radius}
                y1={-radius}
                x2={-radius}
                y2={radius}
                stroke={resolvedColor}
                strokeWidth={lineWidth}
            />
        </g>}
    </AutoSvg>;
};

export interface UserLinesByDataProps extends LineWithColor {
    cellSize: number;
    isAdding?: boolean;
}

export const UserLinesByData = ({cellSize, start, end, color = regularBorderColor, isAdding = true}: UserLinesByDataProps) => {
    const borderWidth = getRegionBorderWidth(cellSize) * 2;

    return <RoundedPolyLine
        points={[start, end]}
        stroke={isAdding ? resolveCellColorValue(color) : removingBorderColor}
        strokeWidth={borderWidth}
    />;
};

export const UserLinesConstraint: Constraint<any, any, any, any> = {
    name: "user lines",
    cells: [],
    component: UserLines,
    props: undefined,
};
