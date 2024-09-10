import {observer} from "mobx-react-lite";
import {darkGreyColor, textColor} from "../../../components/app/globals";
import {clientColors} from "./constants";

interface WordSearchLetterProps {
    letter: string;
    active?: boolean;
    inWord?: boolean;
    clientIndex?: number;
    cellSize: number;
    onToggle?: () => void;
}

export const WordSearchLetter = observer(function WordSearchLetter(
    {letter, active, inWord, clientIndex = -1, cellSize, onToggle}: WordSearchLetterProps
) {
    return <div
        style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: cellSize,
            height: cellSize,
            fontSize: `${cellSize * 0.7}px`,
            color: "#fff",
            backgroundColor: inWord
                ? textColor
                : clientIndex >= 0
                    ? clientColors[clientIndex]
                    : darkGreyColor,
            transition: "background-color 200ms linear",
            cursor: active ? "pointer" : "auto",
            margin: 2,
        }}
        onClick={onToggle}
    >
        {letter}
    </div>;
});
