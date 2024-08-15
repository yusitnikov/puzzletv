import {CaterpillarGrid} from "./types";
import {observer} from "mobx-react-lite";
import {useEffect, useMemo, useState} from "react";
import {normalizeSclMetadata, puzzleIdToScl, sclToPuzzleId} from "../../../utils/sudokuPad";
import {Modal} from "../../layout/modal/Modal";
import {JsonEditor} from "../../layout/json-editor/JsonEditor";
import {SudokuPadImage} from "./SudokuPad";
import {Button} from "../../layout/button/Button";

interface GridEditorProps {
    grid: CaterpillarGrid;
    onSubmit: (grid: CaterpillarGrid) => void;
    onCancel: () => void;
    cellSize: number;
}

export const GridEditor = observer(function GridEditor({grid, onSubmit, onCancel, cellSize}: GridEditorProps) {
    const [data, setData] = useState(grid.data);

    const parsedGrid = useMemo(() => {
        try {
            return normalizeSclMetadata(puzzleIdToScl(data));
        } catch {
            return undefined;
        }
    }, [data]);

    const [editedParsedGrid, setEditedParsedGrid] = useState(parsedGrid);
    useEffect(() => {
        setEditedParsedGrid(parsedGrid);
    }, [parsedGrid]);

    const editedData = editedParsedGrid ? sclToPuzzleId(editedParsedGrid) : data;

    const parsedGridWidth = editedParsedGrid?.cells?.[0]?.length;
    const parsedGridHeight = editedParsedGrid?.cells?.length;
    const isGridOk = !!editedParsedGrid && parsedGridWidth === parsedGridHeight;

    const newGrid: CaterpillarGrid = {
        ...grid,
        data: editedData,
        size: parsedGridHeight,
    };
    const submit = () => onSubmit(newGrid);

    return <Modal
        cellSize={cellSize * 2}
        onClose={onCancel}
        textAlign={"center"}
    >
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
            Use this bookmarklet in the SudokuPad tab to copy the data:<br/>
            <a href={"javascript:PuzzleLoader.fetchPuzzle(getPuzzleId()).then(data => navigator.clipboard.writeText(data)).then(() => alert('Copied!'))"}>
                Copy SudokuPad puzzle data
            </a>
        </div>

        {!editedParsedGrid && <div>Error: failed to parse the grid data.</div>}
        {editedParsedGrid && !isGridOk && <div>Error: the grid should be a square.</div>}
        {editedParsedGrid && <div style={{marginTop: 16, display: "flex", flexDirection: "row"}}>
            <JsonEditor
                style={{
                    width: cellSize * 12,
                    height: cellSize * 12,
                }}
                value={editedParsedGrid}
                onChange={setEditedParsedGrid}
            />
            {isGridOk && <SudokuPadImage
                data={editedData}
                style={{
                    width: cellSize * 12,
                    height: cellSize * 12,
                }}
            />}
        </div>}

        <div style={{display: "flex", gap: 16, justifyContent: "center", marginTop: 16}}>
            <Button type={"button"} disabled={!isGridOk} onClick={submit}>Save</Button>
            <Button type={"button"} onClick={onCancel}>Cancel</Button>
        </div>
    </Modal>;
});
