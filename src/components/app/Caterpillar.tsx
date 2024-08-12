import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";
import {useWindowSize} from "../../hooks/useWindowSize";
import {Absolute} from "../layout/absolute/Absolute";
import {getRectsBoundingBox, Rect} from "../../types/layout/Rect";
import {useAblyChannelPresence, useAblyChannelState, useSetMyAblyChannelPresence} from "../../hooks/useAbly";
import {ablyOptions, myClientId} from "../../hooks/useMultiPlayer";
import {emptyPosition, Position} from "../../types/layout/Position";
import {greenColor, lightGreyColor, lightRedColor} from "./globals";
import {indexes} from "../../utils/indexes";
import {HTMLAttributes, MouseEvent, useMemo, useState} from "react";
import {CellSelectionColor} from "../sudoku/cell/CellSelection";
import {useEventListener} from "../../hooks/useEventListener";
import {Modal} from "../layout/modal/Modal";
import {Button} from "../layout/button/Button";
import {settings} from "../../types/layout/Settings";
import {SettingsTextBox} from "../sudoku/controls/settings/SettingsTextBox";
import {SettingsItem} from "../sudoku/controls/settings/SettingsItem";
import {Edit} from "@emotion-icons/material";
import {puzzleIdToScl, Scl, sclToPuzzleId} from "../../utils/sudokuPad";

interface CaterpillarGrid {
    guid: number;
    data: string;
    offset: Position;
    size?: number;
}

const regionBorderWidth = 0.07;
const getGridRect = ({offset, size = 6}: CaterpillarGrid): Rect => {
    const fullWidth = size + safetyMargin * 2 + regionBorderWidth;
    const fullHeight = size + safetyMargin * 2 + regionBorderWidth;
    const fullSize = Math.max(fullWidth, fullHeight);

    return {
        top: offset.top - safetyMargin - (fullSize - fullHeight) / 2,
        left: offset.left - safetyMargin - (fullSize - fullWidth) / 2,
        width: fullSize,
        height: fullSize,
    };
};

interface PresenceData {
    nickname: string;
    isEditing: boolean;
}

export interface CaterpillarProps {
    chunk?: string;
}

export const CaterpillarEditor = observer(function CaterpillarEditor({chunk}: CaterpillarProps) {
    profiler.trace();

    const channelName = getChannelName(chunk);
    const [grids = [], setGrids, connected] = useGrids(chunk);
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
    useSetMyAblyChannelPresence(ablyOptions, channelName, myPresenceData);
    const [presenceMessages] = useAblyChannelPresence(ablyOptions, channelName);
    const otherPeople = presenceMessages
        .filter(({clientId}) => clientId !== myClientId)
        .map(({data}) => data as PresenceData);
    const otherEditor = otherPeople.find(({isEditing}) => isEditing);

    const showAnyModal = showHelp || showNicknameModal || !!otherEditor;

    const {windowSize, coeff} = useDimensions(viewGrids, false);

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
        data: "fpuzN4IgzglgXgpiBcA2ANCA5gJwgEwQbT2AF9ljSSzKiBdZQih8p42+5xq1q99rj/8nx7cW1IkA",
        offset: viewGrids[viewGrids.length - 1]?.offset ?? emptyPosition,
    });

    useEventListener(window, "keydown", (ev) => {
        if (editingGrid || showAnyModal) {
            return;
        }

        const {code, ctrlKey: winCtrlKey, metaKey: macCtrlKey, shiftKey} = ev;
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
            case "Tab":
                if (!ctrlKey && viewGrids.length) {
                    ev.preventDefault();
                    const lastSelected = selectedGrids[selectedGrids.length - 1];
                    const currentIndex = viewGrids.findIndex((grid) => grid.guid === lastSelected);
                    setSelectedGrids([viewGrids[(currentIndex + (shiftKey ? viewGrids.length - 1 : 1)) % viewGrids.length].guid]);
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
            <div>
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
            </div>

            <GridsCompilation
                grids={viewGrids}
                readOnly={false}
                onClick={({guid}, isCtrl) => {
                    setSelectedGrids(
                        (prev) => prev.includes(guid)
                            ? prev.filter(guid2 => guid2 !== guid)
                            : isCtrl ? [...prev, guid] : [guid]
                    );
                }}
                onDoubleClick={(grid) => {
                    setEditingGrid(grid);
                }}
                selectedGrids={selectedGrids}
            />
        </Absolute>

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
    </>;
});

export const CaterpillarConsumer = observer(function CaterpillarConsumer({chunk = ""}: CaterpillarProps) {
    profiler.trace();

    const chunks = chunk.split(",");
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const grids = chunks.flatMap(chunk => useGrids(chunk)[0] ?? []);

    const windowSize = useWindowSize(false);

    return <Absolute {...windowSize}>
        <GridsCompilation grids={grids} readOnly={true}/>

        {settings.nickname.get() === "Chameleon" && <div style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            padding: "1em",
            pointerEvents: "all",
        }}>
            <Button onClick={() => navigator.clipboard.writeText(compileGrids(grids)).then(() => alert("Copied!"))}>Copy SCL</Button>
        </div>}
    </Absolute>;
});

const getChannelName = (chunk = "") => "caterpillar" + chunk;

const useGrids = (chunk = "") => useAblyChannelState<CaterpillarGrid[]>(ablyOptions, getChannelName(chunk), []);

const useDimensions = (grids: CaterpillarGrid[], readOnly: boolean) => {
    const windowSize = useWindowSize(!readOnly);

    const padding = readOnly ? 1 : 6;
    const boundingRect = {...getRectsBoundingBox(...grids.map(getGridRect))};
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

    return {windowSize, coeff, transformRect};
};

interface GridsCompilationProps {
    grids: CaterpillarGrid[];
    readOnly: boolean;
    onClick?: (grid: CaterpillarGrid, isCtrl: boolean) => void;
    onDoubleClick?: (grid: CaterpillarGrid) => void;
    selectedGrids?: number[];
}

const GridsCompilation = ({grids: viewGrids, readOnly, onClick, onDoubleClick, selectedGrids}: GridsCompilationProps) => {
    const {transformRect} = useDimensions(viewGrids, readOnly);

    return <div>
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

                    onClick?.(grid, ev.ctrlKey || ev.metaKey);
                }}
                onDoubleClick={(ev: MouseEvent<HTMLDivElement>) => {
                    ev.preventDefault();
                    ev.stopPropagation();

                    onDoubleClick?.(grid);
                }}
            />;
        })}

        {viewGrids.map(({guid, offset, size = 6}) => selectedGrids?.includes(guid) && <Absolute
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
    </div>;
};


const safetyMargin = 6;

interface SudokuPadProps {
    data: string;
    bounds: Rect;
}

const SudokuPad = observer(function SudokuPad({data, bounds}: SudokuPadProps) {
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

const SudokuPadImage = observer(function SudokuPadImage({data, ...imgProps}: SudokuPadImageProps) {
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

interface GridEditorProps {
    grid: CaterpillarGrid;
    onSubmit: (grid: CaterpillarGrid) => void;
    onCancel: () => void;
    cellSize: number;
}

const GridEditor = observer(function GridEditor({grid, onSubmit, onCancel, cellSize}: GridEditorProps) {
    const [data, setData] = useState(grid.data);

    const parsedGrid = useMemo(() => {
        try {
            return puzzleIdToScl(data);
        } catch {
            return undefined;
        }
    }, [data]);
    const parsedGridWidth = parsedGrid?.cells?.[0]?.length;
    const parsedGridHeight = parsedGrid?.cells?.length;
    const isGridOk = !!parsedGrid && parsedGridWidth === parsedGridHeight;

    const newGrid: CaterpillarGrid = {
        ...grid,
        data,
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

        {!parsedGrid && <div>Error: failed to parse the grid data.</div>}
        {parsedGrid && !isGridOk && <div>Error: the grid should be a square.</div>}
        {isGridOk && <SudokuPadImage
            data={data}
            style={{
                marginTop: 16,
                width: cellSize * 12,
                height: cellSize * 12,
            }}
        />}

        <div style={{display: "flex", gap: 16, justifyContent: "center", marginTop: 16}}>
            <Button type={"button"} disabled={!isGridOk} onClick={submit}>Save</Button>
            <Button type={"button"} onClick={onCancel}>Cancel</Button>
        </div>
    </Modal>;
});

const compileGrids = (grids: CaterpillarGrid[]) => {
    const result: Scl = {
        id: "caterdokupillarpoc",
        cellSize: 50,
        metadata: {} as any,
        settings: {},
        arrows: [],
        cages: [],
        lines: [],
        cells: [],
        regions: [],
        overlays: [],
        underlays: [],
    };

    let width = 0, height = 0;
    const minLeft = Math.min(...grids.map((grid) => grid.offset.left)) - safetyMargin;
    const minTop = Math.min(...grids.map((grid) => grid.offset.top)) - safetyMargin;

    const solutionArray: string[][] = [];

    for (const grid of grids) {
        const offsetTop = grid.offset.top - minTop;
        const offsetLeft = grid.offset.left - minLeft;
        const translatePoint = ([y, x]: number[]) => [offsetTop + y, offsetLeft + x];

        const data = puzzleIdToScl(grid.data);

        const parseCageMetadata = (value?: unknown) => {
            if (typeof value !== "string") {
                return undefined;
            }

            const result = /^(source|title|author|rules|solution): ([^\x00]*)$/.exec(value);
            if (!result) {
                return undefined;
            }

            return {
                key: result[1],
                value: result[2],
            };
        };

        for (const cage of data.cages ?? []) {
            const cageMetadata = parseCageMetadata(cage.value);
            if (cageMetadata) {
                data.metadata ??= {} as Scl["metadata"];
                // @ts-ignore
                data.metadata[cageMetadata.key] = cageMetadata.value;
            }
        }
        data.cages = data.cages?.filter((cage) => !parseCageMetadata(cage.value));

        const {
            metadata: {solution} = {},
            arrows = [],
            cages = [],
            lines = [],
            cells,
            regions = [],
            overlays = [],
            underlays = [],
        } = data;

        const gridHeight = cells.length;
        const gridWidth = cells[0].length;
        width = Math.max(width, offsetLeft + gridWidth + safetyMargin);
        height = Math.max(height, offsetTop + gridHeight + safetyMargin);

        for (const [top, row] of cells.entries()) {
            for (const [left, cell] of row.entries()) {
                result.cells[offsetTop + top] ??= [];
                result.cells[offsetTop + top][offsetLeft + left] = cell;
            }
        }

        if (solution) {
            for (const index of indexes(solution.length)) {
                const [y, x] = translatePoint([Math.floor(index / gridWidth), index % gridWidth]);

                solutionArray[y] ??= [];
                solutionArray[y][x] = solution[index];
            }
        }

        result.regions!.push(...regions.map((region) => region.map(translatePoint)));
        result.overlays!.push(...overlays.map((overlay) => ({
            ...overlay,
            center: translatePoint(overlay.center),
        })));
        result.underlays!.push(...underlays.map((underlay) => ({
            ...underlay,
            center: translatePoint(underlay.center),
        })));
        result.arrows!.push(...arrows.map((arrow) => ({
            ...arrow,
            wayPoints: arrow.wayPoints.map(translatePoint),
        })));
        result.lines!.push(...lines.map((line) => ({
            ...line,
            wayPoints: line.wayPoints.map(translatePoint),
        })));
        result.cages!.push(...cages.map((cage) => ({
            ...cage,
            cells: cage.cells?.map(translatePoint),
        })));
    }

    for (const top of indexes(height)) {
        result.cells[top] ??= [];
        for (const left of indexes(width)) {
            result.cells[top][left] ??= {} as any;
        }
    }

    result.metadata!.source = "PuzzleTV";
    result.metadata!.title = "Caterdokupillar POC";
    result.metadata!.author = "A lot of people";
    result.metadata!.rules = "Totally normal caterdokupillar rules apply.";

    let solution = "";
    for (const top of indexes(height)) {
        for (const left of indexes(width)) {
            solution += solutionArray[top]?.[left] ?? " ";
        }
    }
    result.metadata!.solution = solution;

    console.log(result);

    return "https://sudokupad.app/" + sclToPuzzleId(result);
};
