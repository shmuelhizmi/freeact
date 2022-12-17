import { Box, Typography, Divider, Card } from "@mui/joy";
import AppWrapper from "./baseWrapper";

export function Error({ error }: { error: Error }) {
  return (
    <AppWrapper>
      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
        }}
      >
        <Card
          sx={{
            width: 500,
            height: 300,
            bgcolor: "background.paper",
            p: 2,
            display: "grid",
            gridTemplateRows: "auto auto 1fr",
          }}
          variant="outlined"
        >
          <Typography level="h4" sx={{ fontWeight: "bold" }}>
            Error : <span style={{ color: "red" }}>{error.message}</span>
          </Typography>
          <Divider />
          <Typography level="body1" sx={{ overflow: "auto", height: "100%" }}>
            {error.stack}
          </Typography>
        </Card>
      </Box>
    </AppWrapper>
  );
}
