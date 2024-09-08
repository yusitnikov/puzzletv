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
import {darkBlueColor, darkGreenColor, darkGreyColor, errorColor} from "../globals";
import {LinkExternal} from "@emotion-icons/boxicons-regular";
import {SettingsButton} from "../../sudoku/controls/settings/SettingsButton";
import {CaterpillarGrid} from "./types";

interface PublishModalProps {
    grids: CaterpillarGrid[];
    onClose: () => void;
}

export const PublishModal = observer(function PublishModal({grids, onClose}: PublishModalProps) {
    profiler.trace();

    const windowSize = useWindowSize(false);
    const modalCellSize = Math.min(windowSize.width, windowSize.height) * 0.125;

    const [publishing, setPublishing] = useState(false);
    const [publishSuccess, setPublishSuccess] = useState<boolean | undefined>();

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
            <span style={{
                color: publishing ? darkGreyColor : publishSuccess ? darkGreenColor : errorColor
            }}>
                {
                    publishing
                        ? "Publishing..."
                        : publishSuccess === undefined
                            ? <>&nbsp;</>
                            : publishSuccess
                                ? <a
                                    href={`${sudokuPadBaseUrl}${baseShortId.get()}?setting-nogrid=1&setting-largepuzzle=1`}
                                    target={"_blank"}
                                    style={{
                                        textDecoration: "none",
                                        color: "inherit",
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: "0.5em",
                                    }}
                                >
                                    <span>Published</span>

                                    <LinkExternal color={darkBlueColor} size={"1em"}/>
                                </a>
                                : "Failed to publish"
                }
            </span>
        </SettingsItem>

        <div>
            <SettingsButton
                type={"button"}
                disabled={publishing || publishSuccess}
                cellSize={modalCellSize}
                onClick={async () => {
                    let compiledGrids: Scl;
                    try {
                        compiledGrids = compileGrids(grids);
                    } catch (e: unknown) {
                        console.error(e);
                        setPublishSuccess(false);
                        return;
                    }

                    setPublishing(true);
                    setPublishSuccess(undefined);

                    const success = await publishToSudokuPad(
                        baseShortId.get(),
                        sclToPuzzleId(compiledGrids!),
                        apiKey.get()
                    );

                    setPublishSuccess(success);
                    setPublishing(false);
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
