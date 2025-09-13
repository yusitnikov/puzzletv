import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";
import { compileGrids } from "./compileGrids";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { normalizeSclMetadata, puzzleIdToScl, Scl } from "../../../utils/sudokuPad";
import { Modal } from "../../layout/modal/Modal";
import { SettingsItem } from "../../puzzle/controls/settings/SettingsItem";
import { SettingsButton } from "../../puzzle/controls/settings/SettingsButton";
import { CaterpillarGrid } from "./types";
import { parseSolutionString } from "./utils";

interface DownloadModalProps {
    grids: CaterpillarGrid[];
    onClose: () => void;
}

export const DownloadModal = observer(function DownloadModal({ grids, onClose }: DownloadModalProps) {
    profiler.trace();

    const windowSize = useWindowSize(false);
    const modalCellSize = Math.min(windowSize.width, windowSize.height) * 0.125;

    let compiledGrids: Scl | undefined = undefined;
    try {
        compiledGrids = compileGrids(grids);
    } catch (e: unknown) {
        console.error(e);
    }

    const gridsMetadata = grids.map((grid, index) => {
        const parsedGrid = normalizeSclMetadata(puzzleIdToScl(grid.data));
        const {
            title = "Untitled",
            author = "Unknown",
            rules = "Undefined",
            solution: solutionStr,
        } = parsedGrid.metadata ?? {};

        const result = { title, author, rules };

        const next = grids[index + 1];
        if (!next) {
            return result;
        }

        const left = Math.max(0, next.offset.left - grid.offset.left);
        const top = Math.max(0, next.offset.top - grid.offset.top);

        if (!solutionStr) {
            return result;
        }
        const solution = parseSolutionString(solutionStr, grid.size ?? 6);

        return {
            ...result,
            digits: `${solution[top]?.[left]}${solution[top]?.[left + 1]}${solution[top + 1]?.[left]}${solution[top + 1]?.[left + 1]}`,
        };
    });

    return (
        <Modal noHeader={true} cellSize={modalCellSize} onClose={onClose} style={{ gap: 0 }}>
            {compiledGrids && (
                <SettingsItem>
                    <span>Puzzle JSON:</span>

                    <SettingsButton
                        component={"a"}
                        href={
                            "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(compiledGrids, null, 2))
                        }
                        download={"caterpillar-puzzle.json"}
                        cellSize={modalCellSize}
                    >
                        Download
                    </SettingsButton>
                </SettingsItem>
            )}

            <SettingsItem>
                <span>Grids metadata:</span>

                <SettingsButton
                    component={"a"}
                    href={"data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gridsMetadata, null, 2))}
                    download={"caterpillar-grids.json"}
                    cellSize={modalCellSize}
                >
                    Download
                </SettingsButton>
            </SettingsItem>

            <div>
                <SettingsButton type={"button"} cellSize={modalCellSize} onClick={onClose}>
                    Close
                </SettingsButton>
            </div>
        </Modal>
    );
});
