import {cloneConstraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {getLineVector, Position} from "../../../types/layout/Position";
import {SokobanPTM} from "../types/SokobanPTM";
import {SokobanClue} from "../types/SokobanPuzzleExtension";
import {KillerCageProps} from "../../../components/sudoku/constraints/killer-cage/KillerCage";

export const SokobanClueConstraint = (
    {isValidCell, ...clue}: SokobanClue,
    position: Position,
    animatedPosition: Position,
): SokobanClue => ({
    ...cloneConstraint(clue, {
        processCellCoords: ({top, left}) => ({
            top: top + position.top,
            left: left + position.left,
        }),
    }),
    component: clue.component && Object.fromEntries(Object.entries(clue.component).map(([layer, Component]) => [
        layer,
        (props: ConstraintProps<SokobanPTM, KillerCageProps>) => <AutoSvg
            {...getLineVector({start: position, end: animatedPosition})}
        >
            <Component {...props} props={{...props.props, largeSum: true}}/>
        </AutoSvg>,
    ])),
    renderSingleCellInUserArea: false,
    isValidCell: isValidCell && ((
        cell,
        digits,
        regionCells,
        context,
        constraints,
        isFinalCheck,
        ...args
    ): boolean => !isFinalCheck || isValidCell(
        cell, digits, regionCells, context, constraints, isFinalCheck, ...args
    ))
});
