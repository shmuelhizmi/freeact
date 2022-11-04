import { createServer } from 'vite'
import * as CompOverride from "./components"
import { Server } from "@react-fullstack/fullstack-socket-server";
import { Render } from "@react-fullstack/render";
import path from "path";
import { Components, Views, ExposedComponents } from '../types'
import _chromePaths from 'chrome-paths'
import { ViewsProvider } from '@react-fullstack/fullstack';
import { ViewsToServerComponents } from '@react-fullstack/fullstack/lib/Views';
import React from 'react';
import { exec } from "child_process";
import { getPort } from './utils/getPort'
import reactVitePlugin from '@vitejs/plugin-react'

const chromePaths = _chromePaths as unknown as { chrome: string, chromium: string; chromeCanary: string;  }

const serve = async (App: () => JSX.Element) => {
    const clientPort = await getPort({ port: 3000 });
    const serverPort = await getPort({ port: 3001 });
    
    process.env.VITE_SERVER_PORT = serverPort.toString();
    
    const clientServer = await createServer({
        root: path.join(__dirname, ".."),
        server: {
            port: clientPort,
        },
        plugins: [
            reactVitePlugin()
        ],
        envPrefix: "VITE_",
        logLevel: process.env.NODE_ENV === "production" ? "error" : "info",
    });
    Render(
        <Server<Components> singleInstance port={serverPort} views={Views}>
            {App}
        </Server>
    );
    await clientServer.listen();
    console.log(`Client server running at http://127.0.0.1:${clientPort}`);
    console.log(`Server running at http://127.0.0.1:${serverPort}`);

    const chromePath = chromePaths.chrome || chromePaths.chromium || chromePaths.chromeCanary;
    if (chromePath) {
        // run in app mode
        exec(`"${chromePath}" --app=http://127.0.0.1:${clientPort}`);
    }

    const keepAlive = () => {
        setTimeout(keepAlive, 1000);
    };
    keepAlive();

    hack_catchGlobalErrors();
    return { clientPort, serverPort };
}


function hack_catchGlobalErrors() {
    process.on('uncaughtException', (err) => {
        const secretByPass = 'the client is trying to access an event that does not exist';
        if (err.message.includes(secretByPass)) {
            return;
        }
        console.error(err);
    });
}

export default new Proxy(CompOverride, {
    get: (target, prop) => {
        if (typeof prop !== "string") {
            throw new Error("Invalid prop");
        }
        if (prop === "serve") {
            return serve;
        }
        if (!target[prop]) {
            target[prop] = (props: any) => {
                return <ViewsProvider<Components>>{(Comps) => {
                    const Comp = Comps[prop];
                    if (!Comp) {
                        throw new Error(`Component ${prop} not found`);
                    }
                    return <Comp {...props} />;
                }}</ViewsProvider>;
            };
        }
        return target[prop];
    },
}) as unknown as ExposedComponents & { serve: typeof serve };
