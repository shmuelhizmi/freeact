import React, { useMemo } from "react";
import { spawn, IPty } from "node-pty";
import * as os from "os";
import { useEffect } from "react";
import { TerminalProps } from "../types/terminal";
import { API, ClientComps } from "../types";
import { Components } from "freeact/types";
import { useAPI } from "freeact/module";
import { randomUUID } from "crypto";

export const maxTerminalHistoryLength = 100000;

export function createTerminal(comps: Components<ClientComps>) {
  const { Terminal: TerminalView } = comps;
  return function Terminal(props: TerminalProps) {
    const api = useAPI<API>("Dev");
    const connection = useMemo(() => api.channel(randomUUID().slice(0, 8)), []);
    useEffect(() => {
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
          connection.write(data);
        },
        props.initialExecution?.shell || defaultBash,
        props.initialExecution?.cwd || process.cwd(),
        props.initialExecution?.args || [],
        props.environmentVariables
      );
      connection.onHistory(() => {
        return history;
      });
      connection.listen((data) => {
        if (props.readOnly) {
          return;
        }
        pty.write(data);
      });
      pty.ptyProcess.onExit(({ exitCode, signal }) => {
        props.onExecutionEnd?.(exitCode, signal);
      });
      return () => {
        pty.ptyProcess.kill();
      };
    }, []);

    return <TerminalView uid={connection.uid} />;
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
    public out: (data: string) => void,
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

  write(data: string) {
    this.ptyProcess.write(data);
  }

  sendToClient(data: string) {
    // Emit data to socket.io client in an event "output"
    this.out(data);
  }
}
