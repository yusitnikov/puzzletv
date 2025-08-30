import { observer } from "mobx-react-lite";
import { greenColor, textColor } from "../../../components/app/globals";
import { getIndicatorLetter } from "../utils/getIndicatorLetter";
import { CrackTheCodeCondition } from "../types/CrackTheCodeCondition";
import styled from "@emotion/styled";

interface ConditionIndicatorProps {
    index: number;
    condition: CrackTheCodeCondition;
    code: string;
    size: number;
    title?: string;
}

export const ConditionIndicator = observer(function ConditionIndicatorFc({
    index,
    condition,
    code,
    size,
    title,
}: ConditionIndicatorProps) {
    const result = condition(code);
    const progress = typeof result === "boolean" ? (result ? 1 : 0) : result;

    return (
        <Circle title={title} size={size}>
            <Progress progress={progress} />
            <Label>{getIndicatorLetter(index)}</Label>
        </Circle>
    );
});

const Circle = styled("div")<{ size: number }>(({ size }) => ({
    borderRadius: "50%",
    background: "#f00",
    color: textColor,
    width: size,
    height: size,
    position: "relative",
    overflow: "hidden",
    textAlign: "center",
    fontSize: "80%",
}));

const Progress = styled("div")<{ progress: number }>(({ progress }) => ({
    position: "absolute",
    background: greenColor,
    top: 0,
    left: 0,
    bottom: 0,
    width: `${100 * progress}%`,
}));

const Label = styled("div")({
    position: "absolute",
    inset: 0,
    margin: "auto",
});
