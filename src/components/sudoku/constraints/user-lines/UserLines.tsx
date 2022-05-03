import {getRegionBorderWidth} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {gameStateGetCurrentFieldState} from "../../../../types/sudoku/GameState";
import {Set} from "../../../../types/struct/Set";
import {Line, Position} from "../../../../types/layout/Position";

const regularBorderColor = "#080";
const removingBorderColor = "#e00";

export const UserLines = withFieldLayer(FieldLayer.lines, ({cellSize, gameState}: ConstraintProps) => {
    const {currentMultiLine, isAddingLine} = gameState;

    const {lines} = gameStateGetCurrentFieldState(gameState);

    return <UserLinesByData
        cellSize={cellSize}
        existingLines={lines}
        currentMultiLine={currentMultiLine}
        isAdding={isAddingLine}
    />;
});

export interface UserLinesByDataProps {
    cellSize: number;
    existingLines?: Set<Line>;
    currentMultiLine?: Position[];
    isAdding?: boolean;
}

export const UserLinesByData = ({cellSize, existingLines, currentMultiLine, isAdding = true}: UserLinesByDataProps) => {
    const borderWidth = getRegionBorderWidth(cellSize) * 1.5;

    return <>
        {existingLines && existingLines.items.map(({start, end}, index) => <RoundedPolyLine
            key={`existing-${index}`}
            points={[start, end]}
            stroke={regularBorderColor}
            strokeWidth={borderWidth}
        />)}

        {currentMultiLine && currentMultiLine.length > 1 && <RoundedPolyLine
            key={"current"}
            points={currentMultiLine}
            stroke={isAdding ? regularBorderColor : removingBorderColor}
            strokeWidth={borderWidth * 1.5}
        />}
    </>;
};

export const UserLinesConstraint: Constraint<any> = {
    name: "user lines",
    cells: [],
    component: UserLines,
};
