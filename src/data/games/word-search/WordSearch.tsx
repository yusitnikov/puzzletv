import {observer} from "mobx-react-lite";
import {
    useAblyChannelPresenceMap,
    useSetMyAblyChannelPresence,
    useUserNames
} from "../../../hooks/useAbly";
import {ablyOptions, myClientId} from "../../../hooks/useMultiPlayer";
import {useEffect, useMemo, useState} from "react";
import {settings} from "../../../types/layout/Settings";
import {
    WordSearchGameSettings,
    WordSearchLobbyDynamicState,
    WordSearchLobbyState,
    WordSearchRoomSettings
} from "./types";
import {Button} from "../../../components/layout/button/Button";
import {useTranslate} from "../../../hooks/useTranslate";
import {Grid} from "../../../components/layout/grid/Grid";
import {GridItem, GridItemList, GridItemTitle} from "./styled";
import {shuffleArray} from "../../../utils/random";
import {alphabet, scrambleLetterForShuffling} from "../../alphabet";
import {indexes} from "../../../utils/indexes";
import {WordSearchGame} from "./WordSearchGame";
import {LanguageCode} from "../../../types/translations/LanguageCode";
import {fieldSizePreference} from "./constants";
import {WordSearchLetter} from "./WordSearchLetter";
import {darkGreyColor} from "../../../components/app/globals";

const lobbyChannelName = "word-search-lobby";

export const WordSearch = observer(function WordSearch() {
    const translate = useTranslate();

    const [myNaiveState, setMyState] = useState<WordSearchLobbyDynamicState>({});
    const myPreferredWidth = fieldSizePreference.width.get();
    const myPreferredHeight = fieldSizePreference.height.get();
    const myRoomSettings = useMemo((): WordSearchRoomSettings => ({
        fieldWidth: myPreferredWidth,
        fieldHeight: myPreferredHeight,
    }), [myPreferredWidth, myPreferredHeight]);
    const myLobbyState = useMemo((): WordSearchLobbyState => ({
        ...myNaiveState,
        ...myRoomSettings,
    }), [myNaiveState, myRoomSettings]);

    const [gameSettings, setGameSettings] = useState<WordSearchGameSettings>();

    const getPlayerName = useUserNames(ablyOptions);

    useSetMyAblyChannelPresence(ablyOptions, lobbyChannelName, myLobbyState);

    const [playersMap] = useAblyChannelPresenceMap<WordSearchLobbyState>(ablyOptions, lobbyChannelName, false);

    const roomsMap: Record<string, { hostId: string, clientIds: string[], playing?: boolean, settings: WordSearchRoomSettings }> = {};
    for (const [clientId, {roomHostId, roomId, playing, ...roomSettings}] of Object.entries(playersMap)) {
        if (!roomHostId || !roomId) {
            continue;
        }

        const host = playersMap[roomHostId];
        if (!host || host.roomId !== roomId) {
            if (!playing) {
                playersMap[clientId] = roomSettings;
            }
            continue;
        }

        roomsMap[roomId] ??= {
            hostId: roomHostId,
            clientIds: [],
            settings: {} as unknown as WordSearchRoomSettings,
        };
        roomsMap[roomId].clientIds[clientId === roomHostId ? "unshift" : "push"](clientId);
        roomsMap[roomId].playing ||= playing;
        if (clientId === roomHostId) {
            roomsMap[roomId].settings = roomSettings;
        }
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

            {Object.entries(roomsMap).map(([roomId, {hostId, clientIds, playing, settings}]) => {
                if (playing) {
                    return null;
                }

                const {fieldWidth, fieldHeight} = hostId === myClientId ? myRoomSettings : settings;
                const myAlphabet = translate(alphabet);

                return <GridItem key={`room-${roomId}`}>
                    <GridItemTitle>
                        {translate("%1's game").replace("%1", getPlayerName(hostId, {showYouLabel: false}))}
                    </GridItemTitle>

                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "max-content max-content",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 5,
                    }}>
                        <div style={{border: `1px solid ${darkGreyColor}`, borderRadius: 5, padding: 2}}>
                            {indexes(fieldHeight).map(top => <div key={top}>
                                {indexes(fieldWidth).map(left => <WordSearchLetter
                                    key={left}
                                    letter={myAlphabet[(top * fieldWidth + left) % myAlphabet.length]}
                                    clientIndex={2}
                                    cellSize={16}
                                />)}
                            </div>)}
                        </div>
                        {hostId === myClientId && <>
                            <div>
                                <WordSearchLetter
                                    letter={"+"}
                                    cellSize={20}
                                    active={true}
                                    clientIndex={0}
                                    onToggle={() => fieldSizePreference.width.set(value => value + 1)}
                                />
                                <br/>
                                <WordSearchLetter
                                    letter={"-"}
                                    cellSize={20}
                                    active={true}
                                    clientIndex={1}
                                    onToggle={() => fieldSizePreference.width.set(value => Math.max(value - 1, 5))}
                                />
                            </div>
                            <div>
                            <WordSearchLetter
                                    letter={"+"}
                                    cellSize={20}
                                    active={true}
                                    clientIndex={0}
                                    onToggle={() => fieldSizePreference.height.set(value => value + 1)}
                                />
                                <WordSearchLetter
                                    letter={"-"}
                                    cellSize={20}
                                    active={true}
                                    clientIndex={1}
                                    onToggle={() => fieldSizePreference.height.set(value => Math.max(value - 1, 4))}
                                />
                            </div>
                        </>}
                    </div>

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
                                    letters: indexes(fieldHeight).map(() => indexes(fieldWidth).map(
                                        () => alphabet[Math.floor(Math.random() * alphabet.length)]
                                    )),
                                });
                                setMyState(state => ({...state, playing: true}));
                            }}
                        >
                            {translate("Start the game")}
                        </Button>}
                    </div>
                </GridItem>;
            })}
        </Grid>
    </div>;
});
