import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { Constraint, ConstraintProps } from "../../../types/sudoku/Constraint";
import { SokobanPTM } from "../types/SokobanPTM";
import {
    emptyPosition,
    formatSvgPointsArray,
    Position,
    positionToArray,
    rotateVectorClockwise,
} from "../../../types/layout/Position";
import { GridLayer } from "../../../types/sudoku/GridLayer";
import { defaultSokobanDirection } from "../types/SokobanGameState";
import { textColor } from "../../../components/app/globals";
import { loop } from "../../../utils/math";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

const playerSize = 0.8;
const headSize = 0.3;
const faceColor = "#ffffaa";
const hairColor = "#be6a43";
const hairLength = headSize * 0.4;
const hairOffset = hairLength / 6;
const hatColor = "#0cce0c";
const headStart = headSize - playerSize / 2;
const legStart = 0.05;
const legWidth = 0.05;
const horizontalStep = 1 / 4;
const verticalStep = 1 / 6;
const handEnd = 0.05;
const handCoeff = 0.7;
const animateLegCoords = (x: number, step: number) => {
    return Math.abs(loop(x, step * 2) - step) - step / 2;
};

const lineColor = textColor;
const lineWidth = 0.02;
const eyeRadius = lineWidth;

const formatHeadPath = (path: (string | number)[]) =>
    path.map((value) => (typeof value === "number" ? (value * headSize) / 2 : value)).join(" ");

const SokobanPlayer = observer(function SokobanPlayer({
    context: {
        stateExtension: { sokobanDirection },
    },
    cells: [position],
}: ConstraintProps<SokobanPTM>) {
    profiler.trace();

    return <SokobanPlayerByData position={position} direction={sokobanDirection} />;
});

export interface SokobanPlayerByDataProps {
    position?: Position;
    direction?: Position;
}
export const SokobanPlayerByData = observer(function SokobanPlayerByData({
    position: { top, left } = emptyPosition,
    direction: { top: topDir, left: leftDir } = defaultSokobanDirection,
}: SokobanPlayerByDataProps) {
    profiler.trace();

    return (
        <AutoSvg top={top + 0.5} left={left + 0.5}>
            <line
                x1={0}
                y1={legStart + legWidth * 0.5}
                x2={0}
                y2={headStart}
                stroke={lineColor}
                strokeWidth={legWidth * 1.6}
            />
            <line
                x1={legWidth * 0.3}
                y1={legStart}
                x2={animateLegCoords(left, horizontalStep)}
                y2={playerSize / 2 + animateLegCoords(top + verticalStep / 2, verticalStep)}
                stroke={lineColor}
                strokeWidth={legWidth}
            />
            <line
                x1={-legWidth * 0.3}
                y1={legStart}
                x2={animateLegCoords(left + horizontalStep, horizontalStep)}
                y2={playerSize / 2 + animateLegCoords(top - verticalStep / 2, verticalStep)}
                stroke={lineColor}
                strokeWidth={legWidth}
            />
            <line
                x1={legWidth * 0.3}
                y1={headStart}
                x2={handCoeff * animateLegCoords(left, horizontalStep)}
                y2={handEnd - handCoeff * animateLegCoords(top + verticalStep / 2, verticalStep)}
                stroke={lineColor}
                strokeWidth={legWidth}
            />
            <line
                x1={-legWidth * 0.3}
                y1={headStart}
                x2={handCoeff * animateLegCoords(left + horizontalStep, horizontalStep)}
                y2={handEnd - handCoeff * animateLegCoords(top - verticalStep / 2, verticalStep)}
                stroke={lineColor}
                strokeWidth={legWidth}
            />

            <AutoSvg top={headSize / 2 - playerSize / 2}>
                {topDir === 1 && (
                    <>
                        <polygon
                            points={formatSvgPointsArray([
                                { top: 0, left: headSize / 2 },
                                { top: hairLength, left: headSize / 2 + hairOffset },
                                { top: hairLength, left: -headSize / 2 - hairOffset },
                                { top: 0, left: -headSize / 2 },
                            ])}
                            fill={hairColor}
                            stroke={lineColor}
                            strokeWidth={lineWidth}
                        />
                    </>
                )}
                <circle r={headSize / 2} fill={faceColor} stroke={lineColor} strokeWidth={lineWidth} />
                {topDir === -1 && (
                    <>
                        <polygon
                            points={formatSvgPointsArray([
                                { top: 0, left: headSize / 2 },
                                { top: hairLength, left: headSize / 2 + hairOffset },
                                { top: hairLength, left: -headSize / 2 - hairOffset },
                                { top: 0, left: -headSize / 2 },
                            ])}
                            fill={hairColor}
                            stroke={lineColor}
                            strokeWidth={lineWidth}
                        />
                        <path
                            d={formatHeadPath(["M", -1, 0, "Q", -1, -1, 0, -1, "T", 1, 0, "z"])}
                            fill={hatColor}
                            stroke={lineColor}
                            strokeWidth={lineWidth}
                        />
                    </>
                )}
                {topDir === 0 && (
                    <>
                        <circle
                            cx={leftDir * headSize * 0.25}
                            cy={headSize * 0.15}
                            r={eyeRadius}
                            fill={lineColor}
                            stroke={"none"}
                            strokeWidth={0}
                        />
                        <circle
                            cx={leftDir * headSize * 0.42}
                            cy={headSize * 0.1}
                            r={eyeRadius * 0.8}
                            fill={lineColor}
                            stroke={"none"}
                            strokeWidth={0}
                        />
                        <polygon
                            points={formatSvgPointsArray([
                                { top: 0, left: leftDir * hairOffset },
                                { top: 0, left: (-leftDir * headSize) / 2 },
                                { top: hairLength, left: -leftDir * (headSize / 2 + hairOffset) },
                                { top: hairLength, left: 0 },
                            ])}
                            fill={hairColor}
                            stroke={lineColor}
                            strokeWidth={lineWidth}
                        />
                        <path
                            d={formatHeadPath([
                                "M",
                                -leftDir,
                                0,
                                "A",
                                1,
                                1,
                                (150 * leftDir).toString(),
                                "0",
                                leftDir > 0 ? "1" : "0",
                                ...positionToArray(rotateVectorClockwise({ top: 0, left: -leftDir }, 150 * leftDir)),
                                "L",
                                leftDir * 1.3,
                                0,
                                "z",
                            ])}
                            fill={hatColor}
                            stroke={lineColor}
                            strokeWidth={lineWidth}
                        />
                        <path
                            d={formatHeadPath(["M", leftDir * 0.3, 0.5, "Q", leftDir * 0.4, 0.65, leftDir * 0.8, 0.65])}
                            fill={"none"}
                            stroke={lineColor}
                            strokeWidth={lineWidth}
                        />
                    </>
                )}
                {topDir === 1 && (
                    <>
                        <circle
                            cx={headSize * 0.2}
                            cy={headSize * 0.1}
                            r={eyeRadius}
                            fill={lineColor}
                            stroke={"none"}
                            strokeWidth={0}
                        />
                        <circle
                            cx={-headSize * 0.2}
                            cy={headSize * 0.1}
                            r={eyeRadius}
                            fill={lineColor}
                            stroke={"none"}
                            strokeWidth={0}
                        />
                        <path
                            d={formatHeadPath(["M", 0.5, 0.5, "Q", 0.4, 0.65, 0, 0.65, "T", -0.5, 0.5])}
                            fill={"none"}
                            stroke={lineColor}
                            strokeWidth={lineWidth}
                        />
                        <path
                            d={formatHeadPath([
                                "M",
                                -1,
                                0,
                                "Q",
                                -1,
                                -1,
                                0,
                                -1,
                                "T",
                                1,
                                0,
                                "Q",
                                0.5,
                                0.1,
                                0,
                                0.1,
                                "T",
                                -1,
                                0,
                                "z",
                            ])}
                            fill={hatColor}
                            stroke={lineColor}
                            strokeWidth={lineWidth}
                        />
                        <line
                            x1={-headSize / 2}
                            y1={0}
                            x2={headSize / 2}
                            y2={0}
                            stroke={lineColor}
                            strokeWidth={lineWidth}
                        />
                    </>
                )}
            </AutoSvg>
        </AutoSvg>
    );
});

export const SokobanPlayerConstraint = (position: Position): Constraint<SokobanPTM> => ({
    name: "sokoban player",
    cells: [position],
    props: undefined,
    component: { [GridLayer.beforeSelection]: SokobanPlayer },
});
