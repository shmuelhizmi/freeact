import { implementComponents } from "freeact/client"
import * as JoyComponents from "./ui";
import { } from "@mui/types";

export const components = implementComponents(() => JoyComponents);

export const filename = import.meta.url;