import {buildLink} from "../../utils/link";
import {FormEvent, useMemo} from "react";
import {useBoolFromLocalStorage, useStringFromLocalStorage} from "../../utils/localStorage";
import {decodeFPuzzlesString} from "../../data/puzzles/FPuzzles";
import {useLanguageCode} from "../../hooks/useTranslate";

interface FPuzzlesWizardPageProps {
    load: string;
}

export const FPuzzlesWizardPage = ({load}: FPuzzlesWizardPageProps) => {
    const languageCode = useLanguageCode();

    const puzzle = useMemo(() => decodeFPuzzlesString(load), [load]);

    const [type, setType] = useStringFromLocalStorage("fpwType", "regular");
    const [loopX, setLoopX] = useBoolFromLocalStorage("fpwLoopX");
    const [loopY, setLoopY] = useBoolFromLocalStorage("fpwLoopY");
    const [noSpecialRules, setNoSpecialRules] = useBoolFromLocalStorage("fpwNoSpecialRules");
    const [fillableDigitalDisplay, setFillableDigitalDisplay] = useBoolFromLocalStorage("fpwFillableDigitalDisplay");
    const [tesseract, setTesseract] = useBoolFromLocalStorage("fpwTesseract");
    const [productArrow, setProductArrow] = useBoolFromLocalStorage("fpwProductArrow");

    const isCalculator = type === "calculator";
    const isSpecialGrid = type === "cubedoku";
    const hasSolution = !!puzzle.solution;

    const handleSubmit = (ev: FormEvent) => {
        ev.preventDefault();

        window.location.hash = buildLink("f-puzzles", languageCode, {
            type: isCalculator && fillableDigitalDisplay ? "regular" : type,
            fillableDigitalDisplay: isCalculator && fillableDigitalDisplay,
            loopX: !isSpecialGrid && loopX,
            loopY: !isSpecialGrid && loopY,
            tesseract: !isSpecialGrid && tesseract,
            "product-arrow": !!puzzle.arrow && productArrow,
            noSpecialRules: !hasSolution && noSpecialRules,
            load,
        });

        return false;
    };

    return <form onSubmit={handleSubmit}>
        <p>
            <label>
                Type:&nbsp;
                <select value={type} onChange={ev => setType(ev.target.value)} style={{font: "inherit"}}>
                    <option value={"regular"}>Regular</option>
                    <option value={"latin"}>Latin digits</option>
                    <option value={"calculator"}>Calculator digits</option>
                    <option value={"cubedoku"}>Cubedoku</option>
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
