import { useState } from "react";
import { Typography, Box, Button, Image, Input } from "@freeact/joy/ui";
import { Freeact } from "../domjoy";

// express js + socket io
import http from "http";
import * as socketIO from "socket.io";


const server = http.createServer();
const io = new socketIO.Server(server);
server.listen(3644);

const { handle } = Freeact.createSessionHandler({
  staticsBasePath: Freeact.hostStatics(server, "/client/").path,
  connection: {
    httpServer: server,
    socket: {
      io,
    },
  },
});

const helloWorldApp = handle(
  (api) => <Typography type="h1">Hello World</Typography>,
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
    <Box gap={5}>
      <Typography type="h1">Form</Typography>
      <Input value={value} onChange={setValue} label="username" />
      {
        selfie && <Image alt={"you"} url={selfie} />
      }
      <Button onClick={() => props.getSelfie().then(setSelfie)} label="Take selfie" />
      <Button onClick={() => props.onSubmit(value)} label="Submit" />
    </Box>
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

console.log("Listening on port http://localhost:3644");
