import {} from "freeact/types";
import { implementApi } from "freeact/client";
import { APIEvents } from "../types";

let clientListeners: Record<string, (text: string) => void> = {};

let pipe: (channelUid: string, text: string) => void;

export const apiImp = implementApi<APIEvents>(({ emit, on }) => {
  on("pipe", (channelUid, text) => {
    if (clientListeners[channelUid]) {
      clientListeners[channelUid](text);
    }
  });
  pipe = (channelUid, text) => {
    emit("pipe", channelUid, text);
  };
});

export function createChannel(channelUid: string) {
  return {
    write(text: string) {
      if (!pipe) {
        throw new Error("called before connection established");
      }
      pipe(channelUid, text);
    },
    listen(cb: (text: string) => void) {
      clientListeners[channelUid] = cb;
    },
  };
}
