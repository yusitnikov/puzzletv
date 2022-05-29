import {Realtime, Types} from "ably/promises";
import {useSingleton} from "./useSingleton";
import {useEffect, useRef} from "react";
import {usePureState} from "./usePureState";
import {Chain} from "../utils/chain";
import {useThrottleData} from "./useThrottle";

export const useAbly = (options: Types.ClientOptions, enabled = true) => useSingleton(
    "ably",
    () => new Realtime({...options, autoConnect: true}),
    undefined,
    enabled
);

export const useAblyChannel = (options: Types.ClientOptions, name: string, enabled = true) => {
    const ably = useAbly(options, enabled);

    return useSingleton(
        `ably-channel-${name}`,
        () => ably!.channels.get(name),
        undefined,
        enabled
    );
};

export const useAblyChannelMessages = (options: Types.ClientOptions, channelName: string, callback: (message: Types.Message) => void, enabled = callback !== undefined) => {
    const channel = useAblyChannel(options, channelName, enabled);

    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const chain = useSingleton(`ably-messages-chain-${channelName}`, () => new Chain())!;

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

export const useAblyChannelPresence = (
    options: Types.ClientOptions,
    channelName: string,
    enabled = true
): [messages: Types.PresenceMessage[], loaded: boolean] => {
    const channel = useAblyChannel(options, channelName, enabled);

    const [presenceMessages, setPresenceMessages] = usePureState<Types.PresenceMessage[] | undefined>(undefined);

    const chain = useSingleton(`ably-presence-chain-${channelName}`, () => new Chain())!;

    useEffect(() => {
        if (!enabled || !channel) {
            return;
        }

        const chainUpdate = () => chain.then(async() => {
            try {
                setPresenceMessages(JSON.parse(JSON.stringify(await channel.presence.get())));
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

    return [presenceMessages || [], presenceMessages !== undefined];
};

export const useSetMyAblyChannelPresence = (
    options: Types.ClientOptions,
    channelName: string,
    myPresenceData: any,
    enabled = true
) => {
    const channel = useAblyChannel(options, channelName, enabled);

    const chain = useSingleton(`ably-set-my-presence-chain-${channelName}`, () => new Chain())!;

    const myThrottledPresenceData = useThrottleData(200, myPresenceData);

    const myPresenceDataRef = useRef(myThrottledPresenceData);
    myPresenceDataRef.current = myThrottledPresenceData;

    useEffect(() => {
        if (!enabled || !channel) {
            return;
        }

        chain.then(() => channel.presence.enter(myPresenceDataRef.current))

        return () => {
            chain.then(() => channel.presence.leave());
        };
    }, [channel, enabled, chain]);

    useEffect(() => {
        if (!enabled || !channel) {
            return;
        }

        chain.then(() => channel.presence.update(myThrottledPresenceData));
    }, [channel, enabled, chain, myThrottledPresenceData]);
};
