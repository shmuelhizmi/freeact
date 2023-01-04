import React from "react";
import * as socketIO from "socket.io";
import * as http from "http";
import { spawn, IPty } from "node-pty";
import * as os from "os";
import { useEffect } from "react";
import { TerminalProps } from "../terminal";
import { Components } from "../../../types/module";
import { ClientComps } from "../types";
import { getPort } from "../../../server/utils/getPort";

export const maxTerminalHistoryLength = 100000;

export function createTerminal(comps: Components<ClientComps>) {
  const { Terminal: TerminalView } = comps;
  return function Terminal(props: TerminalProps) {
    const [port, setPort] = React.useState<number>(0);
    useEffect(() => {
      const server = http.createServer();
      const io = new socketIO.Server(server, {
        cors: {
          origin: "*",
        },
      });
      const defaultBash = getDefaultBash();
      let history = "";
      const pty = new PTY(
        (data) => {
          history += data;
          history = history.slice(
            history.length - maxTerminalHistoryLength,
            history.length
          );
          props.onData?.(data);
          io.emit("output", data);
        },
        props.initialExecution?.shell || defaultBash,
        props.initialExecution?.cwd || process.cwd(),
        props.initialExecution?.args || [],
        props.environmentVariables
      );
      io.on("connection", (socket) => {
        socket.emit("output", history);
        socket.on("input", (data) => {
          if (props.readOnly) {
            return;
          }
          pty.write(data);
        });
      });
      pty.ptyProcess.onExit(({ exitCode, signal }) => {
        props.onExecutionEnd?.(exitCode, signal);
      });
      const listening = getPort().then((port) => {
        server.listen(port);
        setPort(port);
      });
      return () => {
        pty.ptyProcess.kill();
        listening.then(() => {
          server.close();
        });
      };
    }, []);

    return port && <TerminalView port={String(port)} />;
  };
}
const getDefaultBash = () => {
  if (process.env.SHELL) {
    return process.env.SHELL;
  }
  if (os.platform() === "win32") {
    return "cmd";
  }
  return "bash";
};

// from https://svaddi.dev/how-to-create-web-based-terminals/;
class PTY {
  public ptyProcess!: IPty;
  constructor(
    public out: (data) => void,
    public shell: string,
    public cwd: string,
    public args: string[],
    public env: any
  ) {
    // Initialize PTY process.
    this.startPtyProcess();
  }

  setCols = (columns: number) => {
    try {
      this.ptyProcess.resize(columns, this.ptyProcess.rows);
    } catch (e) {
      /* */
    }
  };
  /**
   * Spawn an instance of pty with a selected shell.
   */
  startPtyProcess() {
    this.ptyProcess = spawn(this.shell, this.args, {
      name: "xterm-color",
      cwd: this.cwd,
      env: {
        ...process.env,
        ...this.env,
      },
    });

    // Add a "data" event listener.
    this.ptyProcess.onData((data) => {
      // Whenever terminal generates any data, send that output to socket.io client
      this.sendToClient(data);
    });
  }

  exitPtyProcess() {
    this.ptyProcess.kill();
  }

  /**
   * Use this function to send in the input to Pseudo Terminal process.
   * @param {*} data Input from user like a command sent from terminal UI
   */

  write(data) {
    this.ptyProcess.write(data);
  }

  sendToClient(data: string) {
    // Emit data to socket.io client in an event "output"
    this.out(data);
  }
}
