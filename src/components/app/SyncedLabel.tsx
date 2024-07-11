import {useState} from "react";
import {observer} from "mobx-react-lite";
import {profiler} from "../../utils/profiler";
import {useAblyChannelState} from "../../hooks/useAbly";
import {ablyOptions} from "../../hooks/useMultiPlayer";
import {useEventListener} from "../../hooks/useEventListener";

export interface SyncedLabelProps {
    name: string;
    isObs?: boolean;
}

export const SyncedLabel = observer(function SyncedLabel({name, isObs}: SyncedLabelProps) {
    profiler.trace();

    const [text = "", setText, connected] = useAblyChannelState<string>(ablyOptions, "label-sync-" + name);
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

    return <div
        style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "50px",
        }}
        onClick={() => {
            if (connected && !isEditing) {
                start();
            }
        }}
    >
        {!isEditing && <span>{text || (isObs ? "" : "click to edit...")}</span>}

        {isEditing && <input
            type={"text"}
            placeholder={"Start typing..."}
            value={textInput}
            onInput={(ev) => setTextInput(ev.currentTarget.value)}
            autoFocus={true}
            style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: "none",
                outline: "none",
                font: "inherit",
                textAlign: "center",
                padding: 0,
                margin: 0,
            }}
        />}
    </div>;
});
