import {useState} from "react";
import {copyToClipboard} from "../utils/clipboard";

export const useCopyToClipboard = (): [(text: string) => Promise<void>, boolean] => {
    const [isCopied, setIsCopied] = useState(false);

    return [
        async (text: string) => {
            await copyToClipboard(text);
            setIsCopied(true);
            window.setTimeout(() => setIsCopied(false), 1000);
        },
        isCopied,
    ];
};
