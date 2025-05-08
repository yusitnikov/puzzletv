import { Constraint, ConstraintProps } from "../../../types/puzzle/Constraint";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { formatSvgPointsArray, isSamePosition, Position } from "../../../types/layout/Position";
import { GridLayer } from "../../../types/puzzle/GridLayer";
import { darkGreyColor, lightGreyColor } from "../../../components/app/globals";
import { observer } from "mobx-react-lite";
import { ScrewsPTM } from "../types/ScrewsPTM";
import { ReactElement } from "react";
import { ScrewDigit, ScrewsPuzzleExtension } from "../types/ScrewsPuzzleExtension";
import { CellDigits } from "../../../components/puzzle/cell/CellDigits";
import { loop } from "../../../utils/math";
import { indexes } from "../../../utils/indexes";
import { Rect } from "../../../types/layout/Rect";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { ScrewsGameState } from "../types/ScrewsGameState";

const lightColor = lightGreyColor;
const darkColor = darkGreyColor;
const margin = 0.1;
const hatHeight = 1 - margin;
const tipHeight = 0.6;
const lineWidth = 0.1;
const digitSize = 0.5;

interface ScrewProps {
    index: number;
}

const Screw = {
    [GridLayer.beforeSelection]: observer(function Screw<T extends AnyPTM>({
        context,
        props: { index },
    }: ConstraintProps<ScrewsPTM<T>, ScrewProps>) {
        const offset = (context.stateExtension as ScrewsGameState).screws[index].animationManager.animatedValue;

        const { initialPosition, digits } = (context.puzzle.extension as ScrewsPuzzleExtension<T["cell"]>).screws[
            index
        ];

        return (
            <ScrewByData context={context} position={initialPosition} digits={digits} offset={offset} opacity={0.7} />
        );
    }) as <T extends AnyPTM>(props: ConstraintProps<ScrewsPTM<T>, ScrewProps>) => ReactElement,
};

interface ScrewByDataProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    position: Rect;
    digits: ScrewDigit<T["cell"]>[];
    offset: number;
    opacity?: number;
}

export const ScrewByData = observer(function Screw<T extends AnyPTM>({
    context,
    position: { top, left, width, height },
    digits,
    offset,
    opacity = 1,
}: ScrewByDataProps<T>) {
    const center = left + width / 2;
    const offsetDigits = digits.map(({ digit, position: { top, left } }) => {
        top += 0.5;
        left += 0.5;

        const isRight = left > center;

        return {
            digit,
            top: top + offset,
            left: (left + (isRight ? -0.3 : 0.3) - center) * Math.cos(Math.PI * offset) + center,
        };
    });

    return (
        <g opacity={opacity}>
            <AutoSvg left={left} top={top + offset} width={width} height={height}>
                <path
                    d={[
                        "M",
                        margin,
                        hatHeight,
                        "L",
                        margin,
                        0.5,
                        "Q",
                        margin,
                        margin,
                        width / 2,
                        margin,
                        "Q",
                        width - margin,
                        margin,
                        width - margin,
                        0.5,
                        "L",
                        width - margin,
                        hatHeight,
                        "z",
                    ].join(" ")}
                    strokeWidth={0}
                    stroke={"none"}
                    fill={darkColor}
                />

                <polygon
                    points={formatSvgPointsArray([
                        { top: hatHeight, left: 0.5 },
                        { top: height - tipHeight, left: 0.5 },
                        { top: height, left: width / 2 },
                        { top: height - tipHeight, left: width - 0.5 },
                        { top: hatHeight, left: width - 0.5 },
                    ])}
                    strokeWidth={0}
                    stroke={"none"}
                    fill={lightColor}
                />

                <AutoSvg top={hatHeight} width={width} height={height - tipHeight - hatHeight} clip={true}>
                    <AutoSvg top={0.5 - hatHeight - loop(offset, 2)}>
                        {indexes(Math.ceil(height + 2), true).map((index) => (
                            <line
                                key={index}
                                x1={width - 0.5 + lineWidth / 3}
                                y1={index}
                                x2={0.5 - lineWidth / 3}
                                y2={index + 1}
                                strokeWidth={lineWidth}
                                stroke={darkColor}
                            />
                        ))}
                    </AutoSvg>
                </AutoSvg>
            </AutoSvg>

            {offsetDigits.map(({ digit, top, left }, index) => (
                <AutoSvg key={index} top={top - digitSize / 2} left={left - digitSize / 2}>
                    <CellDigits context={context} size={digitSize} data={{ usersDigit: digit }} mainColor={true} />
                </AutoSvg>
            ))}
        </g>
    );
}) as <T extends AnyPTM>(props: ScrewByDataProps<T>) => ReactElement;

export const ScrewConstraint = <T extends AnyPTM>(index: number): Constraint<ScrewsPTM<T>, ScrewProps> => {
    return {
        name: "screw",
        cells: [],
        props: { index },
        component: Screw,
        isObvious: false,
        isValidCell(cell, digits, regionCells, context): boolean {
            const digit = digits[cell.top][cell.left];

            const offset = Math.round(
                (context.stateExtension as ScrewsGameState).screws[index].animationManager.animatedValue,
            );

            const {
                initialPosition: { top, left, width, height },
                digits: screwDigits,
            } = (context.puzzle.extension as ScrewsPuzzleExtension<T["cell"]>).screws[index];

            if (cell.left < left - 0.6 || cell.left > left + width - 0.4) {
                return true;
            }

            const unscrewedCell: Position = {
                top: cell.top - offset,
                left:
                    offset % 2 === 1
                        ? // mirror around the center
                          2 * left + width - 1 - cell.left
                        : cell.left,
            };

            if (unscrewedCell.top < top - 0.6 || unscrewedCell.top > top + height - 0.4) {
                return true;
            }

            for (const { digit: screwDigit, position } of screwDigits) {
                if (isSamePosition(position, unscrewedCell)) {
                    return context.puzzle.typeManager.areSameCellData(digit, screwDigit, context, position, position);
                }
            }

            return true;
        },
    };
};
