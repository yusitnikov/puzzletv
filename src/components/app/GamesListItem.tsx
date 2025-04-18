import { ReactNode } from "react";
import { observer } from "mobx-react-lite";
import { profiler } from "../../utils/profiler";
import { Size } from "../../types/layout/Size";
import { textColor } from "./globals";
import { translate } from "../../utils/translate";

export interface GamesListItemProps {
    name: string;
    imageUrl: string;
    imageSize?: number | Size;
    imageBorder?: boolean;
    author?: string;
    playLink: ReactNode;
    children: ReactNode;
}

export const GamesListItem = observer(function GamesListItem({
    name,
    imageUrl,
    imageSize = 300,
    imageBorder,
    author,
    playLink,
    children,
}: GamesListItemProps) {
    profiler.trace();

    return (
        <>
            <h2>{name}</h2>

            <img
                src={`${process.env.PUBLIC_URL}${imageUrl}`}
                alt={name}
                style={{
                    display: "inline-block",
                    verticalAlign: "top",
                    width: typeof imageSize === "number" ? imageSize : imageSize.width,
                    height: typeof imageSize === "number" ? imageSize : imageSize.height,
                    border: imageBorder ? `1px ${textColor} solid` : "none",
                    marginRight: "1em",
                    marginBottom: "0.5em",
                }}
            />

            <div
                style={{
                    display: "inline-block",
                    verticalAlign: "top",
                }}
            >
                {children}

                <p>
                    {translate("Play")}: {playLink}
                </p>

                {author && (
                    <p>
                        {translate("Game idea")}: {author}
                    </p>
                )}
            </div>
        </>
    );
});
