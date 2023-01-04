import React from "react";
import { Component } from "@react-fullstack/fullstack/client";
import { View } from "@react-fullstack/fullstack/shared";
import { TerminalViewProps } from "../terminal";
import io, { Socket } from "socket.io-client";
import ResizeDetector from "react-resize-detector";


class Terminal extends Component<View<TerminalViewProps>> {
  socket!: Socket;
  terminal!: InstanceType<(typeof import("xterm"))['Terminal']>;
  fitAddon!: InstanceType<(typeof import("xterm-addon-fit"))['FitAddon']>;
  containerElement?: HTMLDivElement;
  constructor(props: Terminal["props"]) {
    super(props);
  }

  mount = () => {
    Promise.all([import("xterm"), import("xterm-addon-fit")]).then(
      ([{ Terminal: XTerm }, { FitAddon }]) => {
        this.socket = io(window.location.hostname + ":" + this.props.port, {
          protocols: ["websocket"],
        });
        this.terminal = new XTerm();
        this.fitAddon = new FitAddon();
        this.terminal.loadAddon(this.fitAddon);
        this.socket.on("output", (data: string) => {
          this.terminal.write(data);
        });
        this.terminal.onData((data) => {
          this.socket.emit("input", data);
        });
        if (this.containerElement) {
          this.terminal.open(this.containerElement);
          this.fit();
        }
      }
    );
  };

  componentDidUpdate = () => this.fit();

  componentWillUnmount = () => {
    this.socket.close();
  };

  onResize = () => {
    this.fit();
  };

  fit = () => {
    if (this.containerElement?.clientWidth) {
      // do not resize is container is in display: none mode
      this.fitAddon.fit();
      this.socket.emit("setColumns", this.terminal.cols);
    }
  };

  render() {
    return (
      <ResizeDetector onResize={this.onResize}>
        <div
          style={{
            width: "100%",
            height: "100%",
          }}
          ref={(div) => {
            if (div && !this.containerElement) {
              this.containerElement = div;
              this.mount();
            }
          }}
        ></div>
      </ResizeDetector>
    );
  }
}

export default Terminal;
