import { RoundedPolyLine } from "../../../svg/rounded-poly-line/RoundedPolyLine";
import { GridLayer } from "../../../../types/puzzle/GridLayer";
import { parsePositionLiterals, PositionLiteral } from "../../../../types/layout/Position";
import {
    Constraint,
    ConstraintProps,
    ConstraintPropsGenericFc,
    ConstraintPropsGenericFcMap,
} from "../../../../types/puzzle/Constraint";
import { splitMultiLine } from "../../../../utils/lines";
import { lightGreyColor } from "../../../app/globals";
import { AnyPTM } from "../../../../types/puzzle/PuzzleTypeMap";
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
    [GridLayer.regular]: LineComponentInLayer,
};

export const LineConstraint = <T extends AnyPTM>(
    cellLiterals: PositionLiteral[],
    color?: string,
    width?: number,
    split = true,
    layer = GridLayer.regular,
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

export const isLine = <T extends AnyPTM>(item: Constraint<T, any>): item is Constraint<T, LineProps> =>
    item.tags?.includes(lineTag) ?? false;
