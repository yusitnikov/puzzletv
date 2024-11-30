import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { compileGrids } from "./compileGrids";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { publishToSudokuPad, Scl, sclToPuzzleId, sudokuPadBaseUrl } from "../../../utils/sudokuPad";
import { useState } from "react";
import { Modal } from "../../layout/modal/Modal";
import { SettingsItem } from "../../sudoku/controls/settings/SettingsItem";
import { SettingsTextBox } from "../../sudoku/controls/settings/SettingsTextBox";
import { apiKey, baseShortId, baseSmallShortId } from "./globals";
import { greenColor, lighterGreyColor, lightGreyColor, lightRedColor } from "../globals";
import { SettingsButton } from "../../sudoku/controls/settings/SettingsButton";
import { CaterpillarGrid } from "./types";
import { splitArrayIntoChunks } from "../../../utils/array";

const chunkSize = 28;

const getShortId = (index?: number) => (index === undefined ? "" : index + 1);
const getPuzzleLink = (base: string, index?: number) =>
    `${sudokuPadBaseUrl}${base}${getShortId(index)}?setting-nogrid=1&setting-largepuzzle=1`;

interface PublishStatus {
    publishing?: boolean;
    success?: boolean;
}

const publish = async (
    base: string,
    index: number | undefined,
    chunksCount: number,
    grids: CaterpillarGrid[],
    onUpdate: (status: PublishStatus) => void,
    prevGrid?: CaterpillarGrid,
    allowSafetyMarginOptimization = false,
) => {
    let compiledGrids: Scl;
    try {
        compiledGrids =
            index === undefined
                ? compileGrids(grids)
                : compileGrids(
                      grids,
                      base.split("/").reverse()[0] + (index + 1).toString(),
                      index * chunkSize,
                      index > 0 ? getPuzzleLink(base, index - 1) : "",
                      index < chunksCount - 1 ? getPuzzleLink(base, index + 1) : "",
                      prevGrid
                          ? {
                                top: Math.max(prevGrid.offset.top - grids[0].offset.top, 0),
                                left: Math.max(prevGrid.offset.left - grids[0].offset.left, 0),
                            }
                          : undefined,
                      allowSafetyMarginOptimization && index > 0 && index < chunksCount - 1 ? 1 : 6,
                  );
    } catch (e: unknown) {
        console.error(e);
        onUpdate({});
        return;
    }

    onUpdate({ publishing: true });

    const success = await publishToSudokuPad(base + getShortId(index), sclToPuzzleId(compiledGrids!), apiKey.get());

    onUpdate({ success });
};

const useChunksPublish = (
    grids: CaterpillarGrid[],
    chunkSize: number,
    base: string,
    allowSafetyMarginOptimization: boolean,
) => {
    const chunks = splitArrayIntoChunks(grids, chunkSize);

    const [publishStatus, setPublishStatus] = useState<PublishStatus[]>(() => chunks.map(() => ({})));

    return {
        publish: async () => {
            for (const [index, chunk] of chunks.entries()) {
                const prevChunk = chunks[index - 1];
                await publish(
                    base,
                    index,
                    chunks.length,
                    chunk,
                    (status) =>
                        setPublishStatus((prev) => {
                            const next = [...prev];
                            next[index] = status;
                            return next;
                        }),
                    prevChunk ? prevChunk[prevChunk.length - 1] : undefined,
                    allowSafetyMarginOptimization,
                );
            }
        },
        canRepublish:
            !publishStatus.some(({ publishing }) => publishing) && !publishStatus.every(({ success }) => success),
        indicators: (
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                {publishStatus.map((status, index) => (
                    <PublishStatusIndicator key={index} base={base} index={index} {...status} />
                ))}
            </div>
        ),
    };
};

interface PublishModalProps {
    grids: CaterpillarGrid[];
    onClose: () => void;
}

export const PublishModal = observer(function PublishModal({ grids, onClose }: PublishModalProps) {
    profiler.trace();

    const windowSize = useWindowSize(false);
    const modalCellSize = Math.min(windowSize.width, windowSize.height) * 0.125;

    const chunks1 = useChunksPublish(grids, 28, baseShortId.get(), false);
    const chunks2 = useChunksPublish(grids, 7, baseSmallShortId.get(), true);

    const [fullPublishStatus, setFullPublishStatus] = useState<PublishStatus>({});

    return (
        <Modal noHeader={true} cellSize={modalCellSize} onClose={onClose} style={{ maxWidth: "70%" }}>
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
                <span>Small chunks short ID:</span>

                <SettingsTextBox
                    type={"text"}
                    cellSize={modalCellSize}
                    value={baseSmallShortId.get()}
                    onChange={(ev) => baseSmallShortId.set(ev.target.value)}
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
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    {chunks1.indicators}

                    {chunks2.indicators}

                    <PublishStatusIndicator base={baseShortId.get()} index={undefined} {...fullPublishStatus} />
                </div>
            </SettingsItem>

            <div style={{ marginTop: "1em" }}>
                <SettingsButton
                    type={"button"}
                    disabled={!chunks1.canRepublish || !chunks2.canRepublish}
                    cellSize={modalCellSize}
                    onClick={async () => {
                        await chunks1.publish();
                        await chunks2.publish();
                        await publish(baseShortId.get(), undefined, 1, grids, setFullPublishStatus);
                    }}
                >
                    Publish
                </SettingsButton>

                <SettingsButton type={"button"} cellSize={modalCellSize} onClick={onClose}>
                    Close
                </SettingsButton>
            </div>
        </Modal>
    );
});

interface PublishStatusIndicatorProps extends PublishStatus {
    base: string;
    index?: number;
}

const PublishStatusIndicator = observer(function ({ base, index, publishing, success }: PublishStatusIndicatorProps) {
    return (
        <a
            href={getPuzzleLink(base, index)}
            target={"_blank"}
            style={{
                padding: "0.5em 1em",
                backgroundColor: publishing
                    ? lightGreyColor
                    : success === undefined
                      ? lighterGreyColor
                      : success
                        ? greenColor
                        : lightRedColor,
            }}
        >
            {index === undefined ? "Full puzzle" : index + 1}
        </a>
    );
});
