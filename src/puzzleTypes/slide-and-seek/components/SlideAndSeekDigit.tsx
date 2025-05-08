import { observer } from "mobx-react-lite";
import { DigitProps } from "../../../components/puzzle/digit/DigitProps";
import { profiler } from "../../../utils/profiler";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { SlideAndSeekPTM } from "../types/SlideAndSeekPTM";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { SlideAndSeekPuzzleExtension } from "../types/SlideAndSeekPuzzleExtension";
import { createEmptyContextForPuzzle, PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { defaultCosmeticShapeBorderWidth } from "../../../components/puzzle/constraints/decorative-shape/DecorativeShape";

export const SlideAndSeekDigit = observer(function SlideAndSeekDigit<T extends AnyPTM>({
    puzzle,
    digit,
    size,
    color,
    ...containerProps
}: DigitProps<SlideAndSeekPTM<T>>) {
    profiler.trace();

    return (
        <AutoSvg width={size} height={size} {...containerProps}>
            <SlideAndSeekDigitSvgContent puzzle={puzzle} digit={digit} size={size} color={color} />
        </AutoSvg>
    );
});

export const SlideAndSeekDigitSvgContent = observer(function SlideAndSeekDigitSvgContent<T extends AnyPTM>({
    puzzle,
    digit,
    size,
    color,
    left = 0,
    top = 0,
}: DigitProps<SlideAndSeekPTM<T>>) {
    profiler.trace();

    if (digit === 0) {
        size *= 0.7;
        const strokeWidth = size * defaultCosmeticShapeBorderWidth;

        return (
            <g transform={`translate(${left} ${top})`}>
                <line
                    x1={-size / 2}
                    y1={-size / 2}
                    x2={size / 2}
                    y2={size / 2}
                    stroke={color}
                    strokeWidth={strokeWidth}
                />
                <line
                    x1={-size / 2}
                    y1={size / 2}
                    x2={size / 2}
                    y2={-size / 2}
                    stroke={color}
                    strokeWidth={strokeWidth}
                />
            </g>
        );
    }

    const constraint = (puzzle.extension as SlideAndSeekPuzzleExtension).shapes[digit - 1];
    if (!constraint) {
        return null;
    }

    const {
        component = {},
        props: { width, height, borderWidth = defaultCosmeticShapeBorderWidth },
    } = constraint;

    const context = createEmptyContextForPuzzle(puzzle) as unknown as PuzzleContext<AnyPTM>;

    return (
        <>
            {Object.entries(component).map(([layer, Component]) => (
                <Component
                    key={layer}
                    context={context}
                    {...constraint}
                    cells={[{ top: top * size - 0.5, left: left * size - 0.5 }]}
                    color={constraint.color?.match(/^#000/i) ? color : "transparent"}
                    props={{
                        ...constraint.props,
                        width: width * size,
                        height: height * size,
                        borderWidth: borderWidth * size,
                        borderColor: color,
                    }}
                />
            ))}
        </>
    );
});
