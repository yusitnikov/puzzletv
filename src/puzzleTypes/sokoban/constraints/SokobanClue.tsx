import { cloneConstraint, ConstraintProps } from "../../../types/puzzle/Constraint";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { getLineVector, Position } from "../../../types/layout/Position";
import { SokobanPTM } from "../types/SokobanPTM";
import { SokobanClue } from "../types/SokobanPuzzleExtension";
import { isCageConstraint, KillerCageProps } from "../../../components/puzzle/constraints/killer-cage/KillerCage";
import { errorResultCheck } from "../../../types/puzzle/PuzzleResultCheck";

export const sokobanTag = "sokoban";

export const SokobanClueConstraint = (
    { isValidCell, isValidPuzzle, ...clue }: SokobanClue,
    position: Position,
    animatedPosition: Position,
    smashed: boolean,
    animatedSmashed: boolean,
    smashedComponent?: SokobanClue["component"],
): SokobanClue => ({
    ...cloneConstraint(
        {
            ...clue,
            props: isCageConstraint(clue) ? ({ ...clue.props, largeSum: true } as KillerCageProps) : clue.props,
        },
        {
            processCellCoords: ({ top, left }) => ({
                top: top + position.top,
                left: left + position.left,
            }),
        },
    ),
    component:
        (animatedSmashed && smashedComponent) ||
        (clue.component &&
            Object.fromEntries(
                Object.entries(clue.component).map(([layer, Component]) => [
                    layer,
                    (props: ConstraintProps<SokobanPTM, any>) => (
                        <AutoSvg {...getLineVector({ start: position, end: animatedPosition })}>
                            <g opacity={animatedSmashed ? 0.3 : 1}>
                                <Component {...props} />
                            </g>
                        </AutoSvg>
                    ),
                ]),
            )),
    renderSingleCellInUserArea: false,
    isValidCell: smashed
        ? undefined
        : isValidCell &&
          ((cell, digits, regionCells, context, constraints, constraint, isFinalCheck, ...args): boolean =>
              !isFinalCheck ||
              isValidCell(cell, digits, regionCells, context, constraints, constraint, isFinalCheck, ...args)),
    isValidPuzzle: smashed ? errorResultCheck : isValidPuzzle,
});
