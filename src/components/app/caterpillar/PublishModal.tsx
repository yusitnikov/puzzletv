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
import {greenColor, lighterGreyColor, lightGreyColor, lightRedColor} from "../globals";
import {SettingsButton} from "../../sudoku/controls/settings/SettingsButton";
import {CaterpillarGrid} from "./types";
import {splitArrayIntoChunks} from "../../../utils/array";

const chunkSize = 28;

const getShortId = (index?: number) => baseShortId.get() + (index === undefined ? "" : index + 1);
const getPuzzleLink = (index?: number) =>
    `${sudokuPadBaseUrl}${getShortId(index)}?setting-nogrid=1&setting-largepuzzle=1`;

interface PublishStatus {
    publishing?: boolean;
    success?: boolean;
}

interface PublishModalProps {
    grids: CaterpillarGrid[];
    onClose: () => void;
}

export const PublishModal = observer(function PublishModal({grids, onClose}: PublishModalProps) {
    profiler.trace();

    const windowSize = useWindowSize(false);
    const modalCellSize = Math.min(windowSize.width, windowSize.height) * 0.125;

    const chunks = splitArrayIntoChunks(grids, chunkSize);

    const [publishStatus, setPublishStatus] = useState<PublishStatus[]>(
        () => chunks.map(() => ({}))
    );

    const [fullPublishStatus, setFullPublishStatus] = useState<PublishStatus>({});

    const publish = async(
        index: number | undefined,
        grids: CaterpillarGrid[],
        onUpdate: (status: PublishStatus) => void,
    ) => {
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
            onUpdate({});
            return;
        }

        onUpdate({publishing: true});

        const success = await publishToSudokuPad(
            getShortId(index),
            sclToPuzzleId(compiledGrids!),
            apiKey.get()
        );

        onUpdate({success});
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
            <div style={{display: "flex", flexDirection: "column", gap: 5}}>
                <div style={{display: "flex", gap: 5, justifyContent: "space-between"}}>
                    {publishStatus.map((status, index) => <PublishStatusIndicator
                        key={index}
                        index={index}
                        {...status}
                    />)}
                </div>

                <PublishStatusIndicator
                    index={undefined}
                    {...fullPublishStatus}
                />
            </div>
        </SettingsItem>

        <div style={{marginTop: "1em"}}>
            <SettingsButton
                type={"button"}
                disabled={publishStatus.some(({publishing}) => publishing) || publishStatus.every(({success}) => success)}
                cellSize={modalCellSize}
                onClick={async () => {
                    for (const [index, chunk] of chunks.entries()) {
                        await publish(index, chunk, (status) => setPublishStatus((prev) => {
                            const next = [...prev];
                            next[index] = status;
                            return next;
                        }));
                    }

                    await publish(undefined, grids, setFullPublishStatus);
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


interface PublishStatusIndicatorProps extends PublishStatus {
    index?: number;
}

const PublishStatusIndicator = observer(function ({index, publishing, success}: PublishStatusIndicatorProps) {
    return <a
        href={getPuzzleLink(index)}
        target={"_blank"}
        style={{
            padding: "0.5em 1em",
            backgroundColor: publishing ? lightGreyColor : success === undefined ? lighterGreyColor : success ? greenColor : lightRedColor,
        }}
    >
        {index === undefined ? "Full puzzle" : index + 1}
    </a>;
});
