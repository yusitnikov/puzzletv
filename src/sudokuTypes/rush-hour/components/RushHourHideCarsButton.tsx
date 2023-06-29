import {LanguageCode} from "../../../types/translations/LanguageCode";
import {ControlButton} from "../../../components/sudoku/controls/ControlButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {ControlButtonItemProps} from "../../../components/sudoku/controls/ControlButtonsManager";
import {useEventListener} from "../../../hooks/useEventListener";
import {AutoSvg} from "../../../components/svg/auto-svg/AutoSvg";
import {RushHourPTM} from "../types/RushHourPTM";
import {errorColor, yellowColor} from "../../../components/app/globals";
import {RushHourCar} from "./RushHourCar";
import {TransformedRectGraphics} from "../../../contexts/TransformContext";
import {transformRect} from "../../../types/layout/Rect";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {observer} from "mobx-react-lite";
import {profiler} from "../../../utils/profiler";

const crossLineWidth = 0.1;

export const RushHourHideCarsButton = observer(function RushHourHideCarsButtonFc(
    {context, top, left}: ControlButtonItemProps<RushHourPTM>
) {
    profiler.trace();

    const {
        cellSizeForSidePanel: cellSize,
        cellWriteMode,
        stateExtension: {hideCars},
    } = context;

    const translate = useTranslate();

    const handleToggle = () => context.onStateChange({extension: {hideCars: !hideCars}});

    useEventListener(window, "keydown", (ev) => {
        if (ev.code === "KeyH") {
            handleToggle();
            ev.preventDefault();
        }
    });

    if (cellWriteMode === CellWriteMode.move) {
        return null;
    }

    return <ControlButton
        cellSize={cellSize}
        top={top}
        left={left}
        onClick={handleToggle}
        title={`${translate({
            [LanguageCode.en]: "show the cars",
            [LanguageCode.ru]: "показывать машины",
            [LanguageCode.de]: "die Autos zeigen",
        })} (${translate("shortcut")}: H)`}
    >
        {(contentSize) => <AutoSvg
            width={contentSize}
            height={contentSize}
            viewBox={{top: 0, left: 0, width: 1, height: 1}}
        >
            <TransformedRectGraphics rect={transformRect({
                top: 0.25,
                left: 0,
                width: 0.5,
                height: 0.5,
            })}>
                <RushHourCar color={yellowColor} left={0} top={0} width={2} height={1}/>
            </TransformedRectGraphics>

            {hideCars && <>
                <line
                    x1={crossLineWidth}
                    y1={crossLineWidth}
                    x2={1 - crossLineWidth}
                    y2={1 - crossLineWidth}
                    stroke={errorColor}
                    strokeWidth={crossLineWidth}
                />
                <line
                    x1={crossLineWidth}
                    y1={1 - crossLineWidth}
                    x2={1 - crossLineWidth}
                    y2={crossLineWidth}
                    stroke={errorColor}
                    strokeWidth={crossLineWidth}
                />
            </>}
        </AutoSvg>}
    </ControlButton>;
});
