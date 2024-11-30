import { observer } from "mobx-react-lite";
import { HTMLAttributes, useEffect, useMemo, useState } from "react";
import JSONEditor from "jsoneditor";
import "jsoneditor/dist/jsoneditor.min.css";
import { useLastValueRef } from "../../../hooks/useLastValueRef";

export interface JsonEditorProps extends HTMLAttributes<HTMLDivElement> {
    value: any;
    onChange: (value: any) => void;
}

export const JsonEditor = observer(function JsonEditor({ value, onChange, ...divProps }: JsonEditorProps) {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    const [initialValue] = useState(value);
    const onChangeRef = useLastValueRef(onChange);

    const editor = useMemo(() => {
        if (!ref) {
            return undefined;
        }
        const editor = new JSONEditor(ref, {
            mode: "code",
            onChangeText: (text) => {
                try {
                    const value = JSON.parse(text);
                    onChangeRef.current?.(value);
                } catch {
                    // NOOP
                }
            },
            search: false,
            enableSort: false,
            enableTransform: false,
        });
        editor.set(initialValue);
        return editor;
    }, [ref, initialValue, onChangeRef]);

    useEffect(() => {
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    return <div ref={setRef} {...divProps} />;
});
