import * as React from "react";
import { CssBaseline, CssVarsProvider } from "@mui/joy";

export default function Baseline({ children }: { children?: any }) {
  return (
    <CssVarsProvider
      defaultColorScheme={"dark"}
      defaultMode="dark"
      storageWindow={null}
    >
      <CssBaseline>{children}</CssBaseline>
    </CssVarsProvider>
  );
}

const BaselineContext = React.createContext(false);

export function withBaseline<T extends React.ComponentType<any>>(
  Component: T
): T {
  const WithBaseline = (props: any) => {
    const baseline = React.useContext(BaselineContext);
    if (!baseline) {
      return (
        <BaselineContext.Provider value={true}>
          <Baseline>
            <Component {...props} />
          </Baseline>
        </BaselineContext.Provider>
      );
    }
    return <Component {...props} />;
  };
  return WithBaseline as T;
}
