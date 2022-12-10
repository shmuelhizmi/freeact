// express js + socket io
import React, { useEffect } from "../../server";
import http from "http";
import socketIO from "socket.io";

const server = http.createServer();
const io = new socketIO.Server(server);
server.listen(3644);


const { handle } = React.createSessionHandler({
    staticsBasePath: React.hostClientBundles(server, '/client/').path,
    connection: {
        httpServer: server,
        socket: {
            io,
        }
    }
});

const helloWorldApp = handle((res) => <React.Typography type="h1">Hello World</React.Typography>, {
    title: 'Hello World',
});

function Form(props: { onSubmit: (value: string) => void }) {
    const [value, setValue] = React.useState('');
    const [submitted, setSubmitted] = React.useState(false);
    useEffect(() => {
        if (submitted) {
            // props.onSubmit(value);
        }
    }, [submitted]);
    return (
        <React.Box>
            <React.Input value={value} onChange={setValue} />
            <React.Button onClick={() => setSubmitted(true)} label="Submit" />
        </React.Box>
    );
}

const formApp = handle<string>((res) => {
    return <Form onSubmit={res} />;
}, {
    title: 'Form',
});

server.on('request', (req, res) => {
    if (req.url === '/hello/') {
        helloWorldApp(req, res);
        return;
    }
    if (req.url === '/form/') {
        const result = formApp(req, res);
        result.then((value) => {
            console.log('Form value:', value);
        });
        return;
    }
});