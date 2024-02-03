/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled/macro";
import {buildLink} from "../../utils/link";
import {Children, FC, FormEvent, ReactElement, useMemo, useRef, useState} from "react";
import {useBoolFromLocalStorage, useNumberFromLocalStorage, useStringFromLocalStorage} from "../../utils/localStorage";
import {detectTypeManagerByImportOptions, getPuzzleImportLoader} from "../../data/puzzles/Import";
import {useLanguageCode} from "../../hooks/useTranslate";
import {darkGreyColor, headerPadding} from "./globals";
import {allowedRulesHtmlTags} from "../sudoku/rules/ParsedRulesHtml";
import {usePureMemo} from "../../hooks/usePureMemo";
import {FieldPreview} from "../sudoku/field/FieldPreview";
import {useWindowSize} from "../../hooks/useWindowSize";
import {PageTitle} from "../layout/page-layout/PageLayout";
import {
    ColorsImportMode,
    PuzzleGridImportOptions,
    PuzzleImportDigitType,
    PuzzleImportOptions,
    PuzzleImportPuzzleType
} from "../../types/sudoku/PuzzleImportOptions";
import {loadPuzzle} from "../../types/sudoku/PuzzleDefinition";
import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";
import {GridParserFactory} from "../../data/puzzles/GridParser";
import {AnyPTM} from "../../types/sudoku/PuzzleTypeMap";
import {DigitSudokuTypeManager} from "../../sudokuTypes/default/types/DigitSudokuTypeManager";

let autoIncrement = 0;

const paragraphStyles = {margin: "1em 0"};
const Paragraph = styled("div")(paragraphStyles);
const FieldSet = styled("fieldset")({
    ...paragraphStyles,
    border: `1px solid ${darkGreyColor}`,
    borderRadius: 5,
    [`& > ${Paragraph}, & > &`]: {
        "&:first-of-type": {
            marginTop: 0,
        },
        "&:last-of-type": {
            marginBottom: 0,
        },
    }
});
const Details = styled("div")({marginTop: "0.25em", color: "#888"});
const Select = styled("select")({font: "inherit"});

interface WizardPageProps<T extends AnyPTM, JsonT> {
    load: string;
    slug: string;
    title: string;
    typeLabel: string;
    gridParserFactory: GridParserFactory<T, JsonT>;
}

export const WizardPage = observer(<T extends AnyPTM, JsonT>({load, slug, title, typeLabel, gridParserFactory}: WizardPageProps<T, JsonT>) => {
    const languageCode = useLanguageCode();

    const {width, height} = useWindowSize();
    const previewSize = Math.min(width, height) - 2 * headerPadding;

    const [type, setType] = useStringFromLocalStorage<PuzzleImportPuzzleType>("fpwType", PuzzleImportPuzzleType.Regular);
    const [digitType, setDigitType] = useStringFromLocalStorage<PuzzleImportDigitType>("fpwDigitType", PuzzleImportDigitType.Regular);
    const [areHtmlRules, setAreHtmlRules] = useBoolFromLocalStorage("fpwHtmlRules");
    const [loopX, setLoopX] = useBoolFromLocalStorage("fpwLoopX");
    const [loopY, setLoopY] = useBoolFromLocalStorage("fpwLoopY");
    const [isJss, setIsJss] = useBoolFromLocalStorage("fpwIsJss");
    const [rotatableClues, setRotatableClues] = useBoolFromLocalStorage("fpwRotatableClues");
    const [keepCircles, setKeepCircles] = useBoolFromLocalStorage("fpwKeepCircles");
    const [screws, setScrews] = useBoolFromLocalStorage("fpwScrews");
    const [sokoban, setSokoban] = useBoolFromLocalStorage("fpwSokoban");
    const [noSpecialRules, setNoSpecialRules] = useBoolFromLocalStorage("fpwNoSpecialRules");
    const [allowOverrideColors, setAllowOverrideColors] = useBoolFromLocalStorage("fpwAllowOverrideColors");
    const [fillableDigitalDisplay, setFillableDigitalDisplay] = useBoolFromLocalStorage("fpwFillableDigitalDisplay");
    const [tesseract, setTesseract] = useBoolFromLocalStorage("fpwTesseract");
    const [fillableQuads, setFillableQuads] = useBoolFromLocalStorage("fpwFillableQuads");
    const [find3, setFind3] = useBoolFromLocalStorage("fpwFind3");
    const [giftsInSight, setGiftsInSight] = useBoolFromLocalStorage("fpwGiftsInSight");
    const [productArrow, setProductArrow] = useBoolFromLocalStorage("fpwProductArrow");
    const [transparentArrowCircle, setTransparentArrowCircle] = useBoolFromLocalStorage("fpwTransparentArrowCircle");
    const [yajilinFog, setYajilinFog] = useBoolFromLocalStorage("fpwYajilinFog");
    const [cosmeticsBehindFog, setCosmeticsBehindFog] = useBoolFromLocalStorage("fpwCosmeticsBehindFog");
    const [safeCrackerCodeLength, setSafeCrackerCodeLength] = useNumberFromLocalStorage("fpwSafeCrackerCodeLength", 6);
    const [visibleRingsCount, setVisibleRingsCount] = useNumberFromLocalStorage("fpwVisibleRingsCount", 2);
    const [startOffset, setStartOffset] = useNumberFromLocalStorage("fpwStartOffset", 0);
    const [angleStep, setAngleStep] = useNumberFromLocalStorage("fpwAngleStep", 90);
    const [hasStickyJigsawPiece, setHasStickyJigsawPiece] = useBoolFromLocalStorage("fpwHasStickyJigsawPiece", false);
    const [stickyJigsawPiece, setStickyJigsawPiece] = useNumberFromLocalStorage("fpwStickyJigsawPiece", 1);
    const [shuffle, setShuffle] = useBoolFromLocalStorage("fpwShuffle", false);
    const [noPieceRegions, setNoPieceRegions] = useBoolFromLocalStorage("fpwNoPieceRegions", false);
    const [isFirstStickyGrid, setIsFirstStickyGrid] = useBoolFromLocalStorage("fpwIsFirstStickyGrid", true);
    const [noStickyRegionValidation, setNoStickyRegionValidation] = useBoolFromLocalStorage("fpwNoStickyRegionValidation");
    const [stickyDigits, setStickyDigits] = useBoolFromLocalStorage("fpwStickyDigits");
    const [splitUnconnectedRegions, setSplitUnconnectedRegions] = useBoolFromLocalStorage("fpwSplitUnconnectedRegions");
    const [givenDigitsBlockCars, setGivenDigitsBlockCars] = useBoolFromLocalStorage("fpwGivenDigitsBlockCars");
    const [supportZero, setSupportZero] = useBoolFromLocalStorage("fpwSupportZero");
    const [extraGrids, setExtraGrids] = useState<Required<PuzzleGridImportOptions>[]>([]);

    const isCalculator = digitType === PuzzleImportDigitType.Calculator;
    const isSafeCracker = type === PuzzleImportPuzzleType.SafeCracker;
    const isInfiniteRings = type === PuzzleImportPuzzleType.InfiniteRings;
    const isJigsaw = type === PuzzleImportPuzzleType.Jigsaw;
    const isTetris = type === PuzzleImportPuzzleType.Tetris;
    const isShuffled = type === PuzzleImportPuzzleType.Shuffled;
    const isJigsawLike = isJigsaw || isTetris || isShuffled;
    const isRushHour = type === PuzzleImportPuzzleType.RushHour;
    const isRotatableGrid = [
        PuzzleImportPuzzleType.Rotatable,
        PuzzleImportPuzzleType.Jigsaw,
        PuzzleImportPuzzleType.Tetris,
        PuzzleImportPuzzleType.RotatableCube,
    ].includes(type);
    const isSpecialGrid = isRotatableGrid || [
        PuzzleImportPuzzleType.Cubedoku,
        PuzzleImportPuzzleType.SafeCracker,
        PuzzleImportPuzzleType.InfiniteRings,
        PuzzleImportPuzzleType.RushHour,
        PuzzleImportPuzzleType.Shuffled,
    ].includes(type);
    const supportsExtraGrids = isJigsawLike || [
        PuzzleImportPuzzleType.Regular,
        PuzzleImportPuzzleType.RotatableCube,
    ].includes(type);
    const supportsJss = isRotatableGrid || (!isSpecialGrid && !loopX && !loopY);

    const finalAngleStep = isTetris ? 90 : isJigsaw ? angleStep || undefined : undefined;

    const filteredExtraGrids = useMemo(
        () => !supportsExtraGrids ? [] : extraGrids
            .map((grid) => ({
                ...grid,
                load: grid.load.split(/\?(?:load|puzzle)=/)[1] ?? grid.load,
            }))
            .filter(({load}) => load),
        [supportsExtraGrids, extraGrids]
    );
    const globalOffsetX = -Math.min(0, ...filteredExtraGrids.map(({offsetX}) => offsetX));
    const globalOffsetY = -Math.min(0, ...filteredExtraGrids.map(({offsetY}) => offsetY));

    const finalIsFirstGridSticky = isJigsawLike && filteredExtraGrids.length !== 0 && (isFirstStickyGrid || isShuffled);
    const gridParsers = useMemo(() => {
        const result = [gridParserFactory(load, globalOffsetX, globalOffsetY)];

        for (const extraGrid of extraGrids) {
            try {
                result.push(gridParserFactory(extraGrid.load, extraGrid.offsetX, extraGrid.offsetY));
            } catch (e) {
                console.error(e);
            }
        }

        return result;
    }, [load, globalOffsetX, globalOffsetY, extraGrids, gridParserFactory]);

    const {
        columnsCount,
        rowsCount,
        size: fieldSize,
        minDigit,
        maxDigit,
    } = gridParsers[0];
    const hasSolution = gridParsers.some((gridParser) => gridParser.hasSolution);
    const hasFog = gridParsers.some((gridParser) => gridParser.hasFog);
    const hasCosmeticElements = gridParsers.some((gridParser) => gridParser.hasCosmeticElements);
    const hasInitialColorsByGrid = gridParsers.some((gridParser) => gridParser.hasInitialColors);
    const hasSolutionColorsByGrid = gridParsers.some((gridParser) => gridParser.hasSolutionColors);
    const hasColors = hasInitialColorsByGrid || hasSolutionColorsByGrid;
    const hasArrows = gridParsers.some((gridParser) => gridParser.hasArrows);
    // Transparent arrow circles are always on for the rotatable clues puzzles, so don't allow to change the flag
    const transparentCirclesForced = rotatableClues;

    const [digitsCount, setDigitsCount] = useState(maxDigit ?? Math.min(fieldSize, 9));

    const [colorsImportModeState, setColorsImportMode] = useStringFromLocalStorage<ColorsImportMode>("fpwColorsImportMode", ColorsImportMode.Auto);

    const getHasInitialColors = (colorsImportMode: ColorsImportMode) => hasColors
        && colorsImportMode !== ColorsImportMode.Solution
        && (hasInitialColorsByGrid || colorsImportMode === ColorsImportMode.Initials);

    const getImportOptions = (colorsImportMode: ColorsImportMode): PuzzleImportOptions => ({
        type,
        digitType: digitType === PuzzleImportDigitType.Regular ? undefined : digitType,
        htmlRules: areHtmlRules,
        digitsCount: maxDigit === undefined && digitsCount === fieldSize && !filteredExtraGrids.length ? undefined : digitsCount,
        supportZero: minDigit === undefined && supportZero,
        fillableDigitalDisplay: isCalculator && fillableDigitalDisplay,
        loopX: !isSpecialGrid && loopX,
        loopY: !isSpecialGrid && loopY,
        jss: supportsJss && isJss,
        rotatableClues: !isSpecialGrid && rotatableClues,
        keepCircles: !isSpecialGrid && rotatableClues && keepCircles,
        screws: !isSpecialGrid && screws,
        sokoban: !isSpecialGrid && sokoban,
        tesseract: !isSpecialGrid && tesseract,
        fillableQuads: !isSpecialGrid && fillableQuads,
        find3,
        giftsInSight: find3 && giftsInSight,
        "product-arrow": hasArrows && productArrow,
        transparentArrowCircle: hasArrows && !transparentCirclesForced && transparentArrowCircle,
        yajilinFog: hasFog && yajilinFog,
        cosmeticsBehindFog: hasFog && cosmeticsBehindFog,
        safeCrackerCodeLength: isSafeCracker ? safeCrackerCodeLength : undefined,
        visibleRingsCount: isInfiniteRings ? (visibleRingsCount || (fieldSize / 2 - 1)) : undefined,
        startOffset: isInfiniteRings ? startOffset : undefined,
        noSpecialRules: !hasSolution && noSpecialRules,
        allowOverrideColors: getHasInitialColors(colorsImportMode) && allowOverrideColors,
        colorsImportMode: hasColors ? colorsImportMode : undefined,
        angleStep: finalAngleStep,
        shuffle: isJigsaw && filteredExtraGrids.length === 0 && shuffle,
        noPieceRegions: (isJigsawLike && noPieceRegions) || isShuffled,
        stickyRegion: finalIsFirstGridSticky ? {
            top: globalOffsetY,
            left: globalOffsetX,
            width: columnsCount,
            height: rowsCount,
        } : undefined,
        noStickyRegionValidation: finalIsFirstGridSticky && !isShuffled && noStickyRegionValidation,
        stickyDigits: !!finalAngleStep && stickyDigits,
        stickyJigsawPiece: isJigsaw && finalAngleStep && hasStickyJigsawPiece ? stickyJigsawPiece : undefined,
        splitUnconnectedRegions,
        givenDigitsBlockCars: isRushHour && givenDigitsBlockCars,
        load,
        offsetX: globalOffsetX !== 0 ? globalOffsetX : undefined,
        offsetY: globalOffsetY !== 0 ? globalOffsetY : undefined,
        extraGrids: filteredExtraGrids.map(({load, offsetX, offsetY}) => ({
            load,
            offsetX: offsetX + globalOffsetX,
            offsetY: offsetY + globalOffsetY,
        })),
    });

    const importOptionsPreview = usePureMemo<PuzzleImportOptions>(getImportOptions(colorsImportModeState));

    const typeManagerPreview = useMemo(() => {
        try {
            return detectTypeManagerByImportOptions(importOptionsPreview, gridParsers);
        } catch (e: unknown) {
            return DigitSudokuTypeManager();
        }
    }, [importOptionsPreview, gridParsers]);

    const colorsImportMode = typeManagerPreview.colorsImportMode ?? colorsImportModeState;

    const hasInitialColors = getHasInitialColors(colorsImportMode);
    const importOptions = usePureMemo<PuzzleImportOptions>(getImportOptions(colorsImportMode));

    const importedPuzzle = useMemo(() => {
        const version = ++autoIncrement;
        try {
            return {
                puzzle: loadPuzzle(getPuzzleImportLoader(slug, gridParserFactory), importOptions),
                version,
            };
        } catch (error: unknown) {
            console.error(error);
            return {
                puzzle: undefined,
                version,
            };
        }
    }, [importOptions, slug, gridParserFactory]);

    const handleSubmit = (ev: FormEvent) => {
        ev.preventDefault();

        window.location.hash = buildLink(slug, languageCode, importOptions);

        return false;
    };

    const isValidForm = !isInfiniteRings || visibleRingsCount !== 0;

    const isFPuzzles = slug === "f-puzzles";

    // eslint-disable-next-line no-script-url
    const copyIdBookmarkletCode = "javascript:(()=>{const d=document,b=d.body,e=d.createElement('input');e.value=exportPuzzle();b.append(e);e.select();d.execCommand('copy');e.remove();})()";

    return <div style={{
        display: "flex",
        flexDirection: width > height ? "row" : "column",
        gap: "1em",
    }}>
        <div style={{flex: 1, minWidth: 0}}>
            <PageTitle>{title}</PageTitle>

            <form onSubmit={handleSubmit}>
                <CollapsableFieldSet legend={"Puzzle type"}>
                    <Paragraph>
                        <label>
                            Grid type:&nbsp;
                            <Select value={type} onChange={ev => setType(ev.target.value as PuzzleImportPuzzleType)}>
                                <option value={PuzzleImportPuzzleType.Regular}>Regular</option>
                                <option value={PuzzleImportPuzzleType.Cubedoku}>Cubedoku</option>
                                <option value={PuzzleImportPuzzleType.RotatableCube}>Rotatable cube</option>
                                <option value={PuzzleImportPuzzleType.InfiniteRings}>Infinite loop</option>
                                <option value={PuzzleImportPuzzleType.Rotatable}>Rotatable</option>
                                <option value={PuzzleImportPuzzleType.SafeCracker}>Safe cracker</option>
                                <option value={PuzzleImportPuzzleType.Jigsaw}>Jigsaw</option>
                                <option value={PuzzleImportPuzzleType.Tetris}>Tetris</option>
                                <option value={PuzzleImportPuzzleType.Shuffled}>Shuffled</option>
                                <option value={PuzzleImportPuzzleType.RushHour}>Rush hour</option>
                            </Select>
                        </label>
                    </Paragraph>

                    {!isSpecialGrid && <>
                        <Paragraph>
                            <label>
                                Loop horizontally:&nbsp;
                                <input type={"checkbox"} checked={loopX} onChange={ev => setLoopX(ev.target.checked)}/>
                            </label>
                        </Paragraph>

                        <Paragraph>
                            <label>
                                Loop vertically:&nbsp;
                                <input type={"checkbox"} checked={loopY} onChange={ev => setLoopY(ev.target.checked)}/>
                            </label>
                        </Paragraph>
                    </>}

                    <Paragraph>
                        <label>
                            Digit type:&nbsp;
                            <Select value={digitType} onChange={ev => setDigitType(ev.target.value as PuzzleImportDigitType)}>
                                <option value={PuzzleImportDigitType.Regular}>Regular</option>
                                <option value={PuzzleImportDigitType.Calculator}>Calculator</option>
                                <option value={PuzzleImportDigitType.Latin}>Latin</option>
                            </Select>
                        </label>
                    </Paragraph>
                </CollapsableFieldSet>

                <CollapsableFieldSet legend={"Additional constraints"}>
                    {isCalculator && <Paragraph>
                        <label>
                            Fillable digital display:&nbsp;
                            <input type={"checkbox"} checked={fillableDigitalDisplay} onChange={ev => setFillableDigitalDisplay(ev.target.checked)}/>
                        </label>
                    </Paragraph>}

                    {supportsJss && <>
                        <Paragraph>
                            <label>
                                JSS:&nbsp;
                                <input type={"checkbox"} checked={isJss} onChange={ev => setIsJss(ev.target.checked)}/>
                            </label>
                        </Paragraph>
                    </>}

                    {!isSpecialGrid && <>
                        <Paragraph>
                            <label>
                                Rotatable clues:&nbsp;
                                <input type={"checkbox"} checked={rotatableClues} onChange={ev => setRotatableClues(ev.target.checked)}/>
                            </label>
                        </Paragraph>

                        {rotatableClues && <Paragraph>
                            <label>
                                Keep imported circle shapes and colors:&nbsp;
                                <input type={"checkbox"} checked={keepCircles} onChange={ev => setKeepCircles(ev.target.checked)}/>
                            </label>
                        </Paragraph>}

                        <Paragraph>
                            <label>
                                Screws:&nbsp;
                                <input type={"checkbox"} checked={screws} onChange={ev => setScrews(ev.target.checked)}/>
                            </label>
                        </Paragraph>

                        <Paragraph>
                            <label>
                                Sokoban:&nbsp;
                                <input type={"checkbox"} checked={sokoban} onChange={ev => setSokoban(ev.target.checked)}/>
                            </label>
                        </Paragraph>

                        <Paragraph>
                            <label>
                                Tesseract:&nbsp;
                                <input type={"checkbox"} checked={tesseract} onChange={ev => setTesseract(ev.target.checked)}/>
                            </label>
                        </Paragraph>

                        <Paragraph>
                            <label>
                                Fillable quadruples:&nbsp;
                                <input type={"checkbox"} checked={fillableQuads} onChange={ev => setFillableQuads(ev.target.checked)}/>
                            </label>
                        </Paragraph>
                    </>}

                    {hasArrows && <>
                        {!transparentCirclesForced && <Paragraph>
                            <label>
                                Transparent arrow circles:&nbsp;
                                <input type={"checkbox"} checked={transparentArrowCircle}
                                       onChange={ev => setTransparentArrowCircle(ev.target.checked)}/>
                            </label>
                        </Paragraph>}

                        <Paragraph>
                            <label>
                                Arrow circle is a product instead of a sum:&nbsp;
                                <input type={"checkbox"} checked={productArrow} onChange={ev => setProductArrow(ev.target.checked)}/>
                            </label>
                        </Paragraph>
                    </>}

                    {hasFog && <>
                        <Paragraph>
                            <label>
                                Yajilin fog:&nbsp;
                                <input type={"checkbox"} checked={yajilinFog} onChange={ev => setYajilinFog(ev.target.checked)}/>
                            </label>
                        </Paragraph>

                        {hasCosmeticElements && <Paragraph>
                            <label>
                                Hide cosmetic elements behind the fog:&nbsp;
                                <input type={"checkbox"} checked={cosmeticsBehindFog}
                                       onChange={ev => setCosmeticsBehindFog(ev.target.checked)}/>
                            </label>
                        </Paragraph>}
                    </>}

                    <Paragraph>
                        <label>
                            Find the 3 (gifts):&nbsp;
                            <input type={"checkbox"} checked={find3} onChange={ev => setFind3(ev.target.checked)}/>
                        </label>
                        {find3 && <label>
                            &nbsp; allow gifts only in sight of 3&nbsp;
                            <input type={"checkbox"} checked={giftsInSight} onChange={ev => setGiftsInSight(ev.target.checked)}/>
                        </label>}
                    </Paragraph>
                </CollapsableFieldSet>

                {isSafeCracker && <CollapsableFieldSet legend={"Safe cracker"}>
                    <Paragraph>
                        Code length:&nbsp;
                        <input
                            type={"number"}
                            value={safeCrackerCodeLength}
                            min={1}
                            max={fieldSize}
                            step={1}
                            onChange={ev => setSafeCrackerCodeLength(ev.target.valueAsNumber)}
                        />
                    </Paragraph>
                </CollapsableFieldSet>}

                {isInfiniteRings && <CollapsableFieldSet legend={"Infinite loop"}>
                    <Paragraph>
                        Visible rings count:&nbsp;
                        <Select value={visibleRingsCount} onChange={ev => setVisibleRingsCount(Number(ev.target.value))}>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={0}>all (preview only)</option>
                        </Select>
                    </Paragraph>

                    <Paragraph>
                        Initial zooming:&nbsp;
                        <input
                            type={"number"}
                            value={startOffset}
                            min={0}
                            max={fieldSize / 2 - 2}
                            step={1}
                            onChange={ev => setStartOffset(ev.target.valueAsNumber)}
                        />
                    </Paragraph>
                </CollapsableFieldSet>}

                {isJigsawLike && !isShuffled && <CollapsableFieldSet legend={type[0].toUpperCase() + type.substring(1)}>
                    {isJigsaw && <Paragraph>
                        Jigsaw piece rotation:&nbsp;
                        <Select value={angleStep} onChange={ev => setAngleStep(Number(ev.target.value))}>
                            <option value={0}>no rotation</option>
                            <option value={90}>90 degrees</option>
                            <option value={180}>180 degrees</option>
                        </Select>
                    </Paragraph>}

                    {!!finalAngleStep && <>
                        <Paragraph>
                            <label>
                                Digits should stay vertical:&nbsp;
                                <input type={"checkbox"} checked={stickyDigits} onChange={ev => setStickyDigits(ev.target.checked)}/>
                            </label>
                        </Paragraph>

                        {isJigsaw && <Paragraph>
                            <label>
                                Fixed jigsaw piece:&nbsp;
                                <input
                                    type={"checkbox"}
                                    checked={hasStickyJigsawPiece}
                                    onChange={ev => setHasStickyJigsawPiece(ev.target.checked)}
                                />
                            </label>&nbsp;
                            <input
                                type={"number"}
                                min={1}
                                step={1}
                                max={99}
                                value={stickyJigsawPiece}
                                onChange={ev => setStickyJigsawPiece(ev.target.valueAsNumber)}
                                disabled={!hasStickyJigsawPiece}
                            />
                            <Details>
                                When enabled, the selected jigsaw piece will be considered as "fixed".<br/>
                                The initial rotation of this piece will be treated as the correct rotation of the
                                jigsaw.
                            </Details>
                            <Details>
                                Note: the puzzle must have an embedded solution (at least for the digits)
                                for this feature to work properly.
                            </Details>
                        </Paragraph>}
                    </>}

                    {filteredExtraGrids.length !== 0 && <>
                        <Paragraph>
                            <label>
                                The first grid is sticky:&nbsp;
                                <input type={"checkbox"} checked={isFirstStickyGrid} onChange={ev => setIsFirstStickyGrid(ev.target.checked)}/>
                            </label>
                            <Details>
                                When enabled, the first grid will be treated as a regular sudoku grid instead of being split into jigsaw pieces.
                            </Details>
                        </Paragraph>

                        {finalIsFirstGridSticky && <Paragraph>
                            <label>
                                Don't validate the sticky grid:&nbsp;
                                <input type={"checkbox"} checked={noStickyRegionValidation}
                                       onChange={ev => setNoStickyRegionValidation(ev.target.checked)}/>
                            </label>
                            <Details>
                                When enabled, the digits and colors in the sticky grid will not affect the solution check
                                (so that the sticky grid is just a canvas to play around).
                            </Details>
                        </Paragraph>}
                    </>}

                    {isJigsaw && filteredExtraGrids.length === 0 && <Paragraph>
                        <label>
                            Shuffle:&nbsp;
                            <input type={"checkbox"} checked={shuffle} onChange={ev => setShuffle(ev.target.checked)}/>
                        </label>
                    </Paragraph>}

                    <Paragraph>
                        <label>
                            Treat {isTetris ? "tetris figures" : "jigsaw pieces"} as sudoku regions:&nbsp;
                            <input type={"checkbox"} checked={!noPieceRegions} onChange={ev => setNoPieceRegions(!ev.target.checked)}/>
                        </label>
                    </Paragraph>
                </CollapsableFieldSet>}

                {isRushHour && <CollapsableFieldSet legend={"Rush Hour"}>
                    <Paragraph>
                        <label>
                            Given digits block cars:&nbsp;
                            <input
                                type={"checkbox"}
                                checked={givenDigitsBlockCars}
                                onChange={ev => setGivenDigitsBlockCars(ev.target.checked)}
                            />
                        </label>
                    </Paragraph>
                </CollapsableFieldSet>}

                <CollapsableFieldSet legend={"Miscellaneous"}>
                    {(maxDigit === undefined || minDigit === undefined) && <Paragraph>
                        {maxDigit === undefined && <label>
                            Digits count:&nbsp;
                            <input
                                type={"number"}
                                value={digitsCount}
                                min={1}
                                max={Math.min(fieldSize, 9)}
                                step={1}
                                onChange={ev => setDigitsCount(ev.target.valueAsNumber)}
                            />
                        </label>}
                        &nbsp;
                        {minDigit === undefined && <label>
                            Support zero:&nbsp;
                            <input type={"checkbox"} checked={supportZero} onChange={ev => setSupportZero(ev.target.checked)}/>
                        </label>}
                    </Paragraph>}

                    <Paragraph>
                        <label>
                            Rules are HTML:&nbsp;
                            <input type={"checkbox"} checked={areHtmlRules} onChange={ev => setAreHtmlRules(ev.target.checked)}/>
                        </label>
                        {areHtmlRules && <Details>
                            Notes:
                            <ul style={{margin: 0}}>
                                <li>
                                    Line breaks in the text will <strong>not</strong> be applied automatically in the HTML mode.
                                    Please use the <code>&lt;p&gt;</code> tag for paragraphs.
                                </li>
                                <li>
                                    The following HTML tags are allowed: <code>{allowedRulesHtmlTags.join(", ")}</code>.<br/>
                                    Tag attributes are not supported and will be stripped,
                                    except for the common attributes of <code>&lt;a&gt;</code> and <code>&lt;img&gt;</code> tags.<br/>
                                    Please <a href={buildLink("contacts", languageCode)} target={"_blank"}>contact the site creator</a>{" "}
                                    to add support for other tags or attributes.
                                </li>
                            </ul>
                        </Details>}
                    </Paragraph>

                    <Paragraph>
                        <label>
                            Split unconnected regions:&nbsp;
                            <input type={"checkbox"} checked={splitUnconnectedRegions} onChange={ev => setSplitUnconnectedRegions(ev.target.checked)}/>
                        </label>
                        <Details>
                            If multiple cells marked as the same region in {typeLabel}, but not connected to each other,
                            treat them as different regions.
                        </Details>
                    </Paragraph>

                    {hasColors && !typeManagerPreview.colorsImportMode && <Paragraph>
                        <label>
                            Import colors as:&nbsp;
                            <Select value={colorsImportMode} onChange={ev => setColorsImportMode(ev.target.value as ColorsImportMode)}>
                                <option value={ColorsImportMode.Auto}>based on input</option>
                                <option value={ColorsImportMode.Initials}>initial colors</option>
                                <option value={ColorsImportMode.Solution}>solution colors</option>
                            </Select>
                        </label>
                    </Paragraph>}

                    {hasInitialColors && <Paragraph>
                        <label>
                            Allow overriding initial colors:&nbsp;
                            <input type={"checkbox"} checked={allowOverrideColors} onChange={ev => setAllowOverrideColors(ev.target.checked)}/>
                        </label>
                    </Paragraph>}

                    {!hasSolution && <Paragraph>
                        <label>
                            Verify the solution based on the conflict checker:&nbsp;
                            <input type={"checkbox"} checked={noSpecialRules} onChange={ev => setNoSpecialRules(ev.target.checked)}/>
                        </label>
                        <Details>
                            When enabled, the software will say that the puzzle was solved correctly as soon as all digits are fulfilled
                            and there are no conflicts for the standard constraints included in the puzzle.
                        </Details>
                        <Details>
                            Please don't enable it when the puzzle contains non-standard constraints or rules
                            that cannot be verified by the conflict checker!
                            (also, it's recommended to include the embedded solution in this case)
                        </Details>
                    </Paragraph>}
                </CollapsableFieldSet>

                {supportsExtraGrids && <CollapsableFieldSet legend={"Import extra grids"}>
                    <Paragraph>
                        <ul>
                            {extraGrids.map((grid, index) => {
                                const mergeCurrentItem = (updates: Partial<PuzzleGridImportOptions>) => setExtraGrids([
                                    ...extraGrids.slice(0, index),
                                    {
                                        ...grid,
                                        ...updates,
                                    },
                                    ...extraGrids.slice(index + 1),
                                ]);

                                return <li key={`extra-grid-${index}`}>
                                    <Paragraph>
                                        <label>
                                            {typeLabel} link or ID:&nbsp;
                                            <input type={"text"} value={grid.load}
                                                   onChange={ev => mergeCurrentItem({load: ev.target.value})}/>
                                        </label>
                                    </Paragraph>

                                    <Paragraph>
                                        <label>
                                            Offset X:&nbsp;
                                            <input type={"number"} step={1} value={grid.offsetX}
                                                   onChange={ev => mergeCurrentItem({offsetX: ev.target.valueAsNumber})}/>
                                        </label>
                                    </Paragraph>

                                    <Paragraph>
                                        <label>
                                            Offset Y:&nbsp;
                                            <input type={"number"} step={1} value={grid.offsetY}
                                                   onChange={ev => mergeCurrentItem({offsetY: ev.target.valueAsNumber})}/>
                                        </label>
                                    </Paragraph>

                                    <Paragraph>
                                        <button
                                            type={"button"}
                                            onClick={() => setExtraGrids([
                                                ...extraGrids.slice(0, index),
                                                ...extraGrids.slice(index + 1),
                                            ])}
                                        >
                                            Remove
                                        </button>
                                    </Paragraph>
                                </li>;
                            })}

                            <li key={`extra-grid-${extraGrids.length}`}>
                                <Paragraph>
                                    <label>
                                        {typeLabel} link or ID:&nbsp;
                                        <input type={"text"} value={""} onChange={ev => setExtraGrids([
                                            ...extraGrids,
                                            {
                                                load: ev.target.value,
                                                offsetX: columnsCount + 1,
                                                offsetY: 0,
                                            },
                                        ])}/>
                                    </label>
                                    <Details>
                                        Create the additional grid in {typeLabel}{isFPuzzles && ', then click "Export" and "Open With Link"'}.
                                        Copy the link of the page {isFPuzzles && "that opened in the tab"} to here.
                                    </Details>
                                    {isFPuzzles && <>
                                        <Details>
                                            Alternative: copy the {typeLabel} ID to the clipboard by installing and using
                                            this bookmarklet: <a href={copyIdBookmarkletCode}>Copy {typeLabel} ID</a>.
                                        </Details>
                                        <Details>
                                            <strong>Important!</strong> Please don't copy the "compressed" link, it will not work!
                                            Also, If you edited the puzzle, it's a must to use the "open with link" feature
                                            (because the link of the current {typeLabel} tab doesn't include the latest information).
                                        </Details>
                                    </>}
                                </Paragraph>
                            </li>
                        </ul>
                    </Paragraph>
                </CollapsableFieldSet>}

                <Paragraph>
                    <button type={"submit"} disabled={!isValidForm}>Load</button>
                </Paragraph>
            </form>
        </div>

        <FieldPreview
            key={importedPuzzle.version}
            puzzle={importedPuzzle.puzzle}
            width={previewSize}
        />
    </div>;
}) as <T extends AnyPTM, JsonT>(props: WizardPageProps<T, JsonT>) => ReactElement;

interface CollapsableFieldSetProps {
    legend: string;
}
const CollapsableFieldSet: FC<CollapsableFieldSetProps> = observer(function CollapsableFieldSet({legend, children}) {
    profiler.trace();

    const [open, setOpen] = useState(true);
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const doOpen = () => {
        if (detailsRef.current) {
            detailsRef.current.open = true;
            setOpen(true);
        }
    };

    if (!Children.toArray(children).some(Boolean)) {
        return null;
    }

    return <FieldSet>
        <legend>
            <details
                ref={detailsRef}
                open={open}
                onToggle={(ev) => setOpen((ev.target as HTMLDetailsElement).open)}
            >
                <summary>{legend}</summary>
            </details>
        </legend>

        {open ? children : <button type={"button"} onClick={doOpen}>Show collapsed options</button>}
    </FieldSet>;
});
