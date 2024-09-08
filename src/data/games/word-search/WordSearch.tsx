import {observer} from "mobx-react-lite";
import {
    useAblyChannelPresenceMap,
    useSetMyAblyChannelPresence,
    useUserNames
} from "../../../hooks/useAbly";
import {ablyOptions, myClientId} from "../../../hooks/useMultiPlayer";
import {useEffect, useState} from "react";
import {settings} from "../../../types/layout/Settings";
import {WordSearchGameSettings, WordSearchLobbyState} from "./types";
import {Button} from "../../../components/layout/button/Button";
import {useTranslate} from "../../../hooks/useTranslate";
import {Grid} from "../../../components/layout/grid/Grid";
import {GridItem, GridItemList, GridItemTitle} from "./styled";
import {shuffleArray} from "../../../utils/random";
import {scrambleLetterForShuffling} from "../../alphabet";
import {indexes} from "../../../utils/indexes";
import {WordSearchGame} from "./WordSearchGame";
import {LanguageCode} from "../../../types/translations/LanguageCode";

const lobbyChannelName = "word-search-lobby";

export const WordSearch = observer(function WordSearch() {
    const translate = useTranslate();

    const [myNaiveState, setMyState] = useState<WordSearchLobbyState>({});

    const [gameSettings, setGameSettings] = useState<WordSearchGameSettings>();

    const getPlayerName = useUserNames(ablyOptions);

    useSetMyAblyChannelPresence(ablyOptions, lobbyChannelName, myNaiveState);

    const [playersMap] = useAblyChannelPresenceMap<WordSearchLobbyState>(ablyOptions, lobbyChannelName, false);

    const roomsMap: Record<string, { hostId: string, clientIds: string[], playing?: boolean }> = {};
    for (const [clientId, {roomHostId, roomId, playing}] of Object.entries(playersMap)) {
        if (!roomHostId || !roomId) {
            continue;
        }

        const host = playersMap[roomHostId];
        if (!host || host.roomId !== roomId) {
            if (!playing) {
                playersMap[clientId] = {};
            }
            continue;
        }

        roomsMap[roomId] ??= {
            hostId: roomHostId,
            clientIds: [],
        };
        roomsMap[roomId].clientIds[clientId === roomHostId ? "unshift" : "push"](clientId);
        roomsMap[roomId].playing ||= playing;
    }

    const myState = playersMap[myClientId] ?? myNaiveState;
    const myRoomId = myState.roomId;
    const myRoomHostId = myState.roomHostId;
    const myRoomHostPlaying = (myRoomId && roomsMap[myRoomId]?.playing) || false;

    useEffect(() => {
        if (myRoomHostPlaying) {
            setMyState(state => state.playing || !state.roomId ? state : {...state, playing: true});
        }
    }, [myRoomHostPlaying]);

    if (myState.playing) {
        return <WordSearchGame
            hostId={myRoomHostId!}
            roomId={myRoomId!}
            hostGameSettings={gameSettings}
            getPlayerName={getPlayerName}
            onLeave={() => {
                setMyState({});
                setGameSettings(undefined);
            }}
        />;
    }

    return <div>
        <h1>Word Search</h1>

        <p>
            <label>
                <span style={{marginRight: "0.5em"}}>{translate("What's your name?")}</span>

                <input
                    type={"text"}
                    value={settings.nickname.get()}
                    onInput={(ev) => settings.nickname.set(ev.currentTarget.value)}
                    style={{font: "inherit"}}
                />
            </label>
        </p>

        <Grid defaultWidth={400}>
            <GridItem key={"players"}>
                <GridItemTitle>{translate({
                    [LanguageCode.en]: "Available players",
                    [LanguageCode.ru]: "Свободные игроки",
                    [LanguageCode.de]: "Verfügbare Spieler",
                })}</GridItemTitle>

                <GridItemList>
                    {Object.entries(playersMap).map(([clientId, {roomId, playing}]) => !playing && !roomId && <div key={clientId}>
                        {getPlayerName(clientId)}
                    </div>)}
                </GridItemList>

                <div>
                    <Button
                        type={"button"}
                        onClick={() => setMyState({
                            roomHostId: myClientId,
                            roomId: Date.now().toString(),
                        })}
                    >
                        {translate("Create new game")}
                    </Button>
                </div>
            </GridItem>

            {Object.entries(roomsMap).map(([roomId, {hostId, clientIds, playing}]) => !playing && <GridItem
                key={`room-${roomId}`}
            >
                <GridItemTitle>
                    {translate("%1's game").replace("%1", getPlayerName(hostId, {showYouLabel: false}))}
                </GridItemTitle>

                <GridItemList>
                    {clientIds.map((clientId) => <div key={clientId}>
                        {getPlayerName(clientId)}
                    </div>)}
                </GridItemList>

                <div style={{display: "flex", gap: "0.5em", justifyContent: "center"}}>
                    {roomId !== myRoomId && <Button
                        type={"button"}
                        onClick={() => setMyState({
                            roomHostId: hostId,
                            roomId,
                        })}
                    >
                        {translate("Join")}
                    </Button>}

                    {roomId === myRoomId && <Button
                        type={"button"}
                        onClick={() => setMyState({})}
                    >
                        {translate(hostId === myClientId ? "Close" : "Leave")}
                    </Button>}

                    {hostId === myClientId && <Button
                        type={"button"}
                        disabled={clientIds.length < 2}
                        onClick={() => {
                            const alphabet = translate(scrambleLetterForShuffling);
                            setGameSettings({
                                playerIds: shuffleArray(clientIds, Math.random),
                                letters: indexes(4).map(() => indexes(5).map(
                                    () => alphabet[Math.floor(Math.random() * alphabet.length)]
                                )),
                            });
                            setMyState(state => ({...state, playing: true}));
                        }}
                    >
                        {translate("Start the game")}
                    </Button>}
                </div>
            </GridItem>)}
        </Grid>
    </div>;
});
