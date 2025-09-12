import { observer } from "mobx-react-lite";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { globalPaddingCoeff } from "../../../components/app/globals";
import { PuzzleContextProps } from "../../../types/puzzle/PuzzleContext";
import { AdventurePTM } from "../types/AdventurePTM";

export const IntroModal = observer(function IntroModalFc({ context }: PuzzleContextProps<AdventurePTM>) {
    const {
        cellSizeForSidePanel: cellSize,
        puzzle: {
            extension: { intro },
        },
    } = context;

    if (!intro || context.stateExtension.introViewed) {
        return null;
    }

    return (
        <Modal cellSize={cellSize}>
            {intro()}

            <div>
                <Button
                    type={"button"}
                    cellSize={cellSize}
                    onClick={() => context.onStateChange({ extension: { introViewed: true } })}
                    autoFocus={true}
                    style={{
                        marginTop: cellSize * globalPaddingCoeff,
                        padding: "0.5em 1em",
                    }}
                >
                    Your adventure begins!
                </Button>
            </div>
        </Modal>
    );
});
