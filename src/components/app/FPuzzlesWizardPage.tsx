/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import {buildLink} from "../../utils/link";
import {FormEvent, useMemo, useState} from "react";
import {useBoolFromLocalStorage, useNumberFromLocalStorage, useStringFromLocalStorage} from "../../utils/localStorage";
import {decodeFPuzzlesString, FPuzzles} from "../../data/puzzles/FPuzzles";
import {useLanguageCode, useTranslate} from "../../hooks/useTranslate";
import {headerPadding, veryDarkGreyColor} from "./globals";
import {allowedRulesHtmlTags} from "../sudoku/rules/ParsedRulesHtml";
import {usePureMemo} from "../../hooks/usePureMemo";
import {FieldPreview} from "../sudoku/field/FieldPreview";
import {useWindowSize} from "../../hooks/useWindowSize";
import {PageTitle} from "../layout/page-layout/PageLayout";
import {
    PuzzleGridImportOptions,
    PuzzleImportDigitType,
    PuzzleImportOptions,
    PuzzleImportPuzzleType
} from "../../types/sudoku/PuzzleImportOptions";
import {loadPuzzle} from "../../types/sudoku/PuzzleDefinition";

export const fPuzzlesWizardPageTitle = "Import from f-puzzles";

let autoIncrement = 0;

const Paragraph = styled("div")({margin: "1em 0"});
const Details = styled("div")({marginTop: "0.25em", color: veryDarkGreyColor});
const Select = styled("select")({font: "inherit"});

interface FPuzzlesWizardPageProps {
    load: string;
}

export const FPuzzlesWizardPage = ({load}: FPuzzlesWizardPageProps) => {
    const languageCode = useLanguageCode();
    const translate = useTranslate();

    const {width, height} = useWindowSize();
    const previewSize = Math.min(width, height) - 2 * headerPadding;

    const puzzle = useMemo(() => decodeFPuzzlesString(load), [load]);

    const [type, setType] = useStringFromLocalStorage<PuzzleImportPuzzleType>("fpwType", PuzzleImportPuzzleType.Regular);
    const [digitType, setDigitType] = useStringFromLocalStorage<PuzzleImportDigitType>("fpwDigitType", PuzzleImportDigitType.Regular);
    const [digitsCount, setDigitsCount] = useState(Math.min(puzzle.size, 9));
    const [areHtmlRules, setAreHtmlRules] = useBoolFromLocalStorage("fpwHtmlRules");
    const [loopX, setLoopX] = useBoolFromLocalStorage("fpwLoopX");
    const [loopY, setLoopY] = useBoolFromLocalStorage("fpwLoopY");
    const [isJss, setIsJss] = useBoolFromLocalStorage("fpwIsJss");
    const [noSpecialRules, setNoSpecialRules] = useBoolFromLocalStorage("fpwNoSpecialRules");
    const [allowOverrideColors, setAllowOverrideColors] = useBoolFromLocalStorage("fpwAllowOverrideColors");
    const [fillableDigitalDisplay, setFillableDigitalDisplay] = useBoolFromLocalStorage("fpwFillableDigitalDisplay");
    const [tesseract, setTesseract] = useBoolFromLocalStorage("fpwTesseract");
    const [productArrow, setProductArrow] = useBoolFromLocalStorage("fpwProductArrow");
    const [yajilinFog, setYajilinFog] = useBoolFromLocalStorage("fpwYajilinFog");
    const [cosmeticsBehindFog, setCosmeticsBehindFog] = useBoolFromLocalStorage("fpwCosmeticsBehindFog");
    const [safeCrackerCodeLength, setSafeCrackerCodeLength] = useNumberFromLocalStorage("fpwSafeCrackerCodeLength", 6);
    const [visibleRingsCount, setVisibleRingsCount] = useNumberFromLocalStorage("fpwVisibleRingsCount", 2);
    const [startOffset, setStartOffset] = useNumberFromLocalStorage("fpwStartOffset", 0);
    const [angleStep, setAngleStep] = useNumberFromLocalStorage("fpwAngleStep", 90);
    const [shuffle, setShuffle] = useBoolFromLocalStorage("fpwShuffle", true);
    const [isFirstStickyGrid, setIsFirstStickyGrid] = useBoolFromLocalStorage("fpwIsFirstStickyGrid", true);
    const [stickyDigits, setStickyDigits] = useBoolFromLocalStorage("fpwStickyDigits");
    const [extraGrids, setExtraGrids] = useState<Required<PuzzleGridImportOptions>[]>([]);

    const isCalculator = digitType === PuzzleImportDigitType.Calculator;
    const isSafeCracker = type === PuzzleImportPuzzleType.SafeCracker;
    const isInfiniteRings = type === PuzzleImportPuzzleType.InfiniteRings;
    const isJigsaw = type === PuzzleImportPuzzleType.Jigsaw;
    const isRotatableGrid = [
        PuzzleImportPuzzleType.Rotatable,
        PuzzleImportPuzzleType.Jigsaw,
    ].includes(type);
    const isSpecialGrid = isRotatableGrid || [
        PuzzleImportPuzzleType.Cubedoku,
        PuzzleImportPuzzleType.SafeCracker,
        PuzzleImportPuzzleType.InfiniteRings,
    ].includes(type);
    const supportsExtraGrids = [
        PuzzleImportPuzzleType.Regular,
        PuzzleImportPuzzleType.Jigsaw,
    ].includes(type);
    const supportsJss = isRotatableGrid || (!isSpecialGrid && !loopX && !loopY);
    const hasSolution = !!puzzle.solution;
    const hasFog = !!(puzzle.fogofwar || puzzle.foglight);
    const hasCosmeticElements = !!(puzzle.text?.length || puzzle.line?.length || puzzle.rectangle?.length || puzzle.circle?.length || puzzle.cage?.length);
    const hasInitialColors = puzzle.grid.some(row => row.some(cell => cell.c || cell.cArray?.length));

    const filteredExtraGrids = useMemo(
        () => !supportsExtraGrids ? [] : extraGrids
            .map((grid) => ({
                ...grid,
                load: grid.load.split("?load=")[1] ?? grid.load,
            }))
            .filter(({load}) => load),
        [supportsExtraGrids, extraGrids]
    );
    const globalOffsetX = -Math.min(0, ...filteredExtraGrids.map(({offsetX}) => offsetX));
    const globalOffsetY = -Math.min(0, ...filteredExtraGrids.map(({offsetY}) => offsetY));

    const importOptions = usePureMemo<PuzzleImportOptions>({
        type,
        digitType: digitType === PuzzleImportDigitType.Regular ? undefined : digitType,
        htmlRules: areHtmlRules,
        digitsCount: digitsCount === puzzle.size && !filteredExtraGrids.length ? undefined : digitsCount,
        fillableDigitalDisplay: isCalculator && fillableDigitalDisplay,
        loopX: !isSpecialGrid && loopX,
        loopY: !isSpecialGrid && loopY,
        jss: supportsJss && isJss,
        tesseract: !isSpecialGrid && tesseract,
        "product-arrow": !!puzzle.arrow && productArrow,
        yajilinFog: hasFog && yajilinFog,
        cosmeticsBehindFog: hasFog && cosmeticsBehindFog,
        safeCrackerCodeLength: isSafeCracker ? safeCrackerCodeLength : undefined,
        visibleRingsCount: isInfiniteRings ? (visibleRingsCount || (puzzle.size / 2 - 1)) : undefined,
        startOffset: isInfiniteRings ? startOffset : undefined,
        noSpecialRules: !hasSolution && noSpecialRules,
        allowOverrideColors: hasInitialColors && allowOverrideColors,
        angleStep: isJigsaw ? angleStep || undefined : undefined,
        shuffle: isJigsaw && shuffle,
        stickyRegion: isJigsaw && filteredExtraGrids.length !== 0 && isFirstStickyGrid ? {
            top: globalOffsetY,
            left: globalOffsetX,
            width: puzzle.size,
            height: puzzle.size,
        } : undefined,
        stickyDigits: isJigsaw && angleStep !== 0 && stickyDigits,
        load,
        offsetX: globalOffsetX !== 0 ? globalOffsetX : undefined,
        offsetY: globalOffsetY !== 0 ? globalOffsetY : undefined,
        extraGrids: filteredExtraGrids.map(({load, offsetX, offsetY}) => ({
            load,
            offsetX: offsetX + globalOffsetX,
            offsetY: offsetY + globalOffsetY,
        })),
    });

    const importedPuzzle = useMemo(() => {
        const version = ++autoIncrement;
        try {
            return {
                puzzle: loadPuzzle(FPuzzles, importOptions),
                version,
            };
        } catch (error: unknown) {
            console.error(error);
            return {
                puzzle: undefined,
                version,
            };
        }
    }, [importOptions]);

    const handleSubmit = (ev: FormEvent) => {
        ev.preventDefault();

        window.location.hash = buildLink("f-puzzles", languageCode, importOptions);

        return false;
    };

    const isValidForm = !isInfiniteRings || visibleRingsCount !== 0;

    // eslint-disable-next-line no-script-url
    const copyIdBookmarkletCode = "javascript:(()=>{const d=document,b=d.body,e=d.createElement('input');e.value=exportPuzzle();b.append(e);e.select();d.execCommand('copy');e.remove();})()";

    return <div style={{
        display: "flex",
        flexDirection: width > height ? "row" : "column",
        gap: "1em",
    }}>
        <div style={{flex: 1, minWidth: 0}}>
            <PageTitle>{translate(fPuzzlesWizardPageTitle)}</PageTitle>

            <form onSubmit={handleSubmit}>
                <Paragraph>
                    <label>
                        Grid type:&nbsp;
                        <Select value={type} onChange={ev => setType(ev.target.value as PuzzleImportPuzzleType)}>
                            <option value={PuzzleImportPuzzleType.Regular}>Regular</option>
                            <option value={PuzzleImportPuzzleType.Cubedoku}>Cubedoku</option>
                            <option value={PuzzleImportPuzzleType.InfiniteRings}>Infinite rings</option>
                            <option value={PuzzleImportPuzzleType.Rotatable}>Rotatable</option>
                            <option value={PuzzleImportPuzzleType.SafeCracker}>Safe cracker</option>
                            <option value={PuzzleImportPuzzleType.Jigsaw}>Jigsaw</option>
                        </Select>
                    </label>
                </Paragraph>

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

                <Paragraph>
                    Digits count:&nbsp;
                    <input
                        type={"number"}
                        value={digitsCount}
                        min={1}
                        max={Math.max(puzzle.size, 9)}
                        step={1}
                        onChange={ev => setDigitsCount(ev.target.valueAsNumber)}
                    />
                </Paragraph>

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

                {isCalculator && <Paragraph>
                    <label>
                        Fillable digital display:&nbsp;
                        <input type={"checkbox"} checked={fillableDigitalDisplay} onChange={ev => setFillableDigitalDisplay(ev.target.checked)}/>
                    </label>
                </Paragraph>}

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

                    <Paragraph>
                        <label>
                            Tesseract constraint:&nbsp;
                            <input type={"checkbox"} checked={tesseract} onChange={ev => setTesseract(ev.target.checked)}/>
                        </label>
                    </Paragraph>
                </>}

                {supportsJss && <>
                    <Paragraph>
                        <label>
                            JSS:&nbsp;
                            <input type={"checkbox"} checked={isJss} onChange={ev => setIsJss(ev.target.checked)}/>
                        </label>
                    </Paragraph>
                </>}

                {!!puzzle.arrow && <Paragraph>
                    <label>
                        Arrow circle is a product instead of a sum:&nbsp;
                        <input type={"checkbox"} checked={productArrow} onChange={ev => setProductArrow(ev.target.checked)}/>
                    </label>
                </Paragraph>}

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

                {isSafeCracker && <Paragraph>
                    Safe cracker code length:&nbsp;
                    <input
                        type={"number"}
                        value={safeCrackerCodeLength}
                        min={1}
                        max={puzzle.size}
                        step={1}
                        onChange={ev => setSafeCrackerCodeLength(ev.target.valueAsNumber)}
                    />
                </Paragraph>}

                {isInfiniteRings && <>
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
                            max={puzzle.size / 2 - 2}
                            step={1}
                            onChange={ev => setStartOffset(ev.target.valueAsNumber)}
                        />
                    </Paragraph>
                </>}

                {isJigsaw && <>
                    <Paragraph>
                        Jigsaw piece rotation:&nbsp;
                        <Select value={angleStep} onChange={ev => setAngleStep(Number(ev.target.value))}>
                            <option value={0}>no rotation</option>
                            <option value={90}>90 degrees</option>
                            <option value={180}>180 degrees</option>
                        </Select>
                    </Paragraph>

                    {angleStep !== 0 && <Paragraph>
                        <label>
                            Digits should stay vertical:&nbsp;
                            <input type={"checkbox"} checked={stickyDigits} onChange={ev => setStickyDigits(ev.target.checked)}/>
                        </label>
                    </Paragraph>}

                    {filteredExtraGrids.length !== 0 && <Paragraph>
                        <label>
                            The first grid is sticky:&nbsp;
                            <input type={"checkbox"} checked={isFirstStickyGrid} onChange={ev => setIsFirstStickyGrid(ev.target.checked)}/>
                        </label>
                        <Details>
                            When enabled, the first grid will be treated as a regular sudoku grid instead of being split into jigsaw pieces.
                        </Details>
                    </Paragraph>}

                    <Paragraph>
                        <label>
                            Shuffle:&nbsp;
                            <input type={"checkbox"} checked={shuffle} onChange={ev => setShuffle(ev.target.checked)}/>
                        </label>
                    </Paragraph>
                </>}

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

                {supportsExtraGrids && <Paragraph>
                    Import extra grids:
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
                                        F-Puzzles link or ID:&nbsp;
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
                                    F-Puzzles link or ID:&nbsp;
                                    <input type={"text"} value={""} onChange={ev => setExtraGrids([
                                        ...extraGrids,
                                        {
                                            load: ev.target.value,
                                            offsetX: puzzle.size + 1,
                                            offsetY: 0,
                                        },
                                    ])}/>
                                </label>
                                <Details>
                                    Create the additional grid in F-Puzzles, then click "Export" and "Open With Link".
                                    Copy the link of the page that opened in the tab to here.
                                </Details>
                                <Details>
                                    Alternative: copy the f-puzzles ID to the clipboard by installing and using this bookmarklet: <a href={copyIdBookmarkletCode}>Copy f-puzzles ID</a>.
                                </Details>
                                <Details>
                                    <strong>Important!</strong> Please don't copy the "compressed" link, it will not work!
                                    Also, If you edited the puzzle, it's a must to use the "open with link" feature
                                    (because the link of the current f-puzzles tab doesn't include the latest
                                    information).
                                </Details>
                            </Paragraph>
                        </li>
                    </ul>
                </Paragraph>}

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
};
