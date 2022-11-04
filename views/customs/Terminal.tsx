import React from "react";
import { Component, View } from "@react-fullstack/fullstack";
import { TerminalViewProps } from "../../types/terminal";
import io, { Socket } from "socket.io-client";
import { Terminal as XTerm } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import ResizeDetector from "react-resize-detector";
import "xterm/css/xterm.css";


class Terminal extends Component<
    View<TerminalViewProps>
> {
    socket: Socket;
    terminal: XTerm;
    fitAddon: FitAddon;
    containerElement?: HTMLDivElement;
    constructor(props: Terminal["props"]) {
        super(props);
        this.socket = io('127.0.0.1:' + props.port);
        this.terminal = new XTerm();
        this.fitAddon = new FitAddon();
        this.terminal.loadAddon(this.fitAddon);
        this.socket.on("output", (data: string) => {
            this.terminal.write(data);
        });
        this.terminal.onData((data) => {
            this.socket.emit("input", data);
        });
    }

    mount = () => {
        if (this.containerElement) {
            this.fit();
        }
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