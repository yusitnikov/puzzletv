import {observer} from "mobx-react-lite";
import {HTMLAttributes, useEffect, useMemo, useRef, useState} from "react";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";
import {useLastValueRef} from "../../../hooks/useLastValueRef";

export interface JsonEditorProps extends HTMLAttributes<HTMLDivElement> {
    value: any;
    onChange: (value: any) => void;
}

export const JsonEditor = observer(function JsonEditor(
    {
        value,
        onChange,
        ...divProps
    }: JsonEditorProps
) {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    const valueRef = useRef<any>();
    const onChangeRef = useLastValueRef(onChange);

    const editor = useMemo(
        () => ref && new JSONEditor(ref, {
            mode: "code",
            onChangeText: (text) => {
                try {
                    const value = JSON.parse(text);
                    valueRef.current = value;
                    onChangeRef.current?.(value);
                } catch {
                    // NOOP
                }
            },
            search: false,
            enableSort: false,
            enableTransform: false,
        }),
        [ref, onChangeRef]
    );

    useEffect(() => {
        if (editor && value !== valueRef.current) {
            valueRef.current = value;
            editor.set(value);
        }
    }, [editor, value]);

    useEffect(() => {
        editor?.expandAll?.();

        return () => {
            editor?.destroy();
        };
    }, [editor]);

    return <div ref={setRef} {...divProps} />;
});
