import { Rect } from "../../../types/layout/Rect";
import { TransformedRectGraphics } from "../../../contexts/TransformContext";
import { Constraint, ConstraintProps } from "../../../types/puzzle/Constraint";
import { RushHourPTM } from "../types/RushHourPTM";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { textColor } from "../../../components/app/globals";
import { mixColorsStr } from "../../../utils/color";
import { CellWriteMode } from "../../../types/puzzle/CellWriteMode";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { getAnimatedCarPosition } from "../types/RushHourTypeManager";

export const carMargin = 0.1;
const frameSize = 0.02;
const glassSize = 0.1;
const glassColor = textColor;
const glassOpacity = 0.3;
const lightSize = 0.2;
const lightOpacity = 0.7;

interface CarProps extends Rect {
    color: string;
    invert?: boolean;
}

export const RushHourCar = observer(function RushHourCarFc({ top, left, width, height, color, invert }: CarProps) {
    profiler.trace();

    if (height > width) {
        return (
            <TransformedRectGraphics
                rect={{
                    base: { top, left },
                    rightVector: { top: 1, left: 0 },
                    bottomVector: { top: 0, left: 1 },
                }}
            >
                <RushHourCar top={0} left={0} width={height} height={width} color={color} invert={invert} />;
            </TransformedRectGraphics>
        );
    }

    if (invert) {
        return (
            <TransformedRectGraphics
                rect={{
                    base: { top, left: left + width },
                    rightVector: { top: 0, left: -1 },
                    bottomVector: { top: 1, left: 0 },
                }}
            >
                <RushHourCar top={0} left={0} width={width} height={height} color={color} invert={false} />;
            </TransformedRectGraphics>
        );
    }

    width -= carMargin * 2;
    height -= carMargin * 2;

    color = mixColorsStr(color, "#fff", 0.7);
    const mirrorColor = mixColorsStr(color, "#000", 0.9);
    const mirrorX = width - 0.45;

    return (
        <g transform={`translate(${left + carMargin}, ${top + carMargin})`}>
            <path
                d={[
                    "M",
                    width - carMargin,
                    0,
                    "Q",
                    width,
                    0,
                    width,
                    height / 2,
                    "T",
                    width - carMargin,
                    height,
                    "L",
                    carMargin,
                    height,
                    "Q",
                    0,
                    height,
                    0,
                    height - carMargin,
                    "L",
                    0,
                    carMargin,
                    "Q",
                    0,
                    0,
                    carMargin,
                    0,
                    "z",
                ].join(" ")}
                fill={color}
                stroke={"none"}
                strokeWidth={0}
            />

            <path
                d={[
                    "M",
                    0.4 + frameSize,
                    frameSize,
                    "L",
                    width - 0.4 - frameSize,
                    frameSize,
                    "L",
                    width - 0.4 - frameSize - glassSize * 2,
                    frameSize + glassSize,
                    "L",
                    0.4 + frameSize + glassSize,
                    frameSize + glassSize,
                    "z",
                ].join(" ")}
                fill={glassColor}
                opacity={glassOpacity}
                stroke={"none"}
                strokeWidth={0}
            />
            <path
                d={[
                    "M",
                    0.4,
                    frameSize * 2,
                    "Q",
                    0.4 - glassSize / 2,
                    height / 4,
                    0.4 - glassSize / 2,
                    height / 2,
                    "T",
                    0.4,
                    height - frameSize * 2,
                    "L",
                    0.4 + glassSize,
                    height - frameSize * 2 - glassSize,
                    "L",
                    0.4 + glassSize,
                    frameSize * 2 + glassSize,
                    "z",
                ].join(" ")}
                fill={glassColor}
                opacity={glassOpacity}
                stroke={"none"}
                strokeWidth={0}
            />
            <path
                d={[
                    "M",
                    0.4 + frameSize,
                    height - frameSize,
                    "L",
                    width - 0.4 - frameSize,
                    height - frameSize,
                    "L",
                    width - 0.4 - frameSize - glassSize * 2,
                    height - frameSize - glassSize,
                    "L",
                    0.4 + frameSize + glassSize,
                    height - frameSize - glassSize,
                    "z",
                ].join(" ")}
                fill={glassColor}
                opacity={glassOpacity}
                stroke={"none"}
                strokeWidth={0}
            />
            <path
                d={[
                    "M",
                    width - 0.4,
                    frameSize * 2,
                    "Q",
                    width - 0.4 + glassSize / 2,
                    height / 4,
                    width - 0.4 + glassSize / 2,
                    height / 2,
                    "T",
                    width - 0.4,
                    height - frameSize * 2,
                    "L",
                    width - 0.4 - glassSize * 2,
                    height - frameSize * 2 - glassSize,
                    "L",
                    width - 0.4 - glassSize * 2,
                    frameSize * 2 + glassSize,
                    "z",
                ].join(" ")}
                fill={glassColor}
                opacity={glassOpacity}
                stroke={"none"}
                strokeWidth={0}
            />

            <path
                d={[
                    "M",
                    mirrorX,
                    frameSize,
                    "Q",
                    mirrorX - frameSize,
                    -frameSize * 3,
                    mirrorX - frameSize * 3,
                    -frameSize * 3,
                    "L",
                    mirrorX - frameSize * 2,
                    frameSize,
                    "z",
                ].join(" ")}
                fill={mirrorColor}
                stroke={"none"}
                strokeWidth={0}
            />
            <path
                d={[
                    "M",
                    mirrorX,
                    height - frameSize,
                    "Q",
                    mirrorX - frameSize,
                    height + frameSize * 3,
                    mirrorX - frameSize * 3,
                    height + frameSize * 3,
                    "L",
                    mirrorX - frameSize * 2,
                    height - frameSize,
                    "z",
                ].join(" ")}
                fill={mirrorColor}
                stroke={"none"}
                strokeWidth={0}
            />

            <path
                d={[
                    "M",
                    width - carMargin,
                    frameSize,
                    "Q",
                    width - carMargin * 0.1 - frameSize * 2,
                    frameSize * 2,
                    width - carMargin * 0.1 - frameSize,
                    frameSize + lightSize,
                    "L",
                    width - carMargin * 0.1 - frameSize * 2,
                    frameSize + lightSize,
                    "L",
                    width - carMargin - frameSize,
                    frameSize * 2,
                    "Q",
                    width - carMargin - frameSize,
                    frameSize,
                    width - carMargin,
                    frameSize,
                    "z",
                ].join(" ")}
                fill={"#fff"}
                opacity={lightOpacity}
                stroke={"none"}
                strokeWidth={0}
            />
            <path
                d={[
                    "M",
                    width - carMargin,
                    height - frameSize,
                    "Q",
                    width - carMargin * 0.1 - frameSize * 2,
                    height - frameSize * 2,
                    width - carMargin * 0.1 - frameSize,
                    height - frameSize - lightSize,
                    "L",
                    width - carMargin * 0.1 - frameSize * 2,
                    height - frameSize - lightSize,
                    "L",
                    width - carMargin - frameSize,
                    height - frameSize * 2,
                    "Q",
                    width - carMargin - frameSize,
                    height - frameSize,
                    width - carMargin,
                    height - frameSize,
                    "z",
                ].join(" ")}
                fill={"#fff"}
                opacity={lightOpacity}
                stroke={"none"}
                strokeWidth={0}
            />
        </g>
    );
});

export const RushHourCars = observer(function RushHourCars({ region, context }: ConstraintProps<RushHourPTM>) {
    profiler.trace();

    if (region?.cells?.length) {
        return null;
    }

    const {
        puzzle: { extension },
        cellWriteMode,
        stateExtension: { hideCars },
    } = context;

    return (
        <g opacity={hideCars && cellWriteMode !== CellWriteMode.move ? 0.3 : undefined}>
            {extension.cars.map(({ boundingRect: { top, left, width, height }, color, invert }, index) => {
                const carPosition = getAnimatedCarPosition(context, index);

                return (
                    <RushHourCar
                        key={`car-${index}`}
                        top={top + carPosition.top}
                        left={left + carPosition.left}
                        width={width}
                        height={height}
                        color={color}
                        invert={invert}
                    />
                );
            })}
        </g>
    );
});

export const RushHourCarsConstraint: Constraint<RushHourPTM> = {
    name: "rush hour cars",
    cells: [],
    component: {
        [GridLayer.beforeSelection]: RushHourCars,
    },
    props: undefined,
};
