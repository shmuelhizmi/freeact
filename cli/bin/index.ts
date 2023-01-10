#!/usr/bin/env tsx

const command = process.argv[2];

process.argv.splice(2, 1);

switch (command) {
    case "build":
        require("./build");
        break;
    case "start":
        require("./start");
        break;
    case "init":
        require("./init");
        break;
    default:
        console.log("Unknown command: " + command);
        break;
}