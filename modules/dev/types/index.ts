import { TerminalViewProps } from "./terminal"

export type ClientComps = {
    Terminal: TerminalViewProps;
}

export type APIEvents = {
    pipe: (channelUid: string, text: string) => void;
    history: (channelUid: string) => string;
}

export type API = {
    channel(channelUid: string): {
        write(text: string): void;
        listen(cb: (text: string) => void): void;
        onHistory(cb: () => string): void;
        uid: string;
    };
};