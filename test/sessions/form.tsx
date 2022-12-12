// express js + socket io
import React, { useEffect, useState } from "../../server";
import http from "http";
import socketIO from "socket.io";

const server = http.createServer();
const io = new socketIO.Server(server);
server.listen(3644);

const { handle } = React.createSessionHandler({
  staticsBasePath: React.hostClientBundles(server, "/client/").path,
  connection: {
    httpServer: server,
    socket: {
      io,
    },
  },
});

const helloWorldApp = handle(
  (res) => <React.Typography type="h1">Hello World</React.Typography>,
  {
    title: "Hello World",
  }
);

function Form(props: {
  onSubmit: (value: string) => void;
  getSelfie: () => Promise<string>;
}) {
  const [value, setValue] = useState("");
  const [selfie, setSelfie] = useState("");

  return (
    <React.Box gap={5}>
      <React.Typography type="h1">Form</React.Typography>
      <React.Input value={value} onChange={setValue} label="username" />
      {
        selfie && <React.Image alt={"you"} url={selfie} />
      }
      <React.Button onClick={() => props.getSelfie().then(setSelfie)} label="Take selfie" />
      <React.Button onClick={() => props.onSubmit(value)} label="Submit" />
    </React.Box>
  );
}

const formApp = handle<string>(
  (api, res) => {
    return (
      <Form
        onSubmit={(str) =>
          api.navigation.navigate("/hello/").then(() => res(str))
        }
        getSelfie={() => api.io.camera.takePicture('front')}
      />
    );
  },
  {
    title: "Form",
  }
);

server.on("request", (req, res) => {
  if (req.url === "/hello/") {
    helloWorldApp(req, res);
    return;
  }
  if (req.url === "/form/") {
    const result = formApp(req, res);
    result.then((value) => {
      console.log("Form value:", value);
    });
    return;
  }
});
