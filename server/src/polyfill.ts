// @ts-ignore
global.self = global;

// fake css loader
// @ts-ignore
require.extensions['.css'] = () => undefined;
