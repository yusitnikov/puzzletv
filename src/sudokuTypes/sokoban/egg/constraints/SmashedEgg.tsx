import {SokobanClue} from "../../types/SokobanPuzzleExtension";
import {FieldLayer} from "../../../../types/sudoku/FieldLayer";
import {observer} from "mobx-react-lite";
import {ConstraintProps} from "../../../../types/sudoku/Constraint";
import {SokobanPTM} from "../../types/SokobanPTM";
import {profiler} from "../../../../utils/profiler";
import {lightGreyColor, lightOrangeColor, yellowColor} from "../../../../components/app/globals";
import {AutoSvg} from "../../../../components/svg/auto-svg/AutoSvg";
import {lightenColorStr} from "../../../../utils/color";
import {SplineLoop} from "../../../../components/svg/spline/SplineLoop";

export const SmashedEgg: SokobanClue["component"] = {
    [FieldLayer.beforeSelection]: observer(function SmashedEgg({cells: [{top, left}]}: ConstraintProps<SokobanPTM>) {
        profiler.trace();

        return <AutoSvg top={top + 0.7} left={left + 0.5}>
            <SplineLoop
                stroke={lightGreyColor}
                strokeWidth={0.02}
                fill={lightenColorStr(yellowColor, 0.3)}
                points={[
                    {left: -0.1, top: -0.13},
                    {left: -0.3, top: -0.18},
                    {left: -0.4, top: 0.02},
                    {left: -0.2, top: 0.12},
                    {left: -0.1, top: 0.22},
                    {left: 0.15, top: 0.12},
                    {left: 0.25, top: 0.17},
                    {left: 0.4, top: -0.08},
                    {left: 0, top: -0.18},
                ]}
            />

            <ellipse
                stroke={"none"}
                strokeWidth={0}
                fill={lightOrangeColor}
                cx={0}
                cy={0}
                rx={0.2}
                ry={0.1}
            />
            <ellipse
                stroke={"none"}
                strokeWidth={0}
                fill={yellowColor}
                fillOpacity={0.8}
                cx={-0.01}
                cy={-0.02}
                rx={0.14}
                ry={0.07}
            />
        </AutoSvg>;
    }),
};
