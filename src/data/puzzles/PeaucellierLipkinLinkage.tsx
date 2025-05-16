import { allDrawingModes, PuzzleDefinition } from "../../types/puzzle/PuzzleDefinition";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { GridSize9, Regions9 } from "../../types/puzzle/GridSize";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { GridLayer } from "../../types/puzzle/GridLayer";
import { observer } from "mobx-react-lite";
import { RoundedPolyLine } from "../../components/svg/rounded-poly-line/RoundedPolyLine";
import { darkGreyColor, greenColor, purpleColor, veryDarkGreyColor } from "../../components/app/globals";
import { AutoSvg } from "../../components/svg/auto-svg/AutoSvg";
import { rafTime } from "../../hooks/useRaf";
import { WhispersConstraint } from "../../components/puzzle/constraints/whispers/Whispers";
import { Constraint, isValidFinishedPuzzleByConstraints } from "../../types/puzzle/Constraint";
import { RenbanConstraint } from "../../components/puzzle/constraints/renban/Renban";
import { AddGameStateEx, addGameStateExToPuzzleTypeManager } from "../../types/puzzle/PuzzleTypeManagerPlugin";
import { PuzzleTypeManager } from "../../types/puzzle/PuzzleTypeManager";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import {
    germanWhispersExplained,
    germanWhispersTitle,
    normalSudokuRulesApply,
    renbanExplained,
    renbanTitle,
    ruleWithTitle,
} from "../ruleSnippets";
import { makeAutoObservable, runInAction } from "mobx";
import { profiler } from "../../utils/profiler";
import { Button } from "../../components/layout/button/Button";
import { loop } from "../../utils/math";
import { translate } from "../../utils/translate";

const period = 3000;

class LineSync {
    private startTime = 0;
    private endAnimationStartTime = 0;
    private endTime = 0;

    get started() {
        return !!this.startTime;
    }

    get ending() {
        return !!this.endTime;
    }

    get time() {
        profiler.trace();

        if (!this.started) {
            return 0;
        }

        let now = rafTime();
        if (this.ending) {
            now = Math.min(now, this.endTime);
        }

        return now - this.startTime;
    }

    get endAnimationCoeff() {
        profiler.trace();

        if (!this.endAnimationStartTime) {
            return 0;
        }

        return Math.min((rafTime() - this.endAnimationStartTime) / 1000, 1);
    }

    constructor() {
        makeAutoObservable(this);
    }

    reset() {
        runInAction(() => {
            this.startTime = 0;
            this.endAnimationStartTime = 0;
            this.endTime = 0;
        });
    }

    start() {
        runInAction(() => {
            this.startTime = rafTime();
        });
    }

    async end() {
        const now = rafTime();
        const dt = period - loop(now - this.startTime, period);

        runInAction(() => {
            this.endAnimationStartTime = now;
            this.endTime = now + dt;
        });

        return new Promise<void>((resolve) => setTimeout(resolve, dt));
    }
}

const lineSync = new LineSync();

interface IsReadyGameStateEx {
    isReady: boolean;
}

type IsReadyPTM = AddGameStateEx<NumberPTM, IsReadyGameStateEx>;

const IsReadyTypeManager: PuzzleTypeManager<IsReadyPTM> = {
    ...addGameStateExToPuzzleTypeManager(DigitPuzzleTypeManager(), {
        initialGameStateExtension: { isReady: false },
    }),
    isReady({ stateExtension: { isReady } }) {
        return isReady;
    },
    // Use the method just to handle the restart event, not to actually keep the state
    keepStateOnRestart() {
        lineSync.reset();

        return {};
    },
};

const LinkageConstraint: Constraint<IsReadyPTM> = {
    name: "linkage",
    cells: [],
    props: undefined,
    component: {
        [GridLayer.regular]: observer(function Linkage({
            context: {
                stateExtension: { isReady },
            },
        }) {
            const angle = (Math.cos((lineSync.time * 2 * Math.PI) / period) * Math.PI) / 2;

            const p0 = { left: 0, top: 0 };
            const p1 = { left: 1, top: 0 };

            const x2 = 1 + Math.cos(angle);
            const y2 = Math.sin(angle);
            const len2 = Math.hypot(x2, y2);
            const p2 = { left: x2, top: y2 };

            const x3 = -1;
            const y3 = -y2 / x2;
            const p3 = { left: x3, top: y3 };

            const cx = (x2 + x3) / 2;
            const cy = (y2 + y3) / 2;
            const cLen = Math.hypot(cx, cy);

            const len4 = Math.sqrt(2 - cLen * cLen);
            const dx = (len4 * y2) / len2;
            const dy = (len4 * x2) / len2;
            const x4 = cx + dx;
            const y4 = cy - dy;
            const p4 = { left: x4, top: y4 };
            const x5 = cx - dx;
            const y5 = cy + dy;
            const p5 = { left: x5, top: y5 };

            return (
                <AutoSvg left={4.5} top={4.5} scale={2}>
                    {!isReady && <line x1={-1} y1={-1} x2={-1} y2={1} stroke={darkGreyColor} strokeWidth={0.02} />}

                    <RoundedPolyLine points={[p2, p4, p3, p5, p2]} strokeWidth={0.075} stroke={greenColor} />

                    <RoundedPolyLine points={[p4, p0, p1, p2]} strokeWidth={0.06} stroke={purpleColor} />

                    <RoundedPolyLine points={[p0, p5]} strokeWidth={0.06} stroke={purpleColor} />

                    {(!isReady || lineSync.ending) &&
                        [p0, p1, p2, p3, p4, p5].map(({ top, left }, index) => (
                            <circle
                                key={index}
                                cx={left}
                                cy={top}
                                r={0.055}
                                fill={veryDarkGreyColor}
                                stroke={"none"}
                                strokeWidth={0}
                                opacity={1 - lineSync.endAnimationCoeff}
                            />
                        ))}
                </AutoSvg>
            );
        }),
    },
};

export const PeaucellierLipkinLinkage: PuzzleDefinition<IsReadyPTM> = {
    noIndex: true,
    extension: {},
    title: { [LanguageCode.en]: "Peaucellier-Lipkin" },
    author: { [LanguageCode.en]: "Palfly Kampling" },
    slug: "peaucellier-lipkin-linkage",
    typeManager: IsReadyTypeManager,
    gridSize: GridSize9,
    regions: Regions9,
    allowDrawing: allDrawingModes,
    rules: (context) => {
        const {
            stateExtension: { isReady },
            cellSizeForSidePanel: cellSize,
        } = context;

        const setReady = () => context.onStateChange({ extension: { isReady: true } });

        return (
            <>
                {!isReady && (
                    <>
                        <RulesParagraph>
                            {translate({
                                [LanguageCode.en]:
                                    "This puzzle is based on a planar linkage that draws perfectly straight lines",
                                [LanguageCode.ru]:
                                    "Эта головоломка основана на 2D-механизме, который может рисовать идеальную прямую линию",
                                [LanguageCode.de]:
                                    "Dieses Rätsel ist basiert auf einem 2D Mechanismus der eine perfekte gerade linie zeichnen kann",
                            })}
                            .
                        </RulesParagraph>

                        {!lineSync.started && (
                            <RulesParagraph>
                                <Button cellSize={cellSize} onClick={() => lineSync.start()}>
                                    {translate({
                                        [LanguageCode.en]: "Show me",
                                        [LanguageCode.ru]: "Покажи мне",
                                        [LanguageCode.de]: "Zeig mir",
                                    })}
                                    !
                                </Button>
                            </RulesParagraph>
                        )}

                        {lineSync.started && (
                            <RulesParagraph>
                                <Button
                                    cellSize={cellSize}
                                    disabled={lineSync.ending}
                                    onClick={() => lineSync.end().then(setReady)}
                                >
                                    {translate({
                                        [LanguageCode.en]: "Gotcha",
                                        [LanguageCode.ru]: "Понятненько",
                                        [LanguageCode.de]: "Verstanden",
                                    })}
                                    !
                                </Button>
                            </RulesParagraph>
                        )}
                    </>
                )}

                {isReady && (
                    <>
                        <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
                        <RulesParagraph>
                            {ruleWithTitle(translate(germanWhispersTitle), translate(germanWhispersExplained()))}.
                        </RulesParagraph>
                        <RulesParagraph>
                            {ruleWithTitle(translate(renbanTitle), translate(renbanExplained()))}.
                        </RulesParagraph>
                        <RulesParagraph>
                            {translate({
                                [LanguageCode.en]: "The line in box 5 is one 9-cell line",
                                [LanguageCode.ru]: "Линия в квадрате 5 - это одна линия из 9 клеток",
                                [LanguageCode.de]: "Die Linie in Box 5 ist eine 9-zellige Linie",
                            })}
                            .
                        </RulesParagraph>
                    </>
                )}
            </>
        );
    },
    initialDigits: { 5: { 5: 1 } },
    items: [
        LinkageConstraint,

        WhispersConstraint(["R2C1", "R1C1", "R1C2"]),
        WhispersConstraint(["R4C1", "R5C1", "R5C2"]),
        WhispersConstraint(["R8C1", "R9C1", "R9C3"]),
        WhispersConstraint(["R2C9", "R1C9", "R1C7"]),
        WhispersConstraint(["R7C9", "R9C9", "R9C8"]),
        WhispersConstraint(["R8C5", "R9C5"]),
        RenbanConstraint(["R1C5", "R2C5"]),
        RenbanConstraint(["R5C8", "R5C9"]),
        RenbanConstraint(["R2C3", "R3C2"]),
        RenbanConstraint(["R8C3", "R7C2"]),
        RenbanConstraint(["R2C7", "R3C8"]),
        RenbanConstraint(["R8C7", "R7C8"]),

        ...[
            WhispersConstraint<IsReadyPTM>(["R3C3", "R3C7", "R7C7", "R7C3"]),
            WhispersConstraint<IsReadyPTM>(["R3C3", "R7C3"]),
            RenbanConstraint<IsReadyPTM>(
                ["R7C3", "R6C4", "R5C5", "R4C6", "R3C7", "R5C6", "R5C7", "R6C7", "R7C7"],
                false,
            ),
        ].map((constraint) => ({
            ...constraint,
            component: undefined,
        })),
    ],
    resultChecker: isValidFinishedPuzzleByConstraints,
};
