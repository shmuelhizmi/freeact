import { server, views } from "./build";

Promise.all([server(), views()])
  .then(() => {
    console.log("Done.");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
