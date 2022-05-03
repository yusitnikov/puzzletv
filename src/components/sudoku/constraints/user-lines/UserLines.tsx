import {getRegionBorderWidth} from "../../../app/globals";
import {withFieldLayer} from "../../../../contexts/FieldLayerContext";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {Constraint, ConstraintProps} from "../../../../types/sudoku/Constraint";
import {RoundedPolyLine} from "../../../svg/rounded-poly-line/RoundedPolyLine";
import {gameStateGetCurrentFieldState} from "../../../../types/sudoku/GameState";

const regularBorderColor = "#080";
const removingBorderColor = "#e00";

export const UserLines = withFieldLayer(FieldLayer.lines, ({cellSize, gameState}: ConstraintProps) => {
    const {currentMultiLine, isAddingLine} = gameState;

    const {lines} = gameStateGetCurrentFieldState(gameState);

    const borderWidth = getRegionBorderWidth(cellSize) * 1.5;

    return <>
        {lines.items.map(({start, end}, index) => <RoundedPolyLine
            key={`existing-${index}`}
            points={[start, end]}
            stroke={regularBorderColor}
            strokeWidth={borderWidth}
        />)}

        {currentMultiLine.length > 1 && <RoundedPolyLine
            key={"current"}
            points={currentMultiLine}
            stroke={isAddingLine ? regularBorderColor : removingBorderColor}
            strokeWidth={borderWidth * 1.5}
        />}
    </>;
});

export const UserLinesConstraint: Constraint<any> = {
    name: "user lines",
    cells: [],
    component: UserLines,
};
