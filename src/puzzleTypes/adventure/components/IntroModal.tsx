import { observer } from "mobx-react-lite";
import { Modal } from "../../../components/layout/modal/Modal";
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
        <Modal
            cellSize={cellSize}
            onClose={() => context.onStateChange({ extension: { introViewed: true } })}
            buttons={["Your adventure begins!"]}
        >
            {intro()}
        </Modal>
    );
});
