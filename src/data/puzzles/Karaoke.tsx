/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {
    allDrawingModes,
    isValidFinishedPuzzleByEmbeddedSolution,
    PuzzleDefinition,
} from "../../types/puzzle/PuzzleDefinition";
import { NumberPTM } from "../../types/puzzle/PuzzleTypeMap";
import { LanguageCode } from "../../types/translations/LanguageCode";
import { RulesParagraph } from "../../components/puzzle/rules/RulesParagraph";
import { Regions9 } from "../../types/puzzle/GridSize";
import { DigitPuzzleTypeManager } from "../../puzzleTypes/default/types/DigitPuzzleTypeManager";
import { Chameleon } from "../authors";
import { normalSudokuRulesApply } from "../ruleSnippets";
import { CellTypeProps } from "../../types/puzzle/CellTypeProps";
import { observer } from "mobx-react-lite";
import {
    parsePositionLiteral,
    parsePositionLiterals,
    Position,
    PositionLiteral,
    stringifyPosition,
} from "../../types/layout/Position";
import { Constraint, ConstraintProps, toDecorativeConstraint } from "../../types/puzzle/Constraint";
import { GridLayer } from "../../types/puzzle/GridLayer";
import { usePuzzleContainer } from "../../contexts/PuzzleContainerContext";
import { createPortal } from "react-dom";
import {
    blueColor,
    darkBlueColor,
    darkGreyColor,
    greenColor,
    lighterGreyColor,
    lightGreyColor,
    pinkColor,
    veryDarkGreyColor,
    yellowColor,
} from "../../components/app/globals";
import { makeAutoObservable, runInAction } from "mobx";
import { useEffect, useState } from "react";
import { profiler } from "../../utils/profiler";
import { AutoSvg } from "../../components/svg/auto-svg/AutoSvg";
import { localStorageManager } from "../../utils/localStorage";
import YouTube, { YouTubePlayer } from "react-youtube";
import PlayerStates from "youtube-player/dist/constants/PlayerStates";
import {
    EllipseConstraint,
    RectConstraint,
} from "../../components/puzzle/constraints/decorative-shape/DecorativeShape";
import { ArrowConstraint } from "../../components/puzzle/constraints/arrow/Arrow";
import InputSlider from "react-input-slider";
import { useRaf } from "../../hooks/useRaf";
import { useDiffEffect } from "../../hooks/useDiffEffect";
import { VolumeUp } from "@emotion-icons/material";
import { DecorativeCageConstraint } from "../../components/puzzle/constraints/killer-cage/KillerCage";
import { ThermometerConstraint } from "../../components/puzzle/constraints/thermometer/Thermometer";
import { createCellsMapFromArray } from "../../types/puzzle/CellsMap";
import { translate } from "../../utils/translate";

(window as any).player = [];

class GlobalAudioState {
    activeId = "";
    volume = localStorageManager.getNumberManager<number>("audioVolume", 1);

    constructor() {
        makeAutoObservable(this);
    }
}
const globalState = new GlobalAudioState();

interface AudioProps extends Position {
    id: string;
    videoId: string;
    startTime: number;
}

const Audio = observer(function Audio({
    props: { id, videoId, startTime, ...position },
    context: { isReadonlyContext: isPreview },
}: ConstraintProps<NumberPTM, AudioProps>) {
    profiler.trace();

    const puzzleContainer = usePuzzleContainer(true);

    const [player, setPlayer] = useState<YouTubePlayer | undefined>();

    const [playerState, setPlayerState] = useState(PlayerStates.VIDEO_CUED);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const isPaused = ![PlayerStates.PLAYING, PlayerStates.BUFFERING, PlayerStates.UNSTARTED].includes(playerState);

    const { activeId, volume: volumeManager } = globalState;
    const volume = volumeManager.get();

    const isActive = activeId === id;
    useDiffEffect(
        async ([wasActive], [isActive]) => {
            if (!isActive && wasActive && player) {
                await player.pauseVideo();
                await player.seekTo(startTime, true);
            }
        },
        [isActive],
    );

    useEffect(() => {
        player?.setVolume(volume * 100);
    }, [player, volume]);

    useRaf(async () => {
        if (player) {
            setCurrentTime(await player.getCurrentTime());
        }
    });

    const playerHeight = (puzzleContainer?.height ?? 0) * 0.07;

    const playPauseButton = (player || isPreview) && (
        <>
            <circle
                r={0.25}
                stroke={veryDarkGreyColor}
                strokeWidth={0.03}
                fill={isActive ? lightGreyColor : "#fff"}
                style={{ cursor: "pointer", pointerEvents: "all" }}
                onClick={() => {
                    runInAction(() => {
                        globalState.activeId = id;
                    });

                    if (isPaused) {
                        player?.playVideo();
                    } else {
                        player?.pauseVideo();
                    }
                }}
            />

            {isPaused && (
                <path d={"M -0.07 -0.1 V 0.1 L 0.13 0 z"} fill={veryDarkGreyColor} strokeWidth={0} stroke={"none"} />
            )}
            {!isPaused && (
                <path
                    d={"M -0.05 -0.1 V 0.1 z M 0.05 -0.1 V 0.1 z"}
                    fill={"none"}
                    strokeWidth={0.03}
                    stroke={veryDarkGreyColor}
                />
            )}
        </>
    );

    // noinspection JSSuspiciousNameCombination
    return (
        <>
            <AutoSvg {...position}>{playPauseButton}</AutoSvg>

            {puzzleContainer &&
                createPortal(
                    <div
                        style={{
                            position: "absolute",
                            ...puzzleContainer,
                            display: isActive ? "block" : "none",
                            pointerEvents: "none",
                        }}
                    >
                        {!isPreview && (
                            <YouTube
                                videoId={videoId}
                                opts={{ playerVars: { start: startTime } }}
                                style={{ display: "none" }}
                                onReady={async ({ target }) => {
                                    setDuration(await target.getDuration());
                                    setPlayer(target);
                                }}
                                onStateChange={({ data }) => setPlayerState(data)}
                            />
                        )}

                        {player && (
                            <div
                                style={{
                                    position: "absolute",
                                    left: "5%",
                                    width: "90%",
                                    bottom: 0,
                                    height: playerHeight,
                                    backgroundColor: lighterGreyColor,
                                    pointerEvents: "all",
                                    display: "flex",
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 10,
                                }}
                            >
                                <svg width={playerHeight} height={playerHeight} viewBox={"-0.5 -0.5 1 1"}>
                                    {playPauseButton}
                                </svg>

                                <div style={{ flex: 1 }}>
                                    {duration !== 0 && (
                                        <InputSlider
                                            axis={"x"}
                                            x={currentTime}
                                            xmin={0}
                                            xmax={duration}
                                            xstep={0.1}
                                            onChange={({ x }) => {
                                                setCurrentTime(x);
                                                player.seekTo(x, true);
                                            }}
                                            styles={{
                                                track: {
                                                    width: "100%",
                                                    backgroundColor: darkGreyColor,
                                                },
                                            }}
                                        />
                                    )}
                                </div>

                                <div
                                    style={{
                                        position: "relative",
                                        width: playerHeight,
                                        height: playerHeight,
                                    }}
                                >
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: "20%",
                                        }}
                                    >
                                        <VolumeUp color={veryDarkGreyColor} />
                                    </div>

                                    <HiddenInputSlider>
                                        <InputSlider
                                            axis={"y"}
                                            y={volume}
                                            ymin={0}
                                            ymax={1}
                                            ystep={0.05}
                                            yreverse={true}
                                            onChange={({ y }) => {
                                                // InputSlider throws event with NaN when hiding the container
                                                if (Number.isFinite(y)) {
                                                    volumeManager.set(y);
                                                }
                                            }}
                                            styles={{ track: { height: "100%" } }}
                                        />
                                    </HiddenInputSlider>
                                </div>
                            </div>
                        )}
                    </div>,
                    document.body,
                )}
        </>
    );
});

const HiddenInputSlider = styled.div({
    display: "none",
    "div:hover > &": {
        display: "flex",
    },
    justifyContent: "center",
    position: "absolute",
    width: "100%",
    height: 100,
    bottom: "90%",
});

const AudioConstraint = (
    videoId: string,
    position: PositionLiteral,
    description: string,
    startTime = 0,
    id = videoId,
): Constraint<NumberPTM, AudioProps> => ({
    name: `audio: ${description}`,
    cells: [],
    component: { [GridLayer.interactive]: Audio },
    props: { id, videoId, startTime, ...parsePositionLiteral(position) },
});

const BoxConstraint = (cellLiterals: PositionLiteral[], color: string): Constraint<NumberPTM, any>[] => {
    const cells = parsePositionLiterals(cellLiterals);

    return [
        RectConstraint(
            cells,
            1.8,
            color,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            GridLayer.beforeBackground,
        ),
        AudioConstraint("LM8JhvfoqdA", cells[1], "Little Boxes", 13, "box-" + stringifyPosition(cells[0])),
    ];
};

const PillConstraint = (cells: PositionLiteral[]) => ArrowConstraint<NumberPTM>(cells, [], true);

const CageConstraint = (cells: PositionLiteral[], sum?: number) =>
    DecorativeCageConstraint(cells, sum, undefined, undefined, undefined, undefined, true);

export const Karaoke: PuzzleDefinition<NumberPTM> = {
    noIndex: true,
    slug: "karaoke-poc",
    extension: {},
    author: Chameleon,
    title: {
        [LanguageCode.en]: "Sudoke Karaoke",
    },
    typeManager: {
        ...DigitPuzzleTypeManager(),
        getCellTypeProps({ top }): CellTypeProps<NumberPTM> {
            return { isVisible: top < 9 };
        },
    },
    gridSize: {
        gridSize: 10,
        rowsCount: 10,
        columnsCount: 9,
        regionWidth: 3,
        regionHeight: 3,
    },
    regions: Regions9,
    digitsCount: 9,
    rules: () => (
        <>
            <RulesParagraph>{translate(normalSudokuRulesApply)}.</RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]: 'There are different clues in the grid with "play" buttons attached to them',
                })}
                .{" "}
                {translate({
                    [LanguageCode.en]: "Click the button to play a song that will explain the meaning of the clue",
                })}
                .
            </RulesParagraph>
            <RulesParagraph>
                {translate({
                    [LanguageCode.en]:
                        "Note: some of the clues have visuals of standard sudoku variant constraints, and some of the clues don't",
                })}
                .{" "}
                {translate({
                    [LanguageCode.en]:
                        "Please don't assume that the clue has standard notation, unless the attached song proves that",
                })}
                !
            </RulesParagraph>
        </>
    ),
    items: [
        AudioConstraint("DGEz_vJ6BTc", "R8C2.5", "Broken Arrows"),
        toDecorativeConstraint(ArrowConstraint("R7C1", ["R8C2", "R7C3"])),

        ...BoxConstraint(["R4C2", "R5C3"], pinkColor),
        ...BoxConstraint(["R2C5", "R3C6"], greenColor),
        ...BoxConstraint(["R5C7", "R6C8"], blueColor),
        ...BoxConstraint(["R7C4", "R8C5"], yellowColor),

        AudioConstraint("bpWZXkv7eAw", "R1.5C5", "Seventeen"),
        PillConstraint(["R1C4", "R1C5"]),

        AudioConstraint("boaJCrHNRMA", "R9.5C4", "Jenny Jenny"),
        PillConstraint(["R9C1", "R9C6"]),
        EllipseConstraint(["R9C5", "R9C6"], { width: 0.25, height: 0.45 }, "#fff", darkBlueColor, 0.06),

        AudioConstraint("t590jjWEJ5s", "R3.5C8", "'74 '75", 0, "74"),
        AudioConstraint("t590jjWEJ5s", "R4.5C9", "'74 '75", 0, "75"),
        PillConstraint(["R3C7", "R3C8"]),
        PillConstraint(["R4C8", "R4C9"]),

        // TODO: find better song (to not repeat Queen)
        AudioConstraint("2ZBtPf7FOoM", "R1.5C8", "Killer Queen", 7),
        CageConstraint(["R1C7", "R1C8"], 17),

        AudioConstraint("n1p8K7CdYVM", "R6.5C3", "WYSIWYG"),
        CageConstraint(["R6C2", "R6C3"], 17),

        AudioConstraint("0p_1QSUsbsM", "R5C5", "A kind of magic", 6),
        CageConstraint(["R4C4", "R4C5", "R4C6", "R5C4", "R5C5", "R5C6", "R6C4", "R6C5", "R6C6"]),

        AudioConstraint("X7JKdpsCxKs", "R10C8", "Rise above this"),
        toDecorativeConstraint(ThermometerConstraint(["R9C8", "R7C8"])),
    ],
    solution: createCellsMapFromArray([
        [6, 3, 4, 1, 7, 5, 9, 8, 2],
        [7, 9, 8, 3, 4, 2, 1, 5, 6],
        [2, 5, 1, 9, 8, 6, 7, 4, 3],
        [9, 4, 2, 6, 1, 8, 3, 7, 5],
        [1, 8, 6, 7, 5, 3, 4, 2, 9],
        [5, 7, 3, 2, 9, 4, 8, 6, 1],
        [3, 1, 5, 4, 2, 7, 6, 9, 8],
        [4, 2, 9, 8, 6, 1, 5, 3, 7],
        [8, 6, 7, 5, 3, 9, 2, 1, 4],
    ]),
    resultChecker: isValidFinishedPuzzleByEmbeddedSolution,
    allowDrawing: allDrawingModes,
};
