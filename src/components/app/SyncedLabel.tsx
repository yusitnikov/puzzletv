/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { profiler } from "../../utils/profiler";
import { useAblyChannelState } from "../../hooks/useAbly";
import { caterpillarAblyOptions } from "./Caterpillar";
import { useEventListener } from "../../hooks/useEventListener";

export interface SyncedLabelProps {
    name: string;
    isObs?: boolean;
}

const StyledContainer = styled.div`
    position: fixed;
    inset: 0;
    display: flex;
    justify-content: start;
    align-items: center;
    font-family: Lato, sans-serif;
    font-size: 50px;
    font-weight: bold;
    -webkit-text-stroke: 1px white;
    text-shadow: 0 0 2px white;
`;

const StyledInput = styled.input({
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: "none",
    outline: "none",
    font: "inherit",
    background: "transparent",
    textAlign: "left",
    padding: 0,
    margin: 0,
});

export const SyncedLabel = observer(function SyncedLabel({ name, isObs }: SyncedLabelProps) {
    profiler.trace();

    const [text = "", setText, connected] = useAblyChannelState<string>(caterpillarAblyOptions, "label-sync-" + name);
    const [textInput, setTextInput] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const start = () => {
        setTextInput(text);
        setIsEditing(true);
    };
    const submit = () => {
        setText(textInput);
        setIsEditing(false);
    };
    const cancel = () => {
        setIsEditing(false);
    };

    useEventListener(window, "keydown", (ev) => {
        if (!connected) {
            return;
        }

        switch (ev.code) {
            case "Escape":
                ev.preventDefault();
                cancel();
                break;
            case "Enter":
                ev.preventDefault();
                if (isEditing) {
                    submit();
                } else {
                    start();
                }
                break;
        }
    });

    return (
        <StyledContainer
            onClick={() => {
                if (connected && !isEditing) {
                    start();
                }
            }}
        >
            {!isEditing && <span>{text || (isObs ? "" : "click to edit...")}</span>}

            {isEditing && (
                <StyledInput
                    type={"text"}
                    placeholder={"Start typing..."}
                    value={textInput}
                    onInput={(ev) => setTextInput(ev.currentTarget.value)}
                    autoFocus={true}
                />
            )}
        </StyledContainer>
    );
});
