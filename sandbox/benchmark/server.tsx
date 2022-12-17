import { createCompiler } from "freeact/server";
import { get, Server } from "http";
import { Server as Socket } from "socket.io";
import Express from "express";

const app = Express();
const server = new Server(app);
server.listen(3069);
server.setMaxListeners(Infinity);
const io = new Socket(server);
const React = createCompiler()
  .withComponents<typeof import('./dom')>('./dom.tsx', require('./dom'))
  .compile();

const { path: bundles, middleware } = React.createHostClientBundlesMiddleware();

app.use(middleware);

const session = React.createSessionHandler({
  connection: {
    httpServer: server,
    socket: {
      io,
      // maxTimeForClientToInitConnection: 1,
    },
  },
  staticsBasePath: bundles,
});

const Main = () => {
  const [count, setCount] = React.useState(0);

  return (
    <React.Box rows={["1fr", "1fr"]} columns={["1fr"]}>
      <React.Button onClick={() => setCount(count + 1)} label="Click me" />
      <React.Typography type="h1">{count}</React.Typography>
    </React.Box>
  );
};

const home = session.handle<void>(() => <Main />, {
  title: "Hello world",
});

app.get("/app", (req, res) => {
    home.http(req, res);
});



(async () => {
  // let requests = [] as Promise<void>[];
  // console.time("app init");
  // for (let i = 0; i < 1000; i++) {
  //   requests.push(new Promise<void>((resolve) => {
  //     get('http://localhost:3069/app/', (res) => {
  //       resolve();
  //     })
  //   }));
  //   if (i % 100 === 0) {
  //     await Promise.all(requests);
  //     console.timeEnd("app init");
  //     console.time("app init");
  //     requests = [];
  //   }
  //   console.log(i);
  // }
  // results for 1000 req - 6s
  // with max time for client to init connection set to 1ms - 3.59s
  // running 1420699 requests in stress test - works fine
})();