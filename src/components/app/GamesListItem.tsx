import {ReactNode} from "react";
import {useTranslate} from "../../hooks/useTranslate";

export interface GamesListItemProps {
    name: string;
    imageUrl: string;
    imageSize?: number;
    author?: string;
    playLink: ReactNode;
    children: ReactNode;
}

export const GamesListItem = ({name, imageUrl, imageSize = 300, author, playLink, children}: GamesListItemProps) => {
    const translate = useTranslate();

    return <>
        <h2>{name}</h2>

        <img
            src={imageUrl}
            alt={name}
            style={{
                display: "inline-block",
                verticalAlign: "top",
                width: imageSize,
                height: imageSize,
                marginRight: "1em",
                marginBottom: "0.5em",
            }}
        />

        <div style={{
            display: "inline-block",
            verticalAlign: "top",
        }}>
            {children}

            <p>{translate("Play")}: {playLink}</p>

            {author && <p>{translate("Game idea")}: {author}</p>}
        </div>
    </>;
};
