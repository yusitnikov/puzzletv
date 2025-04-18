import { Realtime, Types } from "ably/promises";
import { useSingleton } from "./useSingleton";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePureState } from "./usePureState";
import { Chain } from "../utils/chain";
import { useThrottleData } from "./useThrottle";
import { unzip, zip } from "../utils/zip";
import { useLastValueRef } from "./useLastValueRef";
import { useObjectFromLocalStorage } from "../utils/localStorage";
import { settings } from "../types/layout/Settings";
import { myClientId } from "./useMultiPlayer";
import { translate } from "../utils/translate";

export const useAbly = (options: Types.ClientOptions) =>
    useSingleton("ably", () => new Realtime({ ...options, autoConnect: true }));

export const useAblyChannel = (options: Types.ClientOptions, name: string, enabled = true) => {
    const ably = useAbly(options);

    return useSingleton(
        `ably-channel-${name}`,
        () => ably.channels.get("persist:" + name, { params: { rewind: "1" } }),
        undefined,
        enabled,
    );
};

export const useAblyChannelMessages = (
    options: Types.ClientOptions,
    channelName: string,
    callback: (message: Types.Message) => void,
    enabled = callback !== undefined,
) => {
    const channel = useAblyChannel(options, channelName, enabled);

    const callbackRef = useLastValueRef(callback);

    const chain = useSingleton(`ably-messages-chain-${channelName}`, () => new Chain());

    useEffect(() => {
        if (!enabled || !channel) {
            return;
        }

        const callback = (message: Types.Message) => callbackRef.current(message);
        chain.then(() => channel.subscribe(callback));
        return () => {
            chain.then(() => channel.unsubscribe(callback));
        };
    }, [channel, callbackRef, enabled, chain]);
};

export const useAblyChannelState = <T>(
    options: Types.ClientOptions,
    channelName: string,
    initialState: T | undefined = undefined,
    enabled = true,
): [T | undefined, (value: T) => void, boolean] => {
    const channel = useAblyChannel(options, channelName, enabled);

    const chain = useSingleton(`ably-state-chain-${channelName}`, () => new Chain());

    const [state, setState] = useObjectFromLocalStorage<T>("ablyState-" + channelName, initialState);
    const [connected, setConnected] = useState(false);
    // console.log("State is", state);
    // console.log("Channel state is", channel?.state);
    // console.log("Channel connected", connected);
    const updateState = useCallback(
        (newState: T) => {
            if (!enabled || !channel) {
                return;
            }

            setState(newState);
            chain.then(() => channel.publish("state", newState));
        },
        [enabled, channel, chain, setState],
    );
    (window as any).updateState = updateState;

    useEffect(() => {
        if (!enabled || !channel) {
            return;
        }

        channel.whenState("attached").then(() => setConnected(true));

        const callback = (message: Types.Message) => {
            // console.log("Got message!", message.data);
            setState(message.data);
        };
        chain.then(() => channel.subscribe(callback));
        return () => {
            chain.then(() => channel.unsubscribe(callback));
        };
    }, [channel, enabled, chain, setState, setConnected]);

    return [state, updateState, connected];
};

const noMessages: Types.PresenceMessage[] = [];
export const useAblyChannelPresence = (
    options: Types.ClientOptions,
    channelName: string,
    enabled = true,
): [messages: Types.PresenceMessage[], loaded: boolean] => {
    const channel = useAblyChannel(options, channelName, enabled);

    const [presenceMessages, setPresenceMessages] = usePureState<Types.PresenceMessage[] | undefined>(undefined);

    const chain = useSingleton(`ably-presence-chain-${channelName}`, () => new Chain());

    useEffect(() => {
        if (!enabled || !channel) {
            return;
        }

        const chainUpdate = () =>
            chain.then(async () => {
                try {
                    let messages = await channel.presence.get();
                    messages = JSON.parse(JSON.stringify(messages));
                    messages = messages.map(({ data, ...other }) => ({
                        data: JSON.parse(unzip(data)),
                        ...other,
                    }));
                    setPresenceMessages(messages);
                } catch (err) {
                    console.warn("Failed to get the presence", err);
                }
            });

        chain.then(() => channel.presence.subscribe(["enter", "leave", "update"], chainUpdate));
        chainUpdate();

        return () => {
            chain.then(() => channel.presence.unsubscribe(["enter", "leave", "update"], chainUpdate));
        };
    }, [channel, enabled, setPresenceMessages, chain]);

    return [presenceMessages || noMessages, presenceMessages !== undefined];
};

export const useAblyChannelPresenceMap = <T>(
    options: Types.ClientOptions,
    channelName: string,
    preserve: boolean,
    enabled = true,
): [Record<string, T>, boolean] => {
    const [messages, loaded] = useAblyChannelPresence(options, channelName, enabled);

    const mapRef = useRef<Record<string, T>>({});
    if (!preserve) {
        mapRef.current = {};
    }
    const map = mapRef.current;

    for (const { clientId, data } of messages) {
        map[clientId] = data;
    }

    return [map, loaded];
};

export const useSetMyAblyChannelPresence = (
    options: Types.ClientOptions,
    channelName: string,
    myPresenceData: any,
    enabled = true,
) => {
    const channel = useAblyChannel(options, channelName, enabled);

    const chain = useSingleton(`ably-set-my-presence-chain-${channelName}`, () => new Chain());

    const myThrottledPresenceData = useThrottleData(200, myPresenceData);

    const myPresenceDataRef = useLastValueRef(myThrottledPresenceData);

    useEffect(() => {
        if (!enabled || !channel) {
            return;
        }

        chain.then(() => channel.presence.enter(zip(JSON.stringify(myPresenceDataRef.current))));

        return () => {
            chain.then(() => channel.presence.leave());
        };
    }, [channel, enabled, chain, myPresenceDataRef]);

    useEffect(() => {
        if (!enabled || !channel) {
            return;
        }

        chain.then(() => channel.presence.update(zip(JSON.stringify(myThrottledPresenceData))));
    }, [channel, enabled, chain, myThrottledPresenceData]);
};

const userNamesChannelName = "user-names";
export interface UseUserNamesOptions {
    showYouLabel?: boolean;
}
export type UserNameFunc = (clientId: string, options?: UseUserNamesOptions) => string;
export const useUserNames = (
    ablyOptions: Types.ClientOptions,
    defaultOptions: UseUserNamesOptions = {},
): UserNameFunc => {
    useSetMyAblyChannelPresence(ablyOptions, userNamesChannelName, settings.nickname.get());
    const [namesMap] = useAblyChannelPresenceMap<string>(ablyOptions, userNamesChannelName, true);

    return (clientId: string, { showYouLabel = defaultOptions.showYouLabel ?? true }: UseUserNamesOptions = {}) => {
        let result = namesMap[clientId]?.trim() || translate("guest");

        if (showYouLabel && clientId === myClientId) {
            result += ` (${translate("you")})`;
        }

        return result;
    };
};
