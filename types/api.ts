import { Transport, randomId } from "@react-fullstack/fullstack/shared";

export interface API {
  navigation: NavigationAPI;
  io: IOAPI;
  window: WindowAPI;
}

export interface NavigationAPI {
  navigate: (url: string) => Promise<void>;
  replaceState: (path: string) => Promise<void>;
  pushState: (path: string) => Promise<void>;
  reload: () => Promise<void>;
}

export interface IOAPI {
  camera: CameraAPI;
  clipboard: ClipboardAPI;
  storage: StorageAPI;
}

export interface CameraAPI {
  takePicture: (camera: Camera) => Promise<string>;
}

export type Camera = "front" | "back";

export interface CameraStream {
  stop: () => void;
  ondata: (data: Buffer) => void;
}

export interface ClipboardAPI {
  readText: () => Promise<string>;
  writeText: (text: string) => Promise<void>;
}

export interface StorageAPI {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
}

export interface WindowAPI {
  open: (url: string) => Promise<void>;
  resize: (width: number, height: number) => Promise<void>;
}

export const API_PREFIX: number = 0xfade;
export const API_REJECT: number = 0xfade + 0xdead;

export enum APIEvents {
  NavigationAPI_Navigate,
  NavigationAPI_ReplaceState,
  NavigationAPI_PushState,
  NavigationAPI_Reload,
  IOAPI_CameraAPI_TakePicture,
  IOAPI_ClipboardAPI_ReadText,
  IOAPI_ClipboardAPI_WriteText,
  IOAPI_StorageAPI_GetItem,
  IOAPI_StorageAPI_SetItem,
  WindowAPI_Open,
  WindowAPI_Resize,
}

export enum APIEventData {
  IOAPI_CameraAPI_CameraFront = 0,
  IOAPI_CameraAPI_CameraBack,
}

export interface APIEventsMap {
  [APIEvents.NavigationAPI_Navigate]: (url: string) => void;
  [APIEvents.NavigationAPI_ReplaceState]: (path: string) => void;
  [APIEvents.NavigationAPI_PushState]: (path: string) => void;
  [APIEvents.NavigationAPI_Reload]: () => void;
  [APIEvents.IOAPI_CameraAPI_TakePicture]: (
    camera:
      | APIEventData.IOAPI_CameraAPI_CameraFront
      | APIEventData.IOAPI_CameraAPI_CameraBack
  ) => string;
  [APIEvents.IOAPI_ClipboardAPI_ReadText]: () => string;
  [APIEvents.IOAPI_ClipboardAPI_WriteText]: (text: string) => void;
  [APIEvents.IOAPI_StorageAPI_GetItem]: (key: string) => string | null;
  [APIEvents.IOAPI_StorageAPI_SetItem]: (key: string, value: string) => void;
  [APIEvents.WindowAPI_Open]: (url: string) => void;
  [APIEvents.WindowAPI_Resize]: (width: number, height: number) => void;
}

export function emit<T extends keyof typeof APIEvents>(
  socket: Transport<any>,
  event: T,
  ...args: Parameters<APIEventsMap[typeof APIEvents[T]]>
): Promise<ReturnType<APIEventsMap[typeof APIEvents[T]]>> {
  const uid = randomId();
  socket.emit(API_PREFIX, [event, uid, args]);
  return new Promise((resolve, reject) => {
    socket.on(API_PREFIX, ([eventIn, uidIn, args]: [T, string, any]) => {
      if (event !== eventIn || uid !== uidIn) return;
      resolve(args);
    });
    socket.on(API_REJECT, ([eventIn, uidIn, error]) => {
      if (event !== eventIn || uid !== uidIn) return;
      reject(error);
    });
  });
}

export function on<T extends keyof typeof APIEvents>(
  socket: Transport<any>,
  event: T,
  listener: (
    ...args: Parameters<APIEventsMap[typeof APIEvents[T]]>
  ) =>
    | ReturnType<APIEventsMap[typeof APIEvents[T]]>
    | Promise<ReturnType<APIEventsMap[typeof APIEvents[T]]>>
): void {
  socket.on(API_PREFIX, ([eventIn, uid, args]: [T, string, any]) => {
    if (event !== eventIn) return;
    try {
      const out = listener(...args);
      if (out instanceof Promise) {
        out
          .then((result) => {
            socket.emit(API_PREFIX, [event, uid, result]);
          })
          .catch((error) => {
            socket.emit(API_REJECT, [event, uid, error]);
          });
        return;
      }
      socket.emit(API_PREFIX, [event, uid, out]);
    } catch (error) {
      socket.emit(API_REJECT, [event, uid, error]);
    }
  });
}
