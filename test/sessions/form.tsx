// express js + socket io
import React, { useState } from "../../modules/joy/server/react";
import http from "http";
import socketIO from "socket.io";

const server = http.createServer();
const io = new socketIO.Server(server);
server.listen(3644);

const { handle } = React.createSessionHandler({
  staticsBasePath: React.hostStatics(server, "/client/").path,
  connection: {
    httpServer: server,
    socket: {
      io,
    },
  },
});

const helloWorldApp = handle(
  (res) => <React.JOY.Typography type="h1">Hello World</React.JOY.Typography>,
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
    <React.JOY.Box gap={5}>
      <React.JOY.Typography type="h1">Form</React.JOY.Typography>
      <React.JOY.Input value={value} onChange={setValue} label="username" />
      {
        selfie && <React.JOY.Image alt={"you"} url={selfie} />
      }
      <React.JOY.Button onClick={() => props.getSelfie().then(setSelfie)} label="Take selfie" />
      <React.JOY.Button onClick={() => props.onSubmit(value)} label="Submit" />
    </React.JOY.Box>
  );
}

const formApp = handle<string>(
  (api, res) => {
    return (
      <Form
        onSubmit={(str) =>
          api.DOM.navigation.navigate("/hello/").then(() => res(str))
        }
        getSelfie={() => api.DOM.io.camera.takePicture('front')}
      />
    );
  },
  {
    title: "Form",
  }
);

server.on("request", (req, res) => {
  if (req.url === "/hello/") {
    helloWorldApp.http(req, res);
    return;
  }
  if (req.url === "/form/") {
    const result = formApp.http(req, res);
    result.then((value) => {
      console.log("Form value:", value);
    });
    return;
  }
});
