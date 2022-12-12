import { Socket } from "socket.io-client";
import { API } from "../types";

export function registerAPI(socket: Socket) {
  const transport = socket as any;
  API.on(transport, "WindowAPI_Open", (url: string) => {
    window.open(url);
  });
  API.on(transport, "WindowAPI_Resize", (width: number, height: number) => {
    window.resizeTo(width, height);
  });
  API.on(transport, "IOAPI_ClipboardAPI_ReadText", () => {
    return navigator.clipboard.readText();
  });
  API.on(transport, "IOAPI_ClipboardAPI_WriteText", (text: string) => {
    return navigator.clipboard.writeText(text);
  });
  API.on(transport, "IOAPI_StorageAPI_GetItem", (key: string) => {
    return localStorage.getItem(key);
  });
  API.on(
    transport,
    "IOAPI_StorageAPI_SetItem",
    (key: string, value: string) => {
      localStorage.setItem(key, value);
    }
  );
  API.on(transport, "NavigationAPI_Navigate", (url: string) => {
    window.requestIdleCallback(() => {
      window.location.href = url;
    });
  });
  API.on(transport, "NavigationAPI_ReplaceState", (path: string) => {
    window.history.replaceState(null, "", path);
  });
  API.on(transport, "NavigationAPI_PushState", (path: string) => {
    window.history.pushState(null, "", path);
  });
  API.on(transport, "NavigationAPI_Reload", () => {
    window.requestIdleCallback(() => {
      window.location.reload();
    });
  });
  API.on(transport, "IOAPI_CameraAPI_TakePicture", (camera) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const constraints = {
        video: {
          facingMode:
            camera === API.APIEventData.IOAPI_CameraAPI_CameraFront
              ? "user"
              : "environment",
        },
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          video.srcObject = stream;
          video.onloadedmetadata = () => {
            video.play();
            video.onloadedmetadata = null;
            setTimeout(() => {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              context?.drawImage(video, 0, 0);
              const dataURL = canvas.toDataURL("image/jpeg");
              resolve(dataURL);
              stream.getTracks().forEach((track) => track.stop());
            }, 500);
          }
        })
        .catch((e) => {
          reject(e);
        });
    });
  });
}
