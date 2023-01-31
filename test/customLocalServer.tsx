import DevModule from "@freeact/dev-ui";
import JoyModule from "@freeact/joy";
import DomModule from "@freeact/dom";
import { createCompiler } from "freeact/compiler";
import http from "http";
import { useState } from "react";
import * as socketIO from "socket.io";

const React = createCompiler()
  .addModule(DomModule)
  .addModule(JoyModule)
  .addModule(DevModule)
  .compile();
const { JOY, Dev } = React.$;
const { Box, Typography, Button } = JOY;
const { Terminal } = Dev;

const server = http.createServer((req, res) => {
  console.log(req.url);
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
    <html>
      <head>
        <title>Freeact Demo</title>
      </head>
      <body>
        <div style="display: block; margin: 0 auto; width: 100%; text-align: center;">
          <a href="/dev/">Start</a>
          <a href="/dev">Start (redirect)</a>
        </div>
      </body>
    </html>
    `);
  }
});
const io = new socketIO.Server(server);
const statics = React.hostStatics(server, '/dev/statics/');
const sessionHandler =  React.createSessionHandler({
  staticsBasePath: statics.path,
  connection: {
    httpServer: server,
    socket: {
      io,
    }
  }
})
server.listen(4433);
io.setMaxListeners(100);

function App() {
  const [count, setCount] = useState(69);
  return (
    <Box rows={["45px", "25%", "30%"]} columns="70%" gap={35}>
      <Typography variant="solid" type="h1">
        The Terminal Output Counter
      </Typography>
      <Box
        variant="soft"
        columns={"100%"}
        rows={["25%", "65%"]}
        gap={"5%"}
        padding={"5%"}
      >
        <Typography type="h2">Count: {count}</Typography>
        <Button
          onClick={() => setCount(count + 1)}
          variant="outlined"
          color="primary"
          label="increment"
        />
      </Box>
      <Terminal
        initialExecution={{ shell: "zsh", args: ["-c", 'echo "freeact";zsh'] }}
        onData={() => setCount((c) => c + 1)}
      />
    </Box>
  );
}

server.on('request', (req, res) => {
  if (req.url === '/dev/') {
   sessionHandler.handle((api) => {
      return <App />;
    }).http(req, res);
  }
  if (req.url === '/dev') {
    res.writeHead(302, { 'Location': '/dev/' });
    res.end();
  }
});