import {} from "freeact/types";
import { implementApi } from "freeact/module";
import { API, APIEvents } from "../types";

export const apiImp = implementApi<APIEvents, API>(({ emit, on }) => {
  let historyHandlers: Record<string, () => string> = {};
  on("history", (channelUid) => {
    if (historyHandlers[channelUid]) {
      return historyHandlers[channelUid]();
    }
    return "";
  });
  return {
    channel(channelUid) {
      return {
        write(text) {
          emit("pipe", channelUid, text);
        },
        listen(cb) {
          on("pipe", (channelUid, text) => {
            if (channelUid === channelUid) {
              cb(text);
            }
          });
        },
        onHistory(cb) {
          historyHandlers[channelUid] = cb;
        },
        uid: channelUid,
      };
    },
  };
});
