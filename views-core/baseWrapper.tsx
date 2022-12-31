import { CssBaseline, CssVarsProvider } from "@mui/joy";

export default ({ children }: { children: any }) => (
  <CssVarsProvider
    defaultColorScheme={"dark"}
    defaultMode="dark"
    storageWindow={null}
  >
    <CssBaseline>{children}</CssBaseline>
  </CssVarsProvider>
);
