import { API } from "../types";
import type { Namespace, Server } from "socket.io";
import { Transport } from "@react-fullstack/fullstack/shared";

export function createAPI(transport: Transport<any>): API.API {
  return {
    io: {
      camera: {
        takePicture(camera) {
          return API.emit(
            transport,
            "IOAPI_CameraAPI_TakePicture",
            camera === "front"
              ? API.APIEventData.IOAPI_CameraAPI_CameraFront
              : API.APIEventData.IOAPI_CameraAPI_CameraBack
          );
        },
      },
      clipboard: {
        readText() {
          return API.emit(transport, "IOAPI_ClipboardAPI_ReadText");
        },
        writeText(text) {
          return API.emit(transport, "IOAPI_ClipboardAPI_WriteText", text);
        },
      },
      storage: {
        getItem(key) {
          return API.emit(transport, "IOAPI_StorageAPI_GetItem", key);
        },
        setItem(key, value) {
          return API.emit(transport, "IOAPI_StorageAPI_SetItem", key, value);
        },
      },
    },
    navigation: {
      navigate(url) {
        return API.emit(transport, "NavigationAPI_Navigate", url);
      },
      replaceState(path) {
        return API.emit(transport, "NavigationAPI_ReplaceState", path);
      },
      pushState(path) {
        return API.emit(transport, "NavigationAPI_PushState", path);
      },
      reload() {
        return API.emit(transport, "NavigationAPI_Reload");
      },
    },
    window: {
      open(url) {
        return API.emit(transport, "WindowAPI_Open", url);
      },
      resize(width, height) {
        return API.emit(transport, "WindowAPI_Resize", width, height);
      },
    },
  };
}
