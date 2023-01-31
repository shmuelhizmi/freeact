import React, { useEffect, useRef } from "react";
import { TerminalViewProps } from "../types/terminal";
import { useResize } from "./resize-detector";
import { useConnection } from "./use-connection";
import type { Terminal as XTerm } from "xterm";
import type { FitAddon } from "xterm-addon-fit";

// class Terminal extends Component<View<TerminalViewProps>> {
//   socket!: Socket;
//   terminal!: InstanceType<(typeof import("xterm"))['Terminal']>;
//   fitAddon!: InstanceType<(typeof import("xterm-addon-fit"))['FitAddon']>;
//   containerElement?: HTMLDivElement;
//   constructor(props: Terminal["props"]) {
//     super(props);
//   }

//   mount = () => {
//     Promise.all([import("xterm"), import("xterm-addon-fit")]).then(
//       ([{ Terminal: XTerm }, { FitAddon }]) => {
//         this.socket = io(window.location.hostname + ":" + this.props.port, {
//           protocols: ["websocket"],
//         });
//         this.terminal = new XTerm();
//         this.fitAddon = new FitAddon();
//         this.terminal.loadAddon(this.fitAddon);
//         this.socket.on("output", (data: string) => {
//           this.terminal.write(data);
//         });
//         this.terminal.onData((data) => {
//           this.socket.emit("input", data);
//         });
//         if (this.containerElement) {
//           this.terminal.open(this.containerElement);
//           this.fit();
//         }
//       }
//     );
//   };

//   componentDidUpdate = () => this.fit();

//   componentWillUnmount = () => {
//     this.socket.close();
//   };

//   onResize = () => {
//     this.fit();
//   };

//   fit = () => {
//     if (this.containerElement?.clientWidth) {
//       // do not resize is container is in display: none mode
//       this.fitAddon.fit();
//       this.socket.emit("setColumns", this.terminal.cols);
//     }
//   };

//   render() {
//     return (
//       <ResizeDetector onResize={this.onResize}>
//         <div
//           style={{
//             width: "100%",
//             height: "100%",
//           }}
//           ref={(div) => {
//             if (div && !this.containerElement) {
//               this.containerElement = div;
//               this.mount();
//             }
//           }}
//         ></div>
//       </ResizeDetector>
//     );
//   }
// }

// export default Terminal;

export default function Terminal(props: TerminalViewProps) {
  const connection = useConnection(props.uid);
  const { ref, width, height } = useResize();
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminal = useRef<XTerm>();
  const fitAddon = useRef<FitAddon>();

  useEffect(() => {
    if (terminal.current && fitAddon.current && terminalRef.current) {
      fitAddon.current.fit();
    }
  }, [width, height]);

  useEffect(() => {
    const { Terminal: XTerm } = require("xterm");
    const { FitAddon } = require("xterm-addon-fit");
    terminal.current = new XTerm();
    fitAddon.current = new FitAddon();
    terminal.current!.loadAddon(fitAddon.current!);
    terminal.current!.onData((data) => {
      connection.write(data);
    });
    terminal.current!.open(terminalRef.current!);
    connection.listen((data: string) => {
      terminal.current?.write(data);
    });
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
      }}
      ref={ref}
    >
      <link
        rel="stylesheet"
        href="https://unpkg.com/xterm@5.1.0/css/xterm.css"
      />
      <div
        style={{
          width: "100%",
          height: "100%",
        }}
        ref={terminalRef}
      ></div>
    </div>
  );
}
