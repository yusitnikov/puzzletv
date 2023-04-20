import {AnyPTM} from "../../../types/sudoku/PuzzleTypeMap";
import {Constraint, ConstraintProps} from "../../../types/sudoku/Constraint";
import {JssCell} from "../types/JssCell";
import {FieldLayer} from "../../../types/sudoku/FieldLayer";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {emptyPosition} from "../../../types/layout/Position";
import {SingleCellFieldItemPositionFix} from "../../../components/sudoku/field/SingleCellFieldItemPositionFix";
import {CenteredText} from "../../../components/svg/centered-text/CenteredText";
import {GivenDigitsMap} from "../../../types/sudoku/GivenDigitsMap";

export const jssTag = "jss";

export interface JssProps {
    cells: JssCell[];
}

export const Jss = <T extends AnyPTM>({context, props: {cells}, region}: ConstraintProps<T, JssProps>) => {
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

    return <>
        {cells.map(({top, left, backgroundColor, text, textColor, textSize = 0.7}) => {
            return <AutoSvg
                key={`${top}-${left}`}
                top={top}
                left={left}
                width={1}
                height={1}
            >
                {backgroundColor && <rect
                    width={1}
                    height={1}
                    fill={backgroundColor}
                    stroke={"none"}
                    strokeWidth={0}
                />}

                {text !== undefined && <SingleCellFieldItemPositionFix
                    context={context}
                    position={emptyPosition}
                    region={region}
                >
                    <AutoSvg
                        top={0.5}
                        left={0.5}
                    >
                        <CenteredText
                            size={textSize}
                            fill={textColor}
                        >
                            {text}
                        </CenteredText>
                    </AutoSvg>
                </SingleCellFieldItemPositionFix>}
            </AutoSvg>;
        })}
    </>;
};

export const JssConstraint = <T extends AnyPTM>(cells: JssCell[]): Constraint<T, JssProps> => ({
    name: "JSS",
    tags: [jssTag],
    cells: cells.map(({top, left}) => ({top, left})),
    props: {cells},
    component: {[FieldLayer.noClip]: Jss},
});
