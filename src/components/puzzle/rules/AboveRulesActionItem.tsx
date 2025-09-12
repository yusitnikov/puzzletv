import { ReactNode } from "react";
import { observer } from "mobx-react-lite";
import {
    aboveRulesTextHeightCoeff,
    lightOrangeColor,
    rulesHeaderPaddingCoeff,
    rulesMarginCoeff,
} from "../../app/globals";
import { Button } from "../../layout/button/Button";
import { PuzzleContext } from "../../../types/puzzle/PuzzleContext";
import { AnyPTM } from "../../../types/puzzle/PuzzleTypeMap";

interface AboveRulesActionItemProps<T extends AnyPTM> {
    context: PuzzleContext<T>;
    visible: boolean;
    message: ReactNode;
    buttonText: ReactNode;
    onClick: () => void;
}

function AboveRulesActionItemFc<T extends AnyPTM>({
    context,
    visible,
    message,
    buttonText,
    onClick,
}: AboveRulesActionItemProps<T>) {
    const { cellSizeForSidePanel: cellSize } = context;

    const coeff = visible ? 1 : 0;

    return (
        <div
            style={{
                background: lightOrangeColor,
                marginTop: cellSize * rulesMarginCoeff * coeff,
                marginBottom: cellSize * rulesMarginCoeff * coeff * 2,
                padding: `${(cellSize * rulesHeaderPaddingCoeff * coeff) / 2}px ${cellSize * rulesHeaderPaddingCoeff}px`,
                fontSize: cellSize * aboveRulesTextHeightCoeff,
                lineHeight: `${cellSize * aboveRulesTextHeightCoeff * 1.5}px`,
                height: cellSize * aboveRulesTextHeightCoeff * 3 * coeff,
                border: "2px solid #f00",
                opacity: coeff,
                overflow: "hidden",
                transition: "0.3s all linear",
                textAlign: "center",
            }}
        >
            {message} &nbsp;
            <Button
                type={"button"}
                cellSize={cellSize}
                style={{
                    fontFamily: "inherit",
                    fontSize: "inherit",
                    lineHeight: `${cellSize * aboveRulesTextHeightCoeff * 1.5 - 2}px`,
                    paddingTop: 0,
                    paddingBottom: 0,
                }}
                onClick={onClick}
            >
                {buttonText}
            </Button>
        </div>
    );
}

export const AboveRulesActionItem = observer(AboveRulesActionItemFc) as typeof AboveRulesActionItemFc;
