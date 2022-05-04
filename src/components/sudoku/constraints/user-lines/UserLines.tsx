import {memo} from "react";
import {getRegionBorderWidth} from "../../../app/globals";
import {useFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {gameStateGetCurrentFieldState} from "../../../../types/sudoku/GameState";
import {getLineVector, Position} from "../../../../types/layout/Position";

const regularBorderColor = "#080";
const removingBorderColor = "#e00";

export const UserLines = memo((
    {
        cellSize,
        puzzle: {
            fieldSize: {
                rowsCount,
                columnsCount,
            },
            loopHorizontally,
            loopVertically,
        },
        gameState,
    }: ConstraintProps
) => {
    const layer = useFieldLayer();

    const {currentMultiLine, isAddingLine} = gameState;

    const {lines} = gameStateGetCurrentFieldState(gameState);

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
                key={`existing-${index}`}
                points={[{left, top}, {left: left + vector.left, top: top + vector.top}]}
                stroke={regularBorderColor}
                strokeWidth={borderWidth}
            />;
        })}

        {layer === FieldLayer.newUserLines && <UserLinesByData
            cellSize={cellSize}
            currentMultiLine={currentMultiLine}
            isAdding={isAddingLine}
        />}
    </>;
});

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
