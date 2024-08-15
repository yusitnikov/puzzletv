import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {HTMLAttributes, useMemo, useState} from "react";
import {Rect} from "../../../types/layout/Rect";
import {puzzleIdToScl, sclToPuzzleId} from "../../../utils/sudokuPad";
import {safetyMargin} from "./globals";

interface SudokuPadProps {
    data: string;
    bounds: Rect;
}

export const SudokuPad = observer(function SudokuPad({data, bounds}: SudokuPadProps) {
    profiler.trace();

    const fixedData = useMemo(() => {
        try {
            const parsedData = puzzleIdToScl(data);

            const width = parsedData.cells[0].length;
            const height = parsedData.cells.length;

            parsedData.underlays ??= [];
            parsedData.underlays.push({
                center: [height / 2, width / 2],
                width: width + 2 * safetyMargin,
                height: height + 2 * safetyMargin,
                angle: 0,
                stroke: "none",
                thickness: 0,
                backgroundColor: "transparent",
                borderColor: "transparent",
            } as typeof parsedData.underlays[0]);

            return sclToPuzzleId(parsedData);
        } catch {
            return undefined;
        }
    }, [data]);

    if (!fixedData) {
        return null;
    }

    return <SudokuPadImage
        data={fixedData}
        style={{
            position: "absolute",
            pointerEvents: "none",
            ...bounds,
        }}
    />;
});

interface SudokuPadImageProps extends Omit<HTMLAttributes<HTMLImageElement>, "src" | "alt"> {
    data: string;
}

export const SudokuPadImage = observer(function SudokuPadImage({data, ...imgProps}: SudokuPadImageProps) {
    profiler.trace();

    const [errorData, setErrorData] = useState("");

    if (errorData === data) {
        return <div style={{
            ...imgProps.style,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            color: "red",
            fontSize: typeof imgProps.style?.height === "number" ? imgProps.style.height * 0.08 : undefined,
        }}>
            ERROR
        </div>;
    }
    return <img
        {...imgProps}
        src={`https://api.sudokupad.com/thumbnail/${data}_512x512.svg`}
        alt={"Grid image"}
        onError={() => setErrorData(data)}
    />;
});
