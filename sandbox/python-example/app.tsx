import { useRef, useState, createCompiler } from "freeact";
import { interpreter } from "node-calls-python";

async function createModel() {
  const model = await interpreter.import("./python.py");
  return {
    multiply: (a: number, b: number) =>
      interpreter.call(model, "multiply", a, b) as Promise<number>,
    add: (a: number, b: number) =>
      interpreter.call(model, "add", a, b) as Promise<number>,
  };
}

function useModel() {
  const model = useRef<ReturnType<typeof createModel>>();
  if (!model.current) {
    model.current = createModel();
  }
  const [results, setResults] = useState<[string, number][]>([]);
  return {
    multiply: (a: number, b: number) => {
      model.current!.then((model) => {
        model.multiply(a, b).then((result) => {
          setResults((results) => [
            ...results,
            [`multiply - ${a} * ${b}`, result],
          ]);
        });
      });
    },
    add: (a: number, b: number) => {
      model.current!.then((model) => {
        model.add(a, b).then((result) => {
          setResults((results) => [...results, [`add - ${a} + ${b}`, result]]);
        });
      });
    },
    results,
  };
}

const React = createCompiler()
  .withComponents<typeof import('./dom/button')>('./dom/button.tsx', require('./dom/button'))
  .compile();

function App() {
  const { add, multiply, results } = useModel();
  const [multiplyV, setMultiply] = useState<[number, number]>([0, 0]);
  const [addV, setAdd] = useState<[number, number]>([0, 0]);

  return (
    <React.Box columns={[".4fr", ".4fr"]} rows={".8fr"} gap={10}>
      <React.Box rows={["1fr", "1fr"]} gap={10} columns="100%">
        <React.Box
          variant="outlined"
          color="warning"
          columns={["calc(50% - 40px)", "calc(50% - 40px)"]}
          gap={40}
          rows={"80%"}
        >
          <React.Box
            color="primary"
            rows={["1fr", "1fr"]}
            columns={["1fr"]}
            gap={10}
          >
            <React.Input
              type="number"
              value={String(multiplyV[0])}
              onChange={(value) => setMultiply([Number(value), multiplyV[1]])}
              fontSize={70}
              rowStart={1}
              rowEnd={2}
            />
            <React.Input
              value={String(multiplyV[1])}
              onChange={(value) => setMultiply([multiplyV[0], Number(value)])}
              fontSize={70}
              type="number"
              rowStart={2}
              rowEnd={3}
            />
          </React.Box>
          <React.Button2 onClick={() => multiply(multiplyV[0], multiplyV[1])}>
            Multiply
          </React.Button2>
        </React.Box>
        <React.Box
          variant="outlined"
          columns={["calc(50% - 40px)", "calc(50% - 40px)"]}
          gap={40}
          rows={"80%"}
          color="info"
        >
          <React.Box
            color="primary"
            rows={["1fr", "1fr"]}
            columns={["1fr"]}
            gap={10}
          >
            <React.Input
              type="number"
              value={String(addV[0])}
              onChange={(value) => setAdd([Number(value), addV[1]])}
              fontSize={70}
              rowStart={1}
              rowEnd={2}
            />
            <React.Input
              value={String(addV[1])}
              onChange={(value) => setAdd([addV[0], Number(value)])}
              fontSize={70}
              type="number"
              rowStart={2}
              rowEnd={3}
            />
          </React.Box>
          <React.Button
            color="info"
            onClick={() => add(addV[0], addV[1])}
            label="Add"
          />
        </React.Box>
      </React.Box>
      <React.Box color="neutral" variant="solid">
        Results :
        {results.map(([name, result], i) => (
          <React.Typography type="h4" key={i}>
            {name} = {result}
          </React.Typography>
        ))}
      </React.Box>
    </React.Box>
  );
}

React.serve(() => <App />, {
  runFrom: "browser",
  title: "python example"
});
