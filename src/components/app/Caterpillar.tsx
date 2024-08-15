import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";
import {useWindowSize} from "../../hooks/useWindowSize";
import {Absolute} from "../layout/absolute/Absolute";
import {useAblyChannelPresence, useAblyChannelState, useSetMyAblyChannelPresence} from "../../hooks/useAbly";
import {ablyOptions, myClientId} from "../../hooks/useMultiPlayer";
import {emptyPosition} from "../../types/layout/Position";
import {errorColor, greenColor, lightGreyColor, lightOrangeColor, lightRedColor} from "./globals";
import {indexes} from "../../utils/indexes";
import {useMemo, useState} from "react";
import {useEventListener} from "../../hooks/useEventListener";
import {Modal} from "../layout/modal/Modal";
import {Button} from "../layout/button/Button";
import {settings} from "../../types/layout/Settings";
import {SettingsTextBox} from "../sudoku/controls/settings/SettingsTextBox";
import {SettingsItem} from "../sudoku/controls/settings/SettingsItem";
import {Edit} from "@emotion-icons/material";
import {CaterpillarGrid} from "./caterpillar/types";
import {getDimensions} from "./caterpillar/utils";
import {GridEditor} from "./caterpillar/GridEditor";
import {compileGrids} from "./caterpillar/compileGrids";
import {GridsCompilation} from "./caterpillar/GridsCompilation";

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

    const windowSize = useWindowSize();
    const {coeff} = getDimensions(viewGrids, windowSize, false);

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

    const dataUsage = JSON.stringify(viewGrids).length / 65536;

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
                windowSize={windowSize}
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
            left={0}
            top={0}
            width={windowSize.width * Math.min(1, dataUsage)}
            height={10}
            style={{background: dataUsage < 1 ? lightOrangeColor : errorColor}}
        />

        <Absolute
            left={10}
            top={10}
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
                    <Button type={"button"} onClick={submit} style={{background: lightOrangeColor}}>Submit changes</Button>
                </div>
                <div>
                    <Button type={"button"} onClick={cancel}>Cancel changes</Button>
                </div>
            </>}

            <div>
                <Button
                    component={"a"}
                    href={"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(viewGrids, null, 2))}
                    download={`caterpillar-${chunk}.json`}
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
        <GridsCompilation grids={grids} windowSize={windowSize} readOnly={true}/>

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
