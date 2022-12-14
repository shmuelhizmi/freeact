# Freeact - extremely easy GUI in react
allegedly the fastest way to create slick nodejs GUI applications

* ### zero config
* ### zero css/html/dom
* ### single self contained library
* ### out of the box typescript
* ### transparent server to client communication you wont need to even think about.
* ### create web/gui apps with just as easily as you would create node cli apps
* ### great for - ML applications | dev tools | dashboards

because we believe that whenever you are not writing logic, you are writing configuration, and configuration is boring trash, and the 
![gwag](./lost-time.webp)

# Quick Example
the following application is created by only a single code typescript
```tsx
// index.tsx
import React, { useState } from "freeact";

function App() {
  const [count, setCount] = useState(0);
  return (
    <React.Box rows={["45px", "50%"]} columns="70%" gap={35}>
      <React.Typography variant="solid" type="h1">
        Counter App
      </React.Typography>
      <React.Box
        variant="soft"
        columns={"100%"}
        rows={["25%", "65%"]}
        gap={"5%"}
        padding={"5%"}
      >
        <React.Typography type="h2">Count: {count}</React.Typography>
        <React.Button
          onClick={() => setCount(count + 1)}
          variant="outlined"
          color="primary"
          label="increment"
        />
      </React.Box>
    </React.Box>
  );
}

React.serve(() => <App />);

```
now the only thing needed in order to run the application is to install freeact using your preferred package manager

>for example `npm i freeact`  

and run it with
> `npm exec freeact ./index.tsx`

or alternatively you can define it in a `package.json`
```json
// package.json
{
    "scripts": {
      "start": "freeact ./index.tsx"
    },
    "dependencies": {
      "freeact": "^0.0.7"
    }
  }
  
```
## and we are done,  here is our app 🎉
![app](./assets//counter.png)