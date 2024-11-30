import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { HTMLAttributes, useEffect, useMemo, useState } from "react";
import { Rect } from "../../../types/layout/Rect";
import { puzzleIdToScl, sclToPuzzleId } from "../../../utils/sudokuPad";
import { safetyMargin } from "./globals";
import { serializeToLocalStorage, unserializeFromLocalStorage } from "../../../utils/localStorage";
import { GridLinesProcessor } from "./GridLinesProcessor";

interface SudokuPadProps {
    data: string;
    bounds: Rect;
    dashed?: boolean;
}

export const SudokuPad = observer(function SudokuPad({ data, bounds, dashed }: SudokuPadProps) {
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
            } as (typeof parsedData.underlays)[0]);

            return sclToPuzzleId(parsedData);
        } catch {
            return undefined;
        }
    }, [data]);

    if (!fixedData) {
        return null;
    }

    return (
        <SudokuPadImage
            data={fixedData}
            dashed={dashed}
            cache={true}
            style={{
                position: "absolute",
                pointerEvents: "none",
                ...bounds,
            }}
        />
    );
});

interface SudokuPadImageProps extends HTMLAttributes<HTMLIFrameElement> {
    data: string;
    dashed?: boolean;
    cache?: boolean;
}

export const SudokuPadImage = observer(function SudokuPadImage({
    data,
    dashed = false,
    cache = false,
    ...props
}: SudokuPadImageProps) {
    profiler.trace();

    const [svgText, setSvgText] = useState("");
    const [isError, setIsError] = useState(false);

    // Replace all non-ascii characters by "?" to patch SudokuPad thumbnail API bug
    const fixedData = useMemo(() => {
        try {
            let parsedData = puzzleIdToScl(data);

            const size = parsedData.cells.length;
            const gridLinesProcessor = new GridLinesProcessor();
            gridLinesProcessor.addGrid(
                { top: 0, left: 0, width: size, height: size },
                (parsedData.regions ?? []).map((region) => region.map(([top, left]) => ({ top, left }))),
                dashed,
            );
            parsedData = {
                ...parsedData,
                regions: undefined,
                lines: [...gridLinesProcessor.getLines(), ...(parsedData.lines ?? [])],
            };

            return sclToPuzzleId(parsedData);
        } catch {
            return undefined;
        }
    }, [data, dashed]);

    useEffect(() => {
        if (!fixedData) {
            return;
        }

        let aborted = false;

        // TODO: extract as a cache service or use a library
        const cacheKey = "SudokuPadImage";
        interface CacheItem {
            data: string;
            time: number;
        }
        if (cache) {
            const cacheStorage: Record<string, CacheItem> = unserializeFromLocalStorage(cacheKey) ?? {};
            const cachedObject = cacheStorage[fixedData];
            if (cachedObject) {
                setSvgText(cachedObject.data);
                return;
            }
        }

        fetch(`https://api.sudokupad.com/thumbnail/${fixedData}_512x512.svg`)
            .then((res) => res.text())
            .then((res) => {
                if (!aborted) {
                    setSvgText(res);
                    if (cache) {
                        const cacheStorage: Record<string, CacheItem> = unserializeFromLocalStorage(cacheKey) ?? {};
                        cacheStorage[fixedData] = {
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
    }, [fixedData, cache]);

    if (isError || !fixedData) {
        return (
            <div
                style={{
                    ...props.style,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    color: "red",
                    fontSize: typeof props.style?.height === "number" ? props.style.height * 0.08 : undefined,
                }}
            >
                ERROR
            </div>
        );
    }

    if (!svgText) {
        return null;
    }

    return (
        <iframe
            {...props}
            style={{
                ...props.style,
                border: "none",
                outline: "none",
                margin: 0,
                padding: 0,
            }}
            srcDoc={`
            <style>
                svg {
                    position: fixed;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                }
                #cell-grids .cell-grid {
                    display: none;
                }
            </style>
            ${svgText}
        `}
        />
    );
});
