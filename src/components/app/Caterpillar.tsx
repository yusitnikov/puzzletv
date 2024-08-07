import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";
import {useWindowSize} from "../../hooks/useWindowSize";
import {Absolute} from "../layout/absolute/Absolute";
import {getRectsBoundingBox, Rect} from "../../types/layout/Rect";
import {useAblyChannelPresence, useAblyChannelState, useSetMyAblyChannelPresence} from "../../hooks/useAbly";
import {ablyOptions, myClientId} from "../../hooks/useMultiPlayer";
import {emptyPosition, Position} from "../../types/layout/Position";
import {darkGreyColor, greenColor, lightGreyColor, lightRedColor} from "./globals";
import {indexes} from "../../utils/indexes";
import {MouseEvent, useMemo, useState} from "react";
import {CellSelectionColor} from "../sudoku/cell/CellSelection";
import {useEventListener} from "../../hooks/useEventListener";
import {Modal} from "../layout/modal/Modal";
import {Button} from "../layout/button/Button";
import {settings} from "../../types/layout/Settings";
import {SettingsTextBox} from "../sudoku/controls/settings/SettingsTextBox";
import {SettingsItem} from "../sudoku/controls/settings/SettingsItem";
import {Edit} from "@emotion-icons/material";

interface CaterpillarGrid {
    guid: number;
    data: string;
    offset: Position;
    size?: number;
    margin: {
        top?: number;
        left?: number;
        bottom?: number;
        right?: number;
    };
}

const regionBorderWidth = 0.07;
const getGridRect = ({offset, size = 6, margin: {top = 0, left = 0, bottom = 0, right = 0}}: CaterpillarGrid): Rect => {
    const fullWidth = size + left + right + regionBorderWidth;
    const fullHeight = size + top + bottom + regionBorderWidth;
    const fullSize = Math.max(fullWidth, fullHeight);

    return {
        top: offset.top - top - (fullSize - fullHeight) / 2,
        left: offset.left - left - (fullSize - fullWidth) / 2,
        width: fullSize,
        height: fullSize,
    };
};

interface PresenceData {
    nickname: string;
    isEditing: boolean;
}

export interface CaterpillarProps {
    readOnly: boolean;
    chunk?: string;
}

export const Caterpillar = observer(function Caterpillar({readOnly, chunk = ""}: CaterpillarProps) {
    profiler.trace();

    const windowSize = useWindowSize(!readOnly);

    const channelName = "caterpillar" + chunk;
    const [grids = [], setGrids, connected] = useAblyChannelState<CaterpillarGrid[]>(ablyOptions, channelName, []);
    const [gridsEdit, setGridsEdit] = useState<CaterpillarGrid[]>();
    const viewGrids = gridsEdit ?? grids;
    const hasUnsubmittedChanges = !!gridsEdit;

    const [selectedGridsState, setSelectedGrids] = useState<number[]>([]);
    const selectedGrids = selectedGridsState.filter(
        guid => viewGrids.some((grid) => grid.guid === guid)
    );

    const [editingGrid, setEditingGrid] = useState<CaterpillarGrid>();

    const [showHelp, setShowHelp] = useState(false);

    const myNickname = settings.nickname.get();
    const [showNicknameModal, setShowNicknameModal] = useState(() => !myNickname);

    const myPresenceData = useMemo((): PresenceData => ({
        nickname: myNickname,
        isEditing: hasUnsubmittedChanges,
    }), [myNickname, hasUnsubmittedChanges]);
    useSetMyAblyChannelPresence(ablyOptions, channelName, myPresenceData, !readOnly);
    const [presenceMessages] = useAblyChannelPresence(ablyOptions, channelName, !readOnly);
    const otherPeople = presenceMessages
        .filter(({clientId}) => clientId !== myClientId)
        .map(({data}) => data as PresenceData);
    const otherEditor = otherPeople.find(({isEditing}) => isEditing);

    const showAnyModal = showHelp || showNicknameModal || !!otherEditor;

    const padding = readOnly ? 1 : 6;
    const boundingRect = {...getRectsBoundingBox(...viewGrids.map(getGridRect))};
    boundingRect.top -= padding;
    boundingRect.left -= padding;
    boundingRect.width += padding * 2;
    boundingRect.height += padding * 2;

    const coeff = Math.min(windowSize.width / boundingRect.width, windowSize.height / boundingRect.height);

    const transformRect = ({top, left, width, height}: Rect): Rect => ({
        top: (top - boundingRect.top - regionBorderWidth / 2) * coeff,
        left: (left - boundingRect.left - regionBorderWidth / 2) * coeff,
        width: width * coeff,
        height: height * coeff,
    });

    const submit = () => {
        if (hasUnsubmittedChanges) {
            setGrids(gridsEdit);
            setGridsEdit(undefined);
        }
    };
    const cancel = () => setGridsEdit(undefined);

    const move = (dx: number, dy: number) => {
        if (selectedGrids.length) {
            setGridsEdit(viewGrids.map(
                (grid) => selectedGrids.includes(grid.guid)
                    ? {
                        ...grid,
                        offset: {
                            left: grid.offset.left + dx,
                            top: grid.offset.top + dy,
                        },
                    }
                    : grid
            ));
        }
    };

    const editByGuid = (guid: number) => {
        const grid = viewGrids.find((grid) => grid.guid === guid);
        if (grid) {
            setEditingGrid(grid);
        }
    };

    const add = () => setEditingGrid({
        guid: Date.now(),
        data: "",
        offset: viewGrids[viewGrids.length - 1]?.offset ?? emptyPosition,
        margin: {},
    });

    useEventListener(window, "keydown", (ev) => {
        if (readOnly || editingGrid || showAnyModal) {
            return;
        }

        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey} = ev;
        const ctrlKey = winCtrlKey || macCtrlKey;
        const moveCoeff = ctrlKey ? 4 : 1;

        switch (code) {
            case "Enter":
                ev.preventDefault();
                if (ctrlKey) {
                    submit();
                } else if (selectedGrids.length === 1) {
                    editByGuid(selectedGrids[0]);
                }
                break;
            case "Escape":
                ev.preventDefault();
                cancel();
                setSelectedGrids([]);
                break;
            case "Delete":
            case "Backspace":
                ev.preventDefault();
                if (selectedGrids.length) {
                    setGridsEdit(viewGrids.filter(({guid}) => !selectedGrids.includes(guid)));
                }
                break;
            case "ArrowLeft":
                ev.preventDefault();
                move(-moveCoeff, 0);
                break;
            case "ArrowRight":
                ev.preventDefault();
                move(moveCoeff, 0);
                break;
            case "ArrowUp":
                ev.preventDefault();
                move(0, -moveCoeff);
                break;
            case "ArrowDown":
                ev.preventDefault();
                move(0, moveCoeff);
                break;
            case "KeyA":
                if (ctrlKey) {
                    ev.preventDefault();
                    setSelectedGrids(viewGrids.map(({guid}) => guid));
                }
                break;
        }
    });

    useEventListener(window, "beforeunload", (ev) => {
        if (!hasUnsubmittedChanges) {
            return;
        }

        ev.returnValue = "Are you sure? Changes you made may not be saved";
        return "Are you sure? Changes you made may not be saved";
    });

    const modalCellSize = Math.min(windowSize.width, windowSize.height) * 0.05;

    return <>
        <Absolute {...windowSize} pointerEvents={true} onClick={() => setSelectedGrids([])}>
            {!readOnly && <div>
                {indexes(Math.ceil(windowSize.width / coeff), true).map((x) => <Absolute
                    key={"column" + x}
                    top={0}
                    left={x * coeff}
                    width={1}
                    height={windowSize.height}
                    style={{background: lightGreyColor}}
                />)}
                {indexes(Math.ceil(windowSize.height / coeff), true).map((y) => <Absolute
                    key={"row" + y}
                    left={0}
                    top={y * coeff}
                    height={1}
                    width={windowSize.width}
                    style={{background: lightGreyColor}}
                />)}
            </div>}
            <div>
                {viewGrids.map((grid) => {
                    const {guid, offset, size = 6} = grid;

                    return <Absolute
                        key={"background" + guid}
                        {...transformRect({...offset, width: size, height: size})}
                        style={{
                            background: "#fff",
                            pointerEvents: readOnly ? "none" : "all",
                            cursor: "pointer",
                        }}
                        onClick={(ev: MouseEvent<HTMLDivElement>) => {
                            ev.preventDefault();
                            ev.stopPropagation();

                            setSelectedGrids(
                                (prev) => prev.includes(guid)
                                    ? prev.filter(guid2 => guid2 !== guid)
                                    : (ev.ctrlKey || ev.metaKey) ? [...prev, guid] : [guid]
                            );
                        }}
                        onDoubleClick={(ev: MouseEvent<HTMLDivElement>) => {
                            ev.preventDefault();
                            ev.stopPropagation();

                            setEditingGrid(grid);
                        }}
                    />;
                })}

                {viewGrids.map(({guid, offset, size = 6}) => selectedGrids.includes(guid) && <Absolute
                    key={"selection" + guid}
                    {...transformRect({...offset, width: size, height: size})}
                    borderColor={CellSelectionColor.mainCurrent}
                    borderWidth={5}
                />)}

                {viewGrids.map((grid) => <SudokuPad
                    key={"SudokuPad" + grid.guid}
                    data={grid.data}
                    bounds={transformRect(getGridRect(grid))}
                />)}
            </div>
        </Absolute>
        {!readOnly && <>
            <Absolute
                left={10}
                top={0}
                height={40}
                width={windowSize.width - 20}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div
                    style={{
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: connected ? greenColor : lightRedColor,
                    }}
                />

                <div
                    style={{
                        pointerEvents: "all",
                        cursor: "pointer",
                    }}
                    onClick={() => setShowNicknameModal(true)}
                >
                    {myNickname} (you) <Edit size={"1em"}/>
                </div>

                {otherPeople.map(({nickname, isEditing}, index) => <div key={index}>
                    {nickname || "Anonymous"}
                    {isEditing && " (editing)"}
                </div>)}
            </Absolute>

            <Absolute
                left={10}
                top={windowSize.height - 40}
                width={windowSize.width - 20}
                height={40}
                pointerEvents={true}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                }}
            >
                <div>
                    <Button type={"button"} onClick={add}>Add grid</Button>
                </div>

                {selectedGrids.length === 1 && <div>
                    <Button type={"button"} onClick={() => editByGuid(selectedGrids[0])}>Edit grid</Button>
                </div>}

                {hasUnsubmittedChanges && <>
                    <div>
                        <Button type={"button"} onClick={submit}>Submit changes</Button>
                    </div>
                    <div>
                        <Button type={"button"} onClick={cancel}>Cancel changes</Button>
                    </div>
                </>}

                <div>
                    <Button
                        component={"a"}
                        href={"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(viewGrids, null, 2))}
                        download={"caterpillar.json"}
                    >
                        Download backup
                    </Button>
                </div>

                <div>
                    <Button type={"button"} onClick={() => setShowHelp(true)}>Show help</Button>
                </div>
            </Absolute>

            {editingGrid && <GridEditor
                grid={editingGrid}
                onSubmit={(newGrid) => {
                    const newGrids: CaterpillarGrid[] = [];
                    let found = false;
                    for (const grid of viewGrids) {
                        if (grid.guid === newGrid.guid) {
                            newGrids.push(newGrid);
                            found = true;
                        } else {
                            newGrids.push(grid);
                        }
                    }
                    if (!found) {
                        newGrids.push(newGrid);
                    }

                    setGridsEdit(newGrids);
                    setEditingGrid(undefined);
                    setSelectedGrids([newGrid.guid]);
                }}
                onCancel={() => setEditingGrid(undefined)}
                cellSize={modalCellSize}
            />}

            {showHelp && <Modal cellSize={modalCellSize * 2.5} onClose={() => setShowHelp(false)}>
                <div style={{display: "flex", flexDirection: "column", gap: "1em", textAlign: "left"}}>
                    <div>
                        The caterpillar can be edited by using the buttons in the bottom of the page and using the keyboard.
                    </div>

                    <div>
                        Every change you make will be synced to other team members over the internet, but only after you click "submit changes" (hotkey: Ctrl+Enter).<br/>
                        Alternatively, you can cancel all your last changes by clicking "cancel changes" (hotkey: Escape).
                    </div>

                    <div>
                        Click the "add grid" button to add a new grid.<br/>
                        In the grid editor modal, copy-paste the puzzle data from SudokuPad (use the bookmarklet that you see in the modal).<br/>
                        If the puzzle has outside clues, update the "outside rows/columns" fields according to the number of outsides lines from each side.<br/>
                        When all dimensions are configured properly, the white square in the preview should match the sudoku grid.<br/>
                        The new grid will be inserted at the place of the last grid, and can be moved with arrow keys later.
                    </div>

                    <div>
                        Select the grids by clicking on them (hold Ctrl to multi-select).<br/>
                        Selected grids could be edited by clicking "edit grid" button or double-click, moved with the arrow keys, or removed with the Delete key.
                    </div>

                    <div style={{textAlign: "center"}}>
                        <Button
                            type={"button"}
                            onClick={() => setShowHelp(false)}
                            autoFocus={true}
                            style={{font: "inherit"}}
                        >
                            Gotcha!
                        </Button>
                    </div>
                </div>
            </Modal>}

            {showNicknameModal && <Modal
                cellSize={modalCellSize * 2.5}
                onClose={() => {
                    if (settings.nickname.get()) {
                        setShowNicknameModal(false);
                    }
                }}
            >
                <form
                    onSubmit={(ev) => {
                        ev.preventDefault();

                        setShowNicknameModal(false);
                    }}
                >
                    <SettingsItem>
                        <span>Your nickname:</span>

                        <SettingsTextBox
                            type={"text"}
                            cellSize={modalCellSize * 2.5}
                            value={myNickname}
                            onChange={(ev) => settings.nickname.set(ev.target.value)}
                        />
                    </SettingsItem>

                    <div style={{marginTop: "2em"}}>
                        <Button
                            type={"submit"}
                            disabled={!myNickname}
                        >
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>}

            {otherEditor && <Modal cellSize={modalCellSize * 2.5}>
                {otherEditor.nickname || "Other person"} is editing the grids, please wait...
            </Modal>}
        </>}
    </>;
});

interface SudokuPadProps {
    data: string;
    bounds: Rect;
}

const SudokuPad = observer(function SudokuPad({data, bounds}: SudokuPadProps) {
    profiler.trace();

    return <img
        src={`https://api.sudokupad.com/thumbnail/${data}_512x512.svg`}
        alt={"Grid image"}
        style={{
            position: "absolute",
            pointerEvents: "none",
            ...bounds,
        }}
    />;
});

interface GridEditorProps {
    grid: CaterpillarGrid;
    onSubmit: (grid: CaterpillarGrid) => void;
    onCancel: () => void;
    cellSize: number;
}

const GridEditor = observer(function GridEditor({grid, onSubmit, onCancel, cellSize}: GridEditorProps) {
    const [data, setData] = useState(grid.data);
    const [size, setSize] = useState(grid.size ?? 6);
    const [marginLeft, setMarginLeft] = useState(grid.margin.left ?? 0);
    const [marginRight, setMarginRight] = useState(grid.margin.right ?? 0);
    const [marginTop, setMarginTop] = useState(grid.margin.top ?? 0);
    const [marginBottom, setMarginBottom] = useState(grid.margin.bottom ?? 0);
    const maxMargin = Math.max(marginLeft, marginRight, marginTop, marginBottom) + 0.5;

    const newGrid: CaterpillarGrid = {
        ...grid,
        data,
        size,
        margin: {
            left: marginLeft || undefined,
            right: marginRight || undefined,
            top: marginTop || undefined,
            bottom: marginBottom || undefined,
        },
    };
    const submit = () => onSubmit(newGrid);

    const previewBounds = getGridRect({
        ...newGrid,
        offset: {left: maxMargin, top: maxMargin}
    });

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

        <table style={{marginTop: 16}}>
            <tbody>
            <tr>
                <td colSpan={3}>
                    The white square should match the sudoku grid!
                </td>
            </tr>
            <tr>
                <td colSpan={3}>
                    <label>
                        Grid size:&nbsp;
                        <NumberInput value={size} onChange={setSize}/>
                    </label>
                    <label style={{marginLeft: 16}}>
                        Outside rows:&nbsp;
                        <NumberInput value={marginTop} onChange={setMarginTop}/>
                    </label>
                </td>
            </tr>
            <tr>
                <td>
                    <label>
                        Outside<br/>
                        columns:<br/>
                        <NumberInput value={marginLeft} onChange={setMarginLeft}/>
                    </label>
                </td>
                <td>
                    <div style={{
                        position: "relative",
                        width: cellSize * (size + maxMargin * 2),
                        height: cellSize * (size + maxMargin * 2),
                        background: lightGreyColor,
                    }}>
                        <Absolute
                            left={(maxMargin - marginLeft) * cellSize}
                            top={(maxMargin - marginTop) * cellSize}
                            width={(size + marginLeft + marginRight) * cellSize}
                            height={(size + marginTop + marginBottom) * cellSize}
                            style={{background: darkGreyColor}}
                        />

                        <Absolute
                            left={maxMargin * cellSize}
                            top={maxMargin * cellSize}
                            width={size * cellSize}
                            height={size * cellSize}
                            style={{background: "#fff"}}
                        />

                        {!!data && <SudokuPad
                            data={data}
                            bounds={{
                                left: previewBounds.left * cellSize,
                                top: previewBounds.top * cellSize,
                                width: previewBounds.width * cellSize,
                                height: previewBounds.height * cellSize,
                            }}
                        />}
                    </div>
                </td>
                <td>
                    <label>
                        Outside<br/>
                        columns:<br/>
                        <NumberInput value={marginRight} onChange={setMarginRight}/>
                    </label>
                </td>
            </tr>
            <tr>
                <td colSpan={3}>
                    <label>
                        Outside rows:&nbsp;
                        <NumberInput value={marginBottom} onChange={setMarginBottom}/>
                    </label>
                </td>
            </tr>
            </tbody>
        </table>

        <div style={{display: "flex", gap: 16, justifyContent: "center", marginTop: 16}}>
            <Button type={"button"} disabled={!data} onClick={submit}>Save</Button>
            <Button type={"button"} onClick={onCancel}>Cancel</Button>
        </div>
    </Modal>;
});

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
}

const NumberInput = observer(function NumberInput({value, onChange}: NumberInputProps) {
    return <input
        type={"number"}
        min={0}
        value={value}
        onChange={(ev) => onChange(ev.target.valueAsNumber)}
        style={{
            width: 40,
            textAlign: "center",
            font: "inherit",
        }}
    />;
});
