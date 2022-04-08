import {ReactNode, useEffect} from "react";
import {createPortal} from "react-dom";

export interface TitleProps {
    children: ReactNode;
}

export const Title = ({children}: TitleProps) => {
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
};
