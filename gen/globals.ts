
  let globals = {} as any;
    window.globals = globals;
  const lazy = Promise.all([import("react/jsx-runtime").then((m) => (globals["react/jsx-runtime"] = m)),import("react").then((m) => (globals["react"] = m)),import("react-dom").then((m) => (globals["react-dom"] = m)),import("@react-fullstack/fullstack-socket-client").then((m) => (globals["@react-fullstack/fullstack-socket-client"] = m)),import("@react-fullstack/fullstack").then((m) => (globals["@react-fullstack/fullstack"] = m)),import("socket.io-client").then((m) => (globals["socket.io-client"] = m))]);
    export default lazy;
  