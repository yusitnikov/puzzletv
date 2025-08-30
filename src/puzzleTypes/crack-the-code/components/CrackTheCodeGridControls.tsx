import { observer } from "mobx-react-lite";
import { PuzzleContextProps } from "../../../types/puzzle/PuzzleContext";
import { CrackTheCodePTM } from "../types/CrackTheCodePTM";
import { getSizes } from "./shared";
import { CodeForm } from "./CodeForm";
import { ConditionIndicators } from "./ConditionIndicators";
import { SubmittedCodes } from "./SubmittedCodes";

export const CrackTheCodeGridControls = observer(function CrackTheCodeGridControlsFc({
    context,
}: PuzzleContextProps<CrackTheCodePTM>) {
    const { fontSize, lineHeight, gap } = getSizes(context);

    return (
        <div
            style={{
                pointerEvents: "all",
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                gap,
                fontSize,
                lineHeight: `${lineHeight}px`,
            }}
        >
            <CodeForm context={context} />

            <div style={{ display: "flex", flexDirection: "row", gap: gap / 2, flex: 1, minHeight: 0 }}>
                <SubmittedCodes context={context} />

                <ConditionIndicators context={context} />
            </div>
        </div>
    );
});
