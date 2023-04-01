import {ControlButtonItemProps} from "./ControlButtonsManager";
import {CellWriteMode} from "../../../types/sudoku/CellWriteMode";
import {CellWriteModeButton} from "./CellWriteModeButton";
import {useTranslate} from "../../../hooks/useTranslate";
import {AutoSvg} from "../../svg/auto-svg/AutoSvg";
import {textColor} from "../../app/globals";
import {ControlButton} from "./ControlButton";
import {useCallback} from "react";

export const MoveDigitModeButton = <CellType, ExType, ProcessedExType>(
    {context, top, left}: ControlButtonItemProps<CellType, ExType, ProcessedExType>
) => {
    const {
        cellSizeForSidePanel: cellSize,
        state: {processed: {cellWriteMode}},
        onStateChange,
    } = context;

    const translate = useTranslate();

    const handleResetPosition = useCallback(
        () => onStateChange({loopOffset: {top: 0, left: 0}}),
        [onStateChange]
    )

    return <>
        <CellWriteModeButton
            top={top}
            left={left}
            cellWriteMode={CellWriteMode.move}
            data={(size) => <AutoSvg
                width={size}
                height={size}
                viewBox={{
                    top: -1.1,
                    left: -1.1,
                    width: 2.2,
                    height: 2.2,
                }}
            >
                <line x1={-1} y1={0} x2={1} y2={0} stroke={textColor} strokeWidth={0.15}/>
                <polyline points={"-0.7,0.3 -1,0 -0.7,-0.3"} stroke={textColor} strokeWidth={0.15}/>
                <polyline points={"0.7,0.3 1,0 0.7,-0.3"} stroke={textColor} strokeWidth={0.15}/>
                <line x1={0} y1={-1} x2={0} y2={1} stroke={textColor} strokeWidth={0.15}/>
                <polyline points={"0.3,-0.7 0,-1 -0.3,-0.7"} stroke={textColor} strokeWidth={0.15}/>
                <polyline points={"0.3,0.7 0,1 -0.3,0.7"} stroke={textColor} strokeWidth={0.15}/>
            </AutoSvg>}
            noBorders={true}
            title={`${translate("Move the grid")} (${translate("shortcut")}: Alt+Shift)`}
            context={context}
        />

        {cellWriteMode === CellWriteMode.move && <ControlButton
            cellSize={cellSize}
            left={0}
            top={0}
            width={3}
            fullWidth={true}
            onClick={handleResetPosition}
        >
            {contentSize => <div style={{fontSize: contentSize * 0.6}}>
                {translate("Reset position")}
            </div>}
        </ControlButton>}
    </>;
};
