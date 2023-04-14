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
    PuzzleImportDigitType,
    PuzzleImportOptions,
    PuzzleImportPuzzleType
} from "../../types/sudoku/PuzzleImportOptions";
import {loadPuzzle} from "../../types/sudoku/PuzzleDefinition";

export const fPuzzlesWizardPageTitle = "Import from f-puzzles";

let autoIncrement = 0;

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

    const isCalculator = digitType === PuzzleImportDigitType.Calculator;
    const isSafeCracker = type === PuzzleImportPuzzleType.SafeCracker;
    const isInfiniteRings = type === PuzzleImportPuzzleType.InfiniteRings;
    const isJigsaw = type === PuzzleImportPuzzleType.Jigsaw;
    const isSpecialGrid = [
        PuzzleImportPuzzleType.Cubedoku,
        PuzzleImportPuzzleType.Rotatable,
        PuzzleImportPuzzleType.SafeCracker,
        PuzzleImportPuzzleType.InfiniteRings,
        PuzzleImportPuzzleType.Jigsaw,
    ].includes(type);
    const hasSolution = !!puzzle.solution;
    const hasFog = !!(puzzle.fogofwar || puzzle.foglight);
    const hasCosmeticElements = !!(puzzle.text?.length || puzzle.line?.length || puzzle.rectangle?.length || puzzle.circle?.length || puzzle.cage?.length);
    const hasInitialColors = puzzle.grid.some(row => row.some(cell => cell.c || cell.cArray?.length));

    const importOptions = usePureMemo<PuzzleImportOptions>({
        type,
        digitType: digitType === PuzzleImportDigitType.Regular ? undefined : digitType,
        htmlRules: areHtmlRules,
        digitsCount: digitsCount === puzzle.size ? undefined : digitsCount,
        fillableDigitalDisplay: isCalculator && fillableDigitalDisplay,
        loopX: !isSpecialGrid && loopX,
        loopY: !isSpecialGrid && loopY,
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
        load,
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

    return <div style={{
        display: "flex",
        flexDirection: width > height ? "row" : "column",
        gap: "1em",
    }}>
        <div style={{flex: 1, minWidth: 0}}>
            <PageTitle>{translate(fPuzzlesWizardPageTitle)}</PageTitle>

            <form onSubmit={handleSubmit}>
                <p>
                    <label>
                        Grid type:&nbsp;
                        <select value={type} onChange={ev => setType(ev.target.value as PuzzleImportPuzzleType)} style={{font: "inherit"}}>
                            <option value={PuzzleImportPuzzleType.Regular}>Regular</option>
                            <option value={PuzzleImportPuzzleType.Cubedoku}>Cubedoku</option>
                            <option value={PuzzleImportPuzzleType.InfiniteRings}>Infinite rings</option>
                            <option value={PuzzleImportPuzzleType.Rotatable}>Rotatable</option>
                            <option value={PuzzleImportPuzzleType.SafeCracker}>Safe cracker</option>
                            <option value={PuzzleImportPuzzleType.Jigsaw}>Jigsaw</option>
                        </select>
                    </label>
                </p>

                <p>
                    <label>
                        Digit type:&nbsp;
                        <select value={digitType} onChange={ev => setDigitType(ev.target.value as PuzzleImportDigitType)} style={{font: "inherit"}}>
                            <option value={PuzzleImportDigitType.Regular}>Regular</option>
                            <option value={PuzzleImportDigitType.Calculator}>Calculator</option>
                            <option value={PuzzleImportDigitType.Latin}>Latin</option>
                        </select>
                    </label>
                </p>

                <p>
                    Digits count:&nbsp;
                    <input
                        type={"number"}
                        value={digitsCount}
                        min={1}
                        max={Math.max(puzzle.size, 9)}
                        step={1}
                        onChange={ev => setDigitsCount(ev.target.valueAsNumber)}
                    />
                </p>

                <p>
                    <label>
                        Rules are HTML:&nbsp;
                        <input type={"checkbox"} checked={areHtmlRules} onChange={ev => setAreHtmlRules(ev.target.checked)}/>
                    </label>
                    {areHtmlRules && <div style={{marginTop: "0.25em", color: veryDarkGreyColor}}>
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
                    </div>}
                </p>

                {isCalculator && <p>
                    <label>
                        Fillable digital display:&nbsp;
                        <input type={"checkbox"} checked={fillableDigitalDisplay} onChange={ev => setFillableDigitalDisplay(ev.target.checked)}/>
                    </label>
                </p>}

                {!isSpecialGrid && <>
                    <p>
                        <label>
                            Loop horizontally:&nbsp;
                            <input type={"checkbox"} checked={loopX} onChange={ev => setLoopX(ev.target.checked)}/>
                        </label>
                    </p>

                    <p>
                        <label>
                            Loop vertically:&nbsp;
                            <input type={"checkbox"} checked={loopY} onChange={ev => setLoopY(ev.target.checked)}/>
                        </label>
                    </p>

                    <p>
                        <label>
                            Tesseract constraint:&nbsp;
                            <input type={"checkbox"} checked={tesseract} onChange={ev => setTesseract(ev.target.checked)}/>
                        </label>
                    </p>
                </>}

                {!!puzzle.arrow && <p>
                    <label>
                        Arrow circle is a product instead of a sum:&nbsp;
                        <input type={"checkbox"} checked={productArrow} onChange={ev => setProductArrow(ev.target.checked)}/>
                    </label>
                </p>}

                {hasFog && <>
                    <p>
                        <label>
                            Yajilin fog:&nbsp;
                            <input type={"checkbox"} checked={yajilinFog} onChange={ev => setYajilinFog(ev.target.checked)}/>
                        </label>
                    </p>

                    {hasCosmeticElements && <p>
                        <label>
                            Hide cosmetic elements behind the fog:&nbsp;
                            <input type={"checkbox"} checked={cosmeticsBehindFog}
                                   onChange={ev => setCosmeticsBehindFog(ev.target.checked)}/>
                        </label>
                    </p>}
                </>}

                {isSafeCracker && <p>
                    Safe cracker code length:&nbsp;
                    <input
                        type={"number"}
                        value={safeCrackerCodeLength}
                        min={1}
                        max={puzzle.size}
                        step={1}
                        onChange={ev => setSafeCrackerCodeLength(ev.target.valueAsNumber)}
                    />
                </p>}

                {isInfiniteRings && <>
                    <p>
                        Visible rings count:&nbsp;
                        <select value={visibleRingsCount} onChange={ev => setVisibleRingsCount(Number(ev.target.value))} style={{font: "inherit"}}>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={0}>all (preview only)</option>
                        </select>
                    </p>

                    <p>
                        Initial zooming:&nbsp;
                        <input
                            type={"number"}
                            value={startOffset}
                            min={0}
                            max={puzzle.size / 2 - 2}
                            step={1}
                            onChange={ev => setStartOffset(ev.target.valueAsNumber)}
                        />
                    </p>
                </>}

                {isJigsaw && <>
                    <p>
                        Rotation:&nbsp;
                        <select value={angleStep} onChange={ev => setAngleStep(Number(ev.target.value))} style={{font: "inherit"}}>
                            <option value={0}>no rotation</option>
                            <option value={90}>90 degrees</option>
                            <option value={180}>180 degrees</option>
                        </select>
                    </p>
                </>}

                {hasInitialColors && <p>
                    <label>
                        Allow overriding initial colors:&nbsp;
                        <input type={"checkbox"} checked={allowOverrideColors} onChange={ev => setAllowOverrideColors(ev.target.checked)}/>
                    </label>
                </p>}

                {!hasSolution && <p>
                    <label>
                        Verify the solution based on the conflict checker:&nbsp;
                        <input type={"checkbox"} checked={noSpecialRules} onChange={ev => setNoSpecialRules(ev.target.checked)}/>
                    </label>
                    <div style={{marginTop: "0.25em", color: veryDarkGreyColor}}>
                        When enabled, the software will say that the puzzle was solved correctly as soon as all digits are fulfilled
                        and there are no conflicts for the standard constraints included in the puzzle.
                    </div>
                    <div style={{marginTop: "0.25em", color: veryDarkGreyColor}}>
                        Please don't enable it when the puzzle contains non-standard constraints or rules
                        that cannot be verified by the conflict checker!
                        (also, it's recommended to include the embedded solution in this case)
                    </div>
                </p>}

                <p>
                    <button type={"submit"} disabled={!isValidForm}>Load</button>
                </p>
            </form>
        </div>

        <FieldPreview
            key={importedPuzzle.version}
            puzzle={importedPuzzle.puzzle}
            width={previewSize}
        />
    </div>;
};
