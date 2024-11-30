import { RoundedPolyLine } from "../../../svg/rounded-poly-line/RoundedPolyLine";
import { FieldLayer } from "../../../../types/sudoku/FieldLayer";
import { parsePositionLiterals, PositionLiteral } from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc,
    ConstraintPropsGenericFcMap,
} from "../../../../types/sudoku/Constraint";
import { splitMultiLine } from "../../../../utils/lines";
import { lightGreyColor } from "../../../app/globals";
import { AnyPTM } from "../../../../types/sudoku/PuzzleTypeMap";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../../utils/profiler";
import { cosmeticTag } from "../decorative-shape/DecorativeShape";

export const lineTag = "line";

export interface LineProps {
    width?: number;
}

const LineComponentInLayer: ConstraintPropsGenericFc<LineProps> = observer(function Line<T extends AnyPTM>({
    cells,
    color = lightGreyColor,
    props: { width = 0.15 },
    context: { puzzleIndex },
}: ConstraintProps<T, LineProps>) {
    profiler.trace();

    return (
        <RoundedPolyLine
            points={cells.map(({ left, top }) => {
                const cellInfo = puzzleIndex.allCells[top]?.[left];
                return cellInfo
                    ? { ...cellInfo.center, radius: (cellInfo.bounds.userArea.width * width) / 2 }
                    : { left: left + 0.5, top: top + 0.5 };
            })}
            strokeWidth={width}
            stroke={color}
        />
    );
});

export const LineComponent: ConstraintPropsGenericFcMap<LineProps> = {
    [FieldLayer.regular]: LineComponentInLayer,
};

export const LineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    color?: string,
    width?: number,
    split = true,
    layer = FieldLayer.regular,
): Constraint<T, LineProps> => {
    let cells = parsePositionLiterals(cellLiterals);
    if (split) {
        cells = splitMultiLine(cells);
    }

    return {
        name: "line",
        tags: [lineTag, cosmeticTag],
        cells,
        color,
        props: { width },
        layer,
        component: { [layer]: LineComponentInLayer },
    };
};
