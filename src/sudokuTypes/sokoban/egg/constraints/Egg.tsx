import {parsePositionLiteral, PositionLiteral} from "../../../../types/layout/Position";
import {SokobanClue} from "../../types/SokobanPuzzleExtension";
import {sokobanTag} from "../../constraints/SokobanClue";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {observer} from "mobx-react-lite";
import {ConstraintProps} from "../../../../types/sudoku/Constraint";
import {SokobanPTM} from "../../types/SokobanPTM";
import {profiler} from "../../../../utils/profiler";
import {textColor} from "../../../../components/app/globals";
import {AutoSvg} from "../../../../components/svg/auto-svg/AutoSvg";
import {parseColorWithOpacity, rgba} from "../../../../utils/color";

export const eggTag = "egg";

const width = 0.6;
const height = 0.8;
const coeff = 0.4;

export const Egg: SokobanClue["component"] = {
    [FieldLayer.regular]: observer(function Egg({cells: [{top, left}], color = textColor}: ConstraintProps<SokobanPTM>) {
        profiler.trace();

        const {rgb, a = 1} = parseColorWithOpacity(color);

        return <AutoSvg top={top + 0.5} left={left + 0.5}>
            <path
                stroke={color}
                strokeWidth={0.05}
                fill={rgba(rgb, a * 0.5)}
                d={[
                    "M", width / 2, height * (0.5 - coeff),
                    "Q", width / 2, height / 2, 0, height / 2,
                    "T", -width / 2, height * (0.5 - coeff),
                    "C", -width / 2, -height / 4, -width / 4, -height / 2, 0, -height / 2,
                    "S", width / 2, -height / 4, width / 2, height * (0.5 - coeff),
                    "z",
                ].join(" ")}
            />
        </AutoSvg>;
    }),
};

export const EggConstraint = (cell: PositionLiteral, color?: string): SokobanClue => ({
    name: "egg",
    cells: [parsePositionLiteral(cell)],
    color,
    props: undefined,
    tags: [sokobanTag, eggTag],
    component: Egg,
});
