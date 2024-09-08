import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";
import {compileGrids} from "./compileGrids";
import {useWindowSize} from "../../../hooks/useWindowSize";
import {
    publishToSudokuPad,
    Scl,
    sclToPuzzleId,
    sudokuPadBaseUrl
} from "../../../utils/sudokuPad";
import {useState} from "react";
import {Modal} from "../../layout/modal/Modal";
import {SettingsItem} from "../../sudoku/controls/settings/SettingsItem";
import {SettingsTextBox} from "../../sudoku/controls/settings/SettingsTextBox";
import {apiKey, baseShortId} from "./globals";
import {
    darkBlueColor,
    darkGreenColor,
    darkGreyColor,
    errorColor,
    greenColor,
    lightGreyColor,
    lightRedColor, textColor
} from "../globals";
import {LinkExternal} from "@emotion-icons/boxicons-regular";
import {SettingsButton} from "../../sudoku/controls/settings/SettingsButton";
import {CaterpillarGrid} from "./types";
import {indexes} from "../../../utils/indexes";
import {splitArrayIntoChunks} from "../../../utils/array";

const chunkSize = 28;

interface PublishModalProps {
    grids: CaterpillarGrid[];
    onClose: () => void;
}

export const PublishModal = observer(function PublishModal({grids, onClose}: PublishModalProps) {
    profiler.trace();

    const windowSize = useWindowSize(false);
    const modalCellSize = Math.min(windowSize.width, windowSize.height) * 0.125;

    const chunks = splitArrayIntoChunks(grids, chunkSize);

    interface PublishStatus {
        publishing?: boolean;
        success?: boolean;
    }
    const [publishStatus, setPublishStatus] = useState<PublishStatus[]>(
        () => indexes(chunks.length + 1).map(() => ({}))
    );
    const setPublishStatusItem = (index: number, item: PublishStatus) => setPublishStatus((prev) => {
        const next = [...prev];
        next[index] = item;
        return next;
    });

    const getShortId = (index?: number) => baseShortId.get() + (index === undefined ? "" : index + 1);
    const getPuzzleLink = (index?: number) =>
        `${sudokuPadBaseUrl}${getShortId(index)}?setting-nogrid=1&setting-largepuzzle=1`;

    const publish = async(index: number | undefined, grids: CaterpillarGrid[]) => {
        const statusIndex = index ?? chunks.length;

        let compiledGrids: Scl;
        try {
            compiledGrids = index === undefined
                ? compileGrids(grids)
                : compileGrids(
                    grids,
                    (index + 1).toString(),
                    index * chunkSize,
                    index > 0 ? getPuzzleLink(index - 1) : "",
                    index < chunks.length - 1 ? getPuzzleLink(index + 1) : "",
                );
        } catch (e: unknown) {
            console.error(e);
            setPublishStatusItem(statusIndex, {});
            return;
        }

        setPublishStatusItem(statusIndex, {publishing: true});

        const success = await publishToSudokuPad(
            getShortId(index),
            sclToPuzzleId(compiledGrids!),
            apiKey.get()
        );

        setPublishStatusItem(statusIndex, {success});
    };

    return <Modal
        noHeader={true}
        cellSize={modalCellSize}
        onClose={onClose}
    >
        <SettingsItem>
            <span>Puzzle short ID:</span>

            <SettingsTextBox
                type={"text"}
                cellSize={modalCellSize}
                value={baseShortId.get()}
                onChange={(ev) => baseShortId.set(ev.target.value)}
            />
        </SettingsItem>

        <SettingsItem>
            <span>SudokuPad API key:</span>

            <SettingsTextBox
                type={"password"}
                cellSize={modalCellSize}
                value={apiKey.get()}
                onChange={(ev) => apiKey.set(ev.target.value)}
            />
        </SettingsItem>

        <SettingsItem>
            <div style={{display: "flex"}}>
                {publishStatus.map(({publishing, success}, index) => <a
                    key={index}
                    href={getPuzzleLink(index === chunks.length ? undefined : index)}
                    target={"_blank"}
                    style={{
                        padding: "1em",
                        margin: 2,
                        backgroundColor: publishing ? lightGreyColor : success === undefined ? "#fff" : success ? greenColor : lightRedColor,
                    }}
                >
                    {index + 1}
                </a>)}
            </div>
        </SettingsItem>

        <div>
            <SettingsButton
                type={"button"}
                disabled={publishStatus.some(({publishing}) => publishing) || publishStatus.every(({success}) => success)}
                cellSize={modalCellSize}
                onClick={async () => {
                    for (const [index, chunk] of chunks.entries()) {
                        await publish(index, chunk);
                    }
                    await publish(undefined, grids);
                }}
            >
                Publish
            </SettingsButton>

            <SettingsButton
                type={"button"}
                cellSize={modalCellSize}
                onClick={onClose}
            >
                Close
            </SettingsButton>
        </div>
    </Modal>;
});
