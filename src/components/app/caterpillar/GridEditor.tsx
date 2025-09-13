import { CaterpillarGrid } from "./types";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { normalizeSclMetadata, puzzleIdToScl, Scl, sclToPuzzleId } from "../../../utils/sudokuPad";
import { Modal } from "../../layout/modal/Modal";
import { JsonEditor } from "../../layout/json-editor/JsonEditor";
import { SudokuPadImage } from "./SudokuPad";
import { Button } from "../../layout/button/Button";
import { Tabs } from "../../layout/tabs/Tabs";
import { useThrottleData } from "../../../hooks/useThrottle";

interface GridEditorProps {
    grid: CaterpillarGrid;
    onSubmit: (grid: CaterpillarGrid) => void;
    onCancel: () => void;
    cellSize: number;
}

export const GridEditor = observer(function GridEditor({ grid, onSubmit, onCancel, cellSize }: GridEditorProps) {
    const [data, setData] = useState(grid.data);
    const [dashed, setDashed] = useState(grid.dashed ?? false);

    const parsedGrid = useMemo(() => {
        try {
            return normalizeSclMetadata(puzzleIdToScl(data));
        } catch {
            return undefined;
        }
    }, [data]);

    const [editedParsedGrid, setEditedParsedGrid] = useState(parsedGrid);
    const [editedParsedGridVersion, setEditedParsedGridVersion] = useState(0);
    useEffect(() => {
        setEditedParsedGrid(parsedGrid);
        setEditedParsedGridVersion((prev) => prev + 1);
    }, [parsedGrid]);
    const mergeEditedParsedMetadata = (data: Partial<Scl["metadata"]>) =>
        setEditedParsedGrid((prev) => ({
            ...prev!,
            metadata: {
                ...prev!.metadata!,
                ...data,
            },
        }));

    const editedData = editedParsedGrid ? sclToPuzzleId(editedParsedGrid) : data;

    const parsedGridWidth = editedParsedGrid?.cells?.[0]?.length;
    const parsedGridHeight = editedParsedGrid?.cells?.length;
    const isGridOk = !!editedParsedGrid && parsedGridWidth === parsedGridHeight;

    const newGrid: CaterpillarGrid = {
        ...grid,
        data: editedData,
        size: parsedGridHeight,
        dashed,
    };
    const submit = () => onSubmit(newGrid);

    const throttledEditedData = useThrottleData(500, editedData);

    return (
        <Modal cellSize={cellSize * 2} onClose={onCancel} style={{ gap: 0 }}>
            <div>
                <label>
                    Puzzle data:&nbsp;
                    <input
                        type={"text"}
                        placeholder={data || "Paste puzzle data string..."}
                        value={""}
                        onInput={(ev) => setData(ev.currentTarget.value)}
                        style={{
                            width: cellSize * 7,
                            font: "inherit",
                        }}
                    />
                </label>
            </div>
            <div>
                Use this bookmarklet in the SudokuPad tab to copy the data:
                <br />
                {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                <a
                    href={
                        // eslint-disable-next-line no-script-url
                        "javascript:PuzzleLoader.fetchPuzzle(getPuzzleId()).then(data => navigator.clipboard.writeText(data)).then(() => alert('Copied!'))"
                    }
                >
                    Copy SudokuPad puzzle data
                </a>
            </div>

            {!editedParsedGrid && <div>Error: failed to parse the grid data.</div>}
            {editedParsedGrid && !isGridOk && <div>Error: the grid should be a square.</div>}
            {editedParsedGrid && (
                <div style={{ marginTop: 16, display: "flex", flexDirection: "row", gap: "1em" }}>
                    <Tabs
                        style={{
                            width: cellSize * 12,
                            height: cellSize * 12,
                        }}
                        tabs={[
                            {
                                id: "metadata",
                                title: "Puzzle metadata",
                                contents: (
                                    <div
                                        style={{
                                            height: "100%",
                                            display: "flex",
                                            flexDirection: "column",
                                            textAlign: "left",
                                            gap: "0.5em",
                                        }}
                                    >
                                        <input
                                            type={"text"}
                                            placeholder={"Title"}
                                            value={editedParsedGrid.metadata?.title ?? ""}
                                            onChange={(ev) =>
                                                mergeEditedParsedMetadata({ title: ev.currentTarget.value })
                                            }
                                            style={{ font: "inherit" }}
                                        />
                                        <input
                                            type={"text"}
                                            placeholder={"Author"}
                                            value={editedParsedGrid.metadata?.author ?? ""}
                                            onChange={(ev) =>
                                                mergeEditedParsedMetadata({ author: ev.currentTarget.value })
                                            }
                                            style={{ font: "inherit" }}
                                        />
                                        <textarea
                                            placeholder={"Rules"}
                                            value={editedParsedGrid.metadata?.rules ?? ""}
                                            onChange={(ev) =>
                                                mergeEditedParsedMetadata({ rules: ev.currentTarget.value })
                                            }
                                            style={{ flex: 1, resize: "none", font: "inherit" }}
                                        />
                                        <input
                                            type={"text"}
                                            placeholder={"Solution"}
                                            value={editedParsedGrid.metadata?.solution ?? ""}
                                            onChange={(ev) =>
                                                mergeEditedParsedMetadata({ solution: ev.currentTarget.value })
                                            }
                                            style={{ font: "inherit" }}
                                        />
                                        <label style={{ display: "flex", gap: "0.25em", alignItems: "center" }}>
                                            <input
                                                type={"checkbox"}
                                                checked={dashed}
                                                onChange={(ev) => setDashed(ev.currentTarget.checked)}
                                            />
                                            <span>Dashed grid</span>
                                        </label>
                                    </div>
                                ),
                            },
                            {
                                id: "json-editor",
                                title: "JSON editor",
                                contents: (
                                    <JsonEditor
                                        key={editedParsedGridVersion}
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                        }}
                                        value={editedParsedGrid}
                                        onChange={setEditedParsedGrid}
                                    />
                                ),
                            },
                        ]}
                    />
                    {isGridOk && (
                        <div
                            style={{
                                position: "relative",
                                width: cellSize * 12,
                                height: cellSize * 12,
                            }}
                        >
                            <SudokuPadImage
                                data={throttledEditedData}
                                dashed={dashed}
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>
                    )}
                </div>
            )}

            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16 }}>
                <Button type={"button"} disabled={!isGridOk} onClick={submit}>
                    Save
                </Button>
                <Button type={"button"} onClick={onCancel}>
                    Cancel
                </Button>
            </div>
        </Modal>
    );
});
