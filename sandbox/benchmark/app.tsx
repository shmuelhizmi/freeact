import React, { useState } from "freeact/server";
import { get, Server } from "http";
import { Server as Socket } from "socket.io";

const server = new Server();
server.listen(3069);
server.setMaxListeners(Infinity);

console.log("listening on port 3069");
const io = new Socket(server);

function App() {
  const [count, setCount] = useState(0);
  return (
    <React.Box columns={["1fr", "1fr"]}>
      <React.Button onClick={() => setCount(count + 1)} label="Click me" />
      <React.Typography type="h1">{count}</React.Typography>
    </React.Box>
  );
}

console.time("initial serve");
for (let i = 0; i < 1000; i++) {
  React.serve(() => <App />, {
    connection: {
      basePath: `/app${i}/`,
      httpServer: server,
      socket: {
        io,
      }
    },
  });
  // server.on("request", (req, res) => {
  //   if (req.url === `/app${i}/`) {
  //     res.writeHead(200, { "Content-Type": "text/html" });
  //     res.end('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Document</title></head><body><div id="root"></div><script src="/app.js"></script></body></html>');
  //   }
  // });
}
console.timeEnd("initial serve");

console.time("ssr");
(async () => {
  let requests = [] as Promise<void>[];
  for (let i = 0; i < 1000; i++) {
    requests.push(new Promise<void>((resolve) => {
      get('http://localhost:3069/app' + i + '/', (res) => {
        resolve();
      })
    }));
    if (i % 100 === 0) {
      await Promise.all(requests);
      requests = [];
    }
    console.log(i);
  }
  console.timeEnd("ssr");
  // results - 6.6s
  // after moving to single socket - 6.1s
  // if running 100 requests at a time - 3.7s
})();