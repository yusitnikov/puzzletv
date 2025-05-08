import { ControlButton, controlButtonPaddingCoeff } from "../../../components/puzzle/controls/ControlButton";
import { useEventListener } from "../../../hooks/useEventListener";
import { ChessColor } from "../types/ChessColor";
import { Absolute } from "../../../components/layout/absolute/Absolute";
import { ArrowLeft } from "@emotion-icons/fluentui-system-filled";
import { useCallback, useState } from "react";
import { ControlButtonItemProps } from "../../../components/puzzle/controls/ControlButtonsManager";
import { ChessPTM } from "../types/ChessPTM";
import { observer } from "mobx-react-lite";
import { settings } from "../../../types/layout/Settings";
import { profiler } from "../../../utils/profiler";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { translate } from "../../../utils/translate";

export const ChessMainControls = observer(function ChessMainControls({ context }: ControlButtonItemProps<ChessPTM>) {
    profiler.trace();

    const { cellSizeForSidePanel: cellSize } = context;

    const [usedColorSelectionOnce, setUsedColorSelectionOnce] = useState(false);

    const handleToggleColor = useCallback(() => {
        context.onStateChange(({ stateExtension: { selectedColor } }) => ({
            extension: {
                selectedColor: selectedColor === ChessColor.white ? ChessColor.black : ChessColor.white,
            },
        }));

        setUsedColorSelectionOnce(true);
    }, [context, setUsedColorSelectionOnce]);

    useEventListener(window, "keydown", (ev) => {
        if (settings.isOpened) {
            return;
        }

        const { code, ctrlKey, metaKey, shiftKey } = ev;

        switch (code) {
            case "KeyC":
                if (!ctrlKey && !metaKey && shiftKey) {
                    handleToggleColor();
                    ev.preventDefault();
                }
                break;
        }
    });

    if (context.digitsCountInCurrentMode > 6) {
        return null;
    }

    return (
        <>
            {!usedColorSelectionOnce && (
                <Absolute
                    left={cellSize}
                    top={cellSize * 2 * (1 + controlButtonPaddingCoeff)}
                    width={cellSize * 2 * (1 + controlButtonPaddingCoeff)}
                    style={{
                        fontSize: cellSize * 0.3,
                        lineHeight: `${cellSize * 0.3}px`,
                    }}
                >
                    <Absolute
                        left={cellSize * 0.5}
                        width={cellSize * (1.5 + 2 * controlButtonPaddingCoeff)}
                        height={cellSize}
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {translate("Chess piece color")}
                    </Absolute>

                    <Absolute top={cellSize * 0.25} width={cellSize * 0.5} height={cellSize * 0.5}>
                        <ArrowLeft />
                    </Absolute>
                </Absolute>
            )}

            <ControlButton
                left={0}
                top={2}
                cellSize={cellSize}
                onClick={handleToggleColor}
                title={`${translate("Chess piece color")} (${translate("click to toggle")}, ${translate("shortcut")}: Shift+C)`}
            >
                {(contentSize) => <PieceColorButtonRect context={context} contentSize={contentSize} />}
            </ControlButton>
        </>
    );
});

interface PieceColorButtonRectProps {
    context: PuzzleContext<ChessPTM>;
    contentSize: number;
}

const PieceColorButtonRect = observer(function PieceColorButtonRect({
    context: {
        stateExtension: { selectedColor },
    },
    contentSize,
}: PieceColorButtonRectProps) {
    profiler.trace();

    return (
        <Absolute
            width={contentSize}
            height={contentSize}
            borderWidth={1}
            style={{
                backgroundColor: selectedColor === ChessColor.white ? "#fff" : "#000",
            }}
        />
    );
});
