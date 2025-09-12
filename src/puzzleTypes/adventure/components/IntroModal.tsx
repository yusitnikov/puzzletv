import { observer } from "mobx-react-lite";
import { Modal } from "../../../components/layout/modal/Modal";
import { Button } from "../../../components/layout/button/Button";
import { globalPaddingCoeff } from "../../../components/app/globals";
import { PuzzleContextProps } from "../../../types/puzzle/PuzzleContext";
import { AdventurePTM } from "../types/AdventurePTM";

export const IntroModal = observer(function IntroModalFc({ context }: PuzzleContextProps<AdventurePTM>) {
    const { cellSizeForSidePanel: cellSize } = context;

    if (context.stateExtension.introViewed) {
        return null;
    }

    return (
        <Modal cellSize={cellSize}>
            <div>
                While plenty of 12-year-olds love adventure, most don't have bedrooms like yours: filled with fossil
                replicas, antique maps, and hiking gear. With heroes like Jane Goodall, John Muir, and Jacques Cousteau,
                you have wanted to go on an adventure of your own for years. Your parents, ever-cautious, have decided
                you are old enough and have gotten permission from some neighbors to explore their land. With your
                compass, specimen jars, and your map (this puzzle) ready to be filled in, you set off!
            </div>

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
