import { observer } from "mobx-react-lite";
import { DigitProps } from "../../../components/sudoku/digit/DigitProps";
import { profiler } from "../../../utils/profiler";
import { AnyPTM } from "../../../types/sudoku/PuzzleTypeMap";
import { SlideAndSeekPTM } from "../types/SlideAndSeekPTM";
import { AutoSvg } from "../../../components/svg/auto-svg/AutoSvg";
import { SlideAndSeekPuzzleExtension } from "../types/SlideAndSeekPuzzleExtension";
import { createEmptyContextForPuzzle, PuzzleContext } from "../../../types/sudoku/PuzzleContext";
import { defaultCosmeticShapeBorderWidth } from "../../../components/sudoku/constraints/decorative-shape/DecorativeShape";

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
