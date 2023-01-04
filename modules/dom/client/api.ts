import { implementApi } from "../../../views/api";
import { APIEventData, APIEvents, APIEventsMap } from "../types";

export const api = implementApi<APIEventsMap>((connection) => {
  connection.on(APIEvents.WindowAPI_Open, (url: string) => {
    window.open(url);
  });
  connection.on(APIEvents.WindowAPI_Resize, (width: number, height: number) => {
    window.resizeTo(width, height);
  });
  connection.on(APIEvents.IOAPI_ClipboardAPI_ReadText, () => {
    return navigator.clipboard.readText();
  });
  connection.on(APIEvents.IOAPI_ClipboardAPI_WriteText, (text: string) => {
    return navigator.clipboard.writeText(text);
  });
  connection.on(APIEvents.IOAPI_StorageAPI_GetItem, (key: string) => {
    return localStorage.getItem(key);
  });
  connection.on(
    APIEvents.IOAPI_StorageAPI_SetItem,
    (key: string, value: string) => {
      localStorage.setItem(key, value);
    }
  );
  connection.on(APIEvents.NavigationAPI_Navigate, (url: string) => {
    window.requestIdleCallback(() => {
      window.location.href = url;
    });
  });
  connection.on(APIEvents.NavigationAPI_ReplaceState, (path: string) => {
    window.history.replaceState(null, "", path);
  });
  connection.on(APIEvents.NavigationAPI_PushState, (path: string) => {
    window.history.pushState(null, "", path);
  });
  connection.on(APIEvents.NavigationAPI_Reload, () => {
    window.requestIdleCallback(() => {
      window.location.reload();
    });
  });
  connection.on(APIEvents.IOAPI_CameraAPI_TakePicture, (camera) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const constraints = {
        video: {
          facingMode:
            camera === APIEventData.IOAPI_CameraAPI_CameraFront
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
          };
        })
        .catch((e) => {
          reject(e);
        });
    });
  });
});
