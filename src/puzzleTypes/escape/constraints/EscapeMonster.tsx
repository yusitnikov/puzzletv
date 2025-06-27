import { Constraint, ConstraintProps } from "../../../types/puzzle/Constraint";
import { EscapePTM } from "../types/EscapePTM";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { observer } from "mobx-react-lite";
import { blackColor, lightRedColor } from "../../../components/app/globals";
import { lightenColorStr } from "../../../utils/color";
import { normalizeVector, Position } from "../../../types/layout/Position";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { rafTime } from "../../../hooks/useRaf";
import { getEscapeMonsterAnimatedPosition } from "../types/EscapeTypeManager";

const lineWidth = 0.03;
const lineColor = blackColor;
const faceColor = lightenColorStr(lightRedColor, 0.5);

const eyes: Position[] = [
    {
        top: -0.05,
        left: -0.15,
    },
    {
        top: -0.05,
        left: 0.15,
    },
];
const teeth: Position[] = [
    {
        left: -0.2,
        top: 0.18,
    },
    {
        left: -0.15,
        top: 0.15,
    },
    {
        left: -0.1,
        top: 0.21,
    },
    {
        left: -0.05,
        top: 0.16,
    },
    {
        left: 0,
        top: 0.22,
    },
    {
        left: 0.05,
        top: 0.16,
    },
    {
        left: 0.1,
        top: 0.21,
    },
    {
        left: 0.15,
        top: 0.15,
    },
    {
        left: 0.2,
        top: 0.18,
    },
];

const EscapeMonster = observer(function EscapeMonsterFc({ context }: ConstraintProps<EscapePTM>) {
    const monsterPosition = getEscapeMonsterAnimatedPosition(context).animatedValue;
    const playerPosition = context.lastSelectedCell ?? context.puzzle.extension.playerStartPosition;

    const teethOffset = 1 + Math.cos(rafTime() * 0.015);

    return (
        <AutoSvg top={monsterPosition.top + 0.5} left={monsterPosition.left + 0.5}>
            <path
                d={[
                    "M",
                    -0.35,
                    -0.4,
                    "Q",
                    -0.3,
                    -0.1,
                    0,
                    -0.1,
                    "T",
                    0.35,
                    -0.4,
                    "Q",
                    0.2,
                    -0.3,
                    0,
                    -0.3,
                    "T",
                    -0.35,
                    -0.4,
                    "z",
                ].join(" ")}
                strokeWidth={lineWidth}
                stroke={lineColor}
                fill={faceColor}
            />

            <circle r={0.4} strokeWidth={lineWidth} stroke={lineColor} fill={faceColor} />

            {eyes.map((eyePosition, index) => {
                const direction = normalizeVector({
                    top: playerPosition.top - monsterPosition.top - eyePosition.top,
                    left: playerPosition.left - monsterPosition.left - eyePosition.left,
                });

                return (
                    <g key={`eye${index}`}>
                        <ellipse
                            cx={eyePosition.left}
                            cy={eyePosition.top}
                            rx={0.08}
                            ry={0.06}
                            strokeWidth={lineWidth}
                            stroke={lineColor}
                            fill={"#fff"}
                        />

                        <circle
                            cx={eyePosition.left + direction.left * 0.04}
                            cy={eyePosition.top + direction.top * 0.04}
                            r={lineWidth}
                            strokeWidth={0}
                            stroke={"none"}
                            fill={lineColor}
                        />
                    </g>
                );
            })}

            <line x1={-0.03} y1={-0.12} x2={-0.2} y2={-0.2} strokeWidth={lineWidth} stroke={lineColor} />
            <line x1={0.03} y1={-0.12} x2={0.2} y2={-0.2} strokeWidth={lineWidth} stroke={lineColor} />

            <AutoSvg top={-teethOffset * 0.01}>
                <path
                    d={[
                        "M",
                        -0.23,
                        0.1,
                        ...teeth.flatMap(({ left, top }) => ["L", left, top]),
                        "L",
                        0.23,
                        0.1,
                        "z",
                    ].join(" ")}
                    strokeWidth={lineWidth}
                    stroke={lineColor}
                    fill={"#fff"}
                />
            </AutoSvg>

            <AutoSvg top={teethOffset * 0.03}>
                <path
                    d={[
                        ...teeth.flatMap(({ left, top }, index) => [index ? "L" : "M", left, top]),
                        "Q",
                        0.15,
                        0.3,
                        0,
                        0.3,
                        "T",
                        teeth[0].left,
                        teeth[0].top,
                        "z",
                    ].join(" ")}
                    strokeWidth={lineWidth}
                    stroke={lineColor}
                    fill={"#fff"}
                />
            </AutoSvg>
        </AutoSvg>
    );
});

export const EscapeMonsterConstraint: Constraint<EscapePTM> = {
    name: "monster",
    cells: [],
    props: undefined,
    component: { [GridLayer.top]: EscapeMonster },
};
