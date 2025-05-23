import { ControlButtonItemProps, ControlButtonItemPropsGenericFc } from "./ControlButtonsManager";
import { PuzzleInputMode } from "../../../types/puzzle/PuzzleInputMode";
import { PuzzleInputModeButton } from "./PuzzleInputModeButton";
import { AutoSvg } from "../../svg/auto-svg/AutoSvg";
import { UserLinesByData, UserMarkByData } from "../constraints/user-lines/UserLines";
import { CellMarkType } from "../../../types/puzzle/CellMark";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";
import { profiler } from "../../../utils/profiler";
import { observer } from "mobx-react-lite";
import { translate } from "../../../utils/translate";

export const LinesDigitModeButton: ControlButtonItemPropsGenericFc = observer(function LinesDigitModeButton<
    T extends AnyPTM,
>({ context, top, left }: ControlButtonItemProps<T>) {
    profiler.trace();

    const {
        cellSizeForSidePanel: cellSize,
        puzzle: { allowDrawing = [] },
    } = context;

    return (
        <PuzzleInputModeButton
            top={top}
            left={left}
            inputMode={PuzzleInputMode.lines}
            data={(contentSize) => {
                const offset = (cellSize - contentSize) / 2;

                return (
                    <AutoSvg
                        left={-offset}
                        top={-offset}
                        width={cellSize}
                        height={cellSize}
                        viewBox={{
                            top: -offset / contentSize,
                            left: -offset / contentSize,
                            width: cellSize / contentSize,
                            height: cellSize / contentSize,
                        }}
                    >
                        {allowDrawing.includes("border-line") && (
                            <UserLinesByData
                                cellSize={contentSize}
                                start={{ left: 0, top: 0 }}
                                end={{ left: 0, top: 1 }}
                            />
                        )}

                        {allowDrawing.includes("center-line") && (
                            <UserLinesByData
                                cellSize={contentSize}
                                start={{ left: 0.5, top: 0.5 }}
                                end={{ left: 1.5, top: 0.5 }}
                            />
                        )}

                        {allowDrawing.includes("center-mark") && (
                            <UserMarkByData
                                cellSize={contentSize}
                                position={{ left: 0.5, top: 0.5 }}
                                type={CellMarkType.O}
                                isCenter={true}
                            />
                        )}

                        {allowDrawing.includes("border-mark") && (
                            <UserMarkByData
                                cellSize={contentSize}
                                position={{ left: 0.5, top: 1 }}
                                type={CellMarkType.X}
                            />
                        )}

                        {allowDrawing.includes("corner-mark") && (
                            <UserMarkByData
                                cellSize={contentSize}
                                position={{ left: 1, top: 0 }}
                                type={CellMarkType.X}
                            />
                        )}
                    </AutoSvg>
                );
            }}
            childrenOnTopOfBorders={true}
            title={`${translate("Lines")} (${translate("shortcut")}: Alt)`}
            context={context}
        />
    );
});
