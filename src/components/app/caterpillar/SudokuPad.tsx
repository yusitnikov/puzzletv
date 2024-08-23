import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {HTMLAttributes, useEffect, useMemo, useState} from "react";
import {Rect} from "../../../types/layout/Rect";
import {puzzleIdToScl, sclToPuzzleId} from "../../../utils/sudokuPad";
import {safetyMargin} from "./globals";
import {serializeToLocalStorage, unserializeFromLocalStorage} from "../../../utils/localStorage";
import {utf8ToBase64} from "../../../utils/encoding";

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
        cache={true}
        style={{
            position: "absolute",
            pointerEvents: "none",
            ...bounds,
        }}
    />;
});

interface SudokuPadImageProps extends Omit<HTMLAttributes<HTMLImageElement>, "src" | "alt"> {
    data: string;
    cache?: boolean;
}

export const SudokuPadImage = observer(function SudokuPadImage({data, cache = false, ...imgProps}: SudokuPadImageProps) {
    profiler.trace();

    const [svgText, setSvgText] = useState("");
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let aborted = false;

        // TODO: extract as a cache service or use a library
        const cacheKey = "SudokuPadImage";
        interface CacheItem {
            data: string;
            time: number;
        }
        if (cache) {
            const cacheStorage: Record<string, CacheItem> = unserializeFromLocalStorage(cacheKey) ?? {};
            const cachedObject = cacheStorage[data];
            if (cachedObject) {
                setSvgText(cachedObject.data);
                return;
            }
        }

        fetch(`https://api.sudokupad.com/thumbnail/${data}_512x512.svg`)
            .then((res) => res.text())
            .then((res) => {
                if (!aborted) {
                    setSvgText(res);
                    if (cache) {
                        const cacheStorage: Record<string, CacheItem> = unserializeFromLocalStorage(cacheKey) ?? {};
                        cacheStorage[data] = {
                            data: res,
                            time: Date.now(),
                        };
                        // Delete old items if we took too much storage
                        while (JSON.stringify(cacheStorage).length > 3500000) {
                            const [[oldestData]] = Object.entries(cacheStorage).sort((a, b) => a[1].time - b[1].time);
                            delete cacheStorage[oldestData];
                        }
                        serializeToLocalStorage(cacheKey, cacheStorage);
                    }
                }
            })
            .catch(() => {
                if (!aborted) {
                    setIsError(true);
                }
            });

        return () => {
            aborted = true;
            setSvgText("");
            setIsError(false);
        };
    }, [data, cache]);

    if (isError) {
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

    if (!svgText) {
        return null;
    }

    // noinspection JSDeprecatedSymbols
    return <img
        {...imgProps}
        src={`data:image/svg+xml;base64,${utf8ToBase64(svgText)}`}
        alt={"Grid"}
        onError={() => setIsError(true)}
    />;
});
