import { createApiServerInterface } from "../../server/api";
import { APIEventData, APIEventsMap, APIEvents, API } from "./types";

export const api = createApiServerInterface<APIEventsMap, API>(({ emit }) => {
  return {
    io: {
      camera: {
        takePicture(camera) {
          return emit(
            APIEvents.IOAPI_CameraAPI_TakePicture,
            camera === "front"
              ? APIEventData.IOAPI_CameraAPI_CameraFront
              : APIEventData.IOAPI_CameraAPI_CameraBack
          );
        },
      },
      clipboard: {
        readText() {
          return emit(APIEvents.IOAPI_ClipboardAPI_ReadText);
        },
        writeText(text) {
          return emit(APIEvents.IOAPI_ClipboardAPI_WriteText, text);
        },
      },
      storage: {
        getItem(key) {
          return emit(APIEvents.IOAPI_StorageAPI_GetItem, key);
        },
        setItem(key, value) {
          return emit(APIEvents.IOAPI_StorageAPI_SetItem, key, value);
        },
      },
    },
    navigation: {
      navigate(url) {
        return emit(APIEvents.NavigationAPI_Navigate, url);
      },
      replaceState(path) {
        return emit(APIEvents.NavigationAPI_ReplaceState, path);
      },
      pushState(path) {
        return emit(APIEvents.NavigationAPI_PushState, path);
      },
      reload() {
        return emit(APIEvents.NavigationAPI_Reload);
      },
    },
    window: {
      open(url) {
        return emit(APIEvents.WindowAPI_Open, url);
      },
      resize(width, height) {
        return emit(APIEvents.WindowAPI_Resize, width, height);
      },
    },
  };
});
