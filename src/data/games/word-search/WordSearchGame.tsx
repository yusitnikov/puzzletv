import {observer} from "mobx-react-lite";
import {WordSearchGameSettings, WordSearchGameState, WordSearchPlayerState, WordSearchSelectedLetter} from "./types";
import {Button} from "../../../components/layout/button/Button";
import {useAblyChannelPresenceMap, UserNameFunc, useSetMyAblyChannelPresence} from "../../../hooks/useAbly";
import {ablyOptions, myClientId} from "../../../hooks/useMultiPlayer";
import {useTranslate} from "../../../hooks/useTranslate";
import {SetStateAction, useState} from "react";
import {greenColor, lightRedColor, textColor} from "../../../components/app/globals";
import {arrayContainsPosition, isSamePosition} from "../../../types/layout/Position";
import {rgba} from "../../../utils/color";
import {Crown} from "@emotion-icons/boxicons-regular";
import {cellSize, clientColors, smallCellSize} from "./constants";
import {WordSearchLetter} from "./WordSearchLetter";

interface WordSearchGameProps {
    hostId: string;
    roomId: string;
    hostGameSettings?: WordSearchGameSettings;
    getPlayerName: UserNameFunc;
    onLeave: () => void;
}

export const WordSearchGame = observer(function WordSearchGame(props: WordSearchGameProps) {
    const {hostId, roomId, hostGameSettings, onLeave} = props;

    const isHost = hostId === myClientId;

    const translate = useTranslate();

    const [hostGameState, setHostGameState] = useState<WordSearchGameState | undefined>(() => hostGameSettings && {
        ...hostGameSettings,
        turnIndex: 0,
        words: [],
        letterOwners: hostGameSettings.letters.map(row => row.map(() => "")),
    });

    const gameStateChannelName = `word-search-state-${roomId}`;
    useSetMyAblyChannelPresence(ablyOptions, gameStateChannelName, hostGameState, isHost);
    const [gameStateMap] = useAblyChannelPresenceMap<WordSearchGameState>(ablyOptions, gameStateChannelName, true, !isHost);
    const gameState: WordSearchGameState | undefined = hostGameState ?? gameStateMap[hostId];

    const [playerState, setPlayerState] = useState<WordSearchPlayerState>(() => ({
        turnIndex: 0,
        word: [],
    }));
    const playerStateChannelName = `word-search-player-${roomId}`;
    useSetMyAblyChannelPresence(ablyOptions, playerStateChannelName, playerState);
    const [playerStateMap] = useAblyChannelPresenceMap<WordSearchPlayerState>(ablyOptions, playerStateChannelName, false);

    if (!gameState) {
        return <div>
            <div>{translate("Loading")}...</div>

            <div>
                <Button type={"button"} onClick={onLeave}>
                    {translate("Back")}
                </Button>
            </div>
        </div>;
    }

    return <WordSearchGameInner
        {...props}
        gameState={gameState}
        setGameState={setHostGameState}
        playerStateMap={{...playerStateMap, [myClientId]: playerState}}
        setPlayerState={setPlayerState}
    />;
});

interface WordSearchGameInnerProps extends WordSearchGameProps {
    gameState: WordSearchGameState;
    setGameState: (action: SetStateAction<WordSearchGameState | undefined>) => void;
    playerStateMap: Record<string, WordSearchPlayerState>;
    setPlayerState: (action: SetStateAction<WordSearchPlayerState>) => void;
}

const WordSearchGameInner = observer(function WordSearchGameInner(
    {
        hostId,
        getPlayerName,
        onLeave,
        gameState,
        setGameState,
        playerStateMap,
        setPlayerState,
    }: WordSearchGameInnerProps
) {
    const isHost = hostId === myClientId;

    const translate = useTranslate();

    const {playerIds, letters, turnIndex, words, letterOwners} = gameState;

    const currentPlayerId = playerIds[turnIndex % playerIds.length];

    let currentPlayerState = playerStateMap[currentPlayerId];
    if (currentPlayerState?.turnIndex !== turnIndex) {
        currentPlayerState = {turnIndex: 0, word: []};
    }

    const myTurn = currentPlayerId === myClientId && !currentPlayerState.commit;

    const currentWord = currentPlayerState.word;
    const currentWordStr = currentWord.map(({letter}) => letter).join("");

    const isInWord = (letter: WordSearchSelectedLetter) => arrayContainsPosition(currentWord, letter);
    const toggleLetter = (letter: WordSearchSelectedLetter) => {
        if (myTurn) {
            setPlayerState({
                turnIndex,
                word: isInWord(letter)
                    ? currentWord.filter((position) => !isSamePosition(position, letter))
                    : [...currentWord, letter],
            });
        }
    };

    if (isHost && currentPlayerState.commit) {
        setGameState(prev => {
            if (prev?.turnIndex === turnIndex) {
                return {
                    ...prev,
                    turnIndex: turnIndex + 1,
                    words: [...prev.words, currentWordStr],
                    letterOwners: prev.letterOwners.map((row, top) => row.map(
                        (prevOwner, left) => arrayContainsPosition(currentWord, {top, left})
                            ? currentPlayerId
                            : prevOwner,
                    )),
                };
            }

            return prev;
        });
    }

    return <div style={{display: "flex", gap: "1em"}}>
        <div style={{width: smallCellSize * 8 + 40, overflow: "auto"}}>
            {[...words.entries()].reverse().map(([wordIndex, word]) => <div
                key={wordIndex}
                style={{marginBottom: "0.3em"}}
            >
                {word.split("").map((letter, index) => <WordSearchLetter
                    key={index}
                    letter={letter}
                    clientIndex={wordIndex % playerIds.length}
                    cellSize={smallCellSize}
                />)}
            </div>)}
        </div>

        <div>
            <div style={{display: "flex", gap: "1em", flexWrap: "wrap", marginBottom: "1em"}}>
                {playerIds.map((playerId, index) => <div
                    key={playerId}
                    style={{
                        position: "relative",
                        borderRadius: "0.5em",
                        padding: "0.5em 1em",
                        color: "#fff",
                        backgroundColor: clientColors[index],
                        transition: "outline-color 200ms linear",
                        outlineStyle: "solid",
                        outlineWidth: "0.4em",
                        outlineColor: playerId === currentPlayerId ? rgba(clientColors[index], 0.3) : "transparent",
                    }}
                >
                    <div style={{
                        position: "absolute",
                        right: "-0.1em",
                        bottom: "-0.1em",
                        width: "0.8em",
                        height: "0.8em",
                        backgroundColor: playerStateMap[playerId] ? greenColor : lightRedColor,
                        outline: "1px solid #fffc",
                        borderRadius: "50%",
                    }}/>

                    {playerId === hostId && <Crown size={"1em"} color={textColor} style={{
                        position: "absolute",
                        right: "-0.3em",
                        top: "-0.5em",
                        transform: "rotate(30deg)",
                    }}/>}

                    {getPlayerName(playerId)}
                    {" - "}
                    {letterOwners.flat().filter((playerId2) => playerId2 === playerId).length}
                </div>)}
            </div>

            <div style={{width: "100%", height: cellSize + 10}}>
                {currentWord.map((letter, index) => <WordSearchLetter
                    key={index}
                    letter={letter.letter}
                    myTurn={myTurn}
                    clientIndex={playerIds.indexOf(currentPlayerId)}
                    cellSize={cellSize}
                    onToggle={() => toggleLetter(letter)}
                />)}

                {myTurn && !currentWord.length && <div style={{fontSize: cellSize * 0.7, lineHeight: `${cellSize}px`}}>
                    {translate("Your move")}!
                </div>}
            </div>

            <div>
                {letters.map((row, top) => <div key={top}>
                    {row.map((letter, left) => {
                        const letterObj: WordSearchSelectedLetter = {letter, top, left};

                        return <WordSearchLetter
                            key={left}
                            letter={letter}
                            myTurn={myTurn}
                            inWord={isInWord(letterObj)}
                            clientIndex={playerIds.indexOf(letterOwners[top][left])}
                            cellSize={cellSize}
                            onToggle={() => toggleLetter(letterObj)}
                        >
                            {letter}
                        </WordSearchLetter>;
                    })}
                </div>)}
            </div>

            <div style={{marginTop: "1em", display: "flex", gap: "0.5em", fontSize: cellSize * 0.5}}>
                <Button
                    type={"button"}
                    disabled={!myTurn || currentWord.length < 2 || currentWord.length > 8 || words.includes(currentWordStr)}
                    onClick={() => setPlayerState(prev => ({...prev, commit: true}))}
                >
                    {translate("Submit")}
                </Button>

                <Button type={"button"} onClick={onLeave}>
                    {translate("Leave")}
                </Button>
            </div>
        </div>
    </div>;
});
