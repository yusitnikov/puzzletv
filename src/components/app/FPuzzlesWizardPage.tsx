import {buildLink} from "../../utils/link";
import {FormEvent, useMemo} from "react";
import {useBoolFromLocalStorage, useNumberFromLocalStorage, useStringFromLocalStorage} from "../../utils/localStorage";
import {decodeFPuzzlesString, FPuzzlesImportOptions, FPuzzlesImportPuzzleType} from "../../data/puzzles/FPuzzles";
import {useLanguageCode} from "../../hooks/useTranslate";

interface FPuzzlesWizardPageProps {
    load: string;
}

export const FPuzzlesWizardPage = ({load}: FPuzzlesWizardPageProps) => {
    const languageCode = useLanguageCode();

    const puzzle = useMemo(() => decodeFPuzzlesString(load), [load]);

    const [type, setType] = useStringFromLocalStorage<FPuzzlesImportPuzzleType>("fpwType", FPuzzlesImportPuzzleType.Regular);
    const [loopX, setLoopX] = useBoolFromLocalStorage("fpwLoopX");
    const [loopY, setLoopY] = useBoolFromLocalStorage("fpwLoopY");
    const [noSpecialRules, setNoSpecialRules] = useBoolFromLocalStorage("fpwNoSpecialRules");
    const [fillableDigitalDisplay, setFillableDigitalDisplay] = useBoolFromLocalStorage("fpwFillableDigitalDisplay");
    const [tesseract, setTesseract] = useBoolFromLocalStorage("fpwTesseract");
    const [productArrow, setProductArrow] = useBoolFromLocalStorage("fpwProductArrow");
    const [yajilinFog, setYajilinFog] = useBoolFromLocalStorage("fpwYajilinFog");
    const [cosmeticsBehindFog, setCosmeticsBehindFog] = useBoolFromLocalStorage("fpwCosmeticsBehindFog");
    const [safeCrackerCodeLength, setSafeCrackerCodeLength] = useNumberFromLocalStorage("fpwSafeCrackerCodeLength", 6);

    const isCalculator = type === FPuzzlesImportPuzzleType.Calculator;
    const isSafeCracker = type === FPuzzlesImportPuzzleType.SafeCracker;
    const isSpecialGrid = [
        FPuzzlesImportPuzzleType.Cubedoku,
        FPuzzlesImportPuzzleType.Rotatable,
        FPuzzlesImportPuzzleType.SafeCracker,
    ].includes(type);
    const hasSolution = !!puzzle.solution;
    const hasFog = !!(puzzle.fogofwar || puzzle.foglight);
    const hasCosmeticElements = !!(puzzle.text?.length || puzzle.line?.length || puzzle.rectangle?.length || puzzle.circle?.length || puzzle.cage?.length);

    const handleSubmit = (ev: FormEvent) => {
        ev.preventDefault();

        window.location.hash = buildLink("f-puzzles", languageCode, {
            type: isCalculator && fillableDigitalDisplay ? FPuzzlesImportPuzzleType.Regular : type,
            fillableDigitalDisplay: isCalculator && fillableDigitalDisplay,
            loopX: !isSpecialGrid && loopX,
            loopY: !isSpecialGrid && loopY,
            tesseract: !isSpecialGrid && tesseract,
            "product-arrow": !!puzzle.arrow && productArrow,
            yajilinFog: hasFog && yajilinFog,
            cosmeticsBehindFog: hasFog && cosmeticsBehindFog,
            safeCrackerCodeLength: isSafeCracker ? safeCrackerCodeLength : undefined,
            noSpecialRules: !hasSolution && noSpecialRules,
            load,
        } as FPuzzlesImportOptions);

        return false;
    };

    return <form onSubmit={handleSubmit}>
        <p>
            <label>
                Type:&nbsp;
                <select value={type} onChange={ev => setType(ev.target.value as FPuzzlesImportPuzzleType)} style={{font: "inherit"}}>
                    <option value={FPuzzlesImportPuzzleType.Regular}>Regular</option>
                    <option value={FPuzzlesImportPuzzleType.Latin}>Latin digits</option>
                    <option value={FPuzzlesImportPuzzleType.Calculator}>Calculator digits</option>
                    <option value={FPuzzlesImportPuzzleType.Cubedoku}>Cubedoku</option>
                    <option value={FPuzzlesImportPuzzleType.Rotatable}>Rotatable</option>
                    <option value={FPuzzlesImportPuzzleType.SafeCracker}>Safe Cracker</option>
                </select>
            </label>
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

        {!hasSolution && <p>
            <label>
                Constraints-based solution check:&nbsp;
                <input type={"checkbox"} checked={noSpecialRules} onChange={ev => setNoSpecialRules(ev.target.checked)}/>
            </label>
        </p>}

        <p>
            <button type={"submit"}>Load</button>
        </p>
    </form>;
};
