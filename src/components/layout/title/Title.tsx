import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { observer } from "mobx-react-lite";
import { profiler } from "../../../utils/profiler";

export interface TitleProps {
    children: ReactNode;
}

export const Title = observer(function TitleFc({ children }: TitleProps) {
    profiler.trace();

    useEffect(() => {
        const prevTitle = window.document.head.querySelector("title:not(.react-title)");
        if (prevTitle) {
            prevTitle.remove();

            return () => {
                document.head.appendChild(prevTitle);
            };
        }
    }, []);

    return createPortal(<title className={"react-title"}>{children}</title>, window.document.head);
});
