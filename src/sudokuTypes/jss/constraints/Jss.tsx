import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { Constraint, ConstraintProps, ConstraintPropsGenericFc } from "../../../types/sudoku/Constraint";
import { JssCell } from "../types/JssCell";
import { GridLayer } from "../../../types/sudoku/GridLayer";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { emptyPosition } from "../../../types/layout/Position";
import { SingleCellGridItemPositionFix } from "../../../components/sudoku/grid/SingleCellGridItemPositionFix";
import { CenteredText } from "../../../components/svg/centered-text/CenteredText";
import { GivenDigitsMap } from "../../../types/sudoku/GivenDigitsMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export const jssTag = "jss";

export interface JssProps {
    cells: JssCell[];
}

export const Jss: ConstraintPropsGenericFc<JssProps> = observer(function Jss<T extends AnyPTM>({
    context,
    props: { cells },
    region,
}: ConstraintProps<T, JssProps>) {
    profiler.trace();

    if (region) {
        if (region.noInteraction) {
            return null;
        }

        const cellsMap: GivenDigitsMap<JssCell> = {};
        for (const cell of cells) {
            cellsMap[cell.top] = cellsMap[cell.top] ?? {};
            cellsMap[cell.top][cell.left] = cell;
        }

        cells = [];
        let top: number, left: number;
        for (left = region.left; left < region.left + region.width; left++) {
            for (top = region.top - 1; cellsMap[top]?.[left]; top--) {
                cells.push(cellsMap[top][left]);
            }
        }
        for (top = region.top; top < region.top + region.height; top++) {
            for (left = region.left - 1; cellsMap[top]?.[left]; left--) {
                cells.push(cellsMap[top][left]);
            }
        }
    }

    return (
        <>
            {cells.map(({ top, left, backgroundColor, text, textColor, textSize = 0.7 }) => {
                return (
                    <AutoSvg key={`${top}-${left}`} top={top} left={left} width={1} height={1}>
                        {backgroundColor && (
                            <rect width={1} height={1} fill={backgroundColor} stroke={"none"} strokeWidth={0} />
                        )}

                        {text !== undefined && (
                            <SingleCellGridItemPositionFix context={context} position={emptyPosition} region={region}>
                                <AutoSvg top={0.5} left={0.5}>
                                    <CenteredText size={textSize} fill={textColor}>
                                        {text}
                                    </CenteredText>
                                </AutoSvg>
                            </SingleCellGridItemPositionFix>
                        )}
                    </AutoSvg>
                );
            })}
        </>
    );
});

export const JssConstraint = <T extends AnyPTM>(cells: JssCell[]): Constraint<T, JssProps> => ({
    name: "JSS",
    tags: [jssTag],
    cells: cells.map(({ top, left }) => ({ top, left })),
    props: { cells },
    component: { [GridLayer.noClip]: Jss },
});
