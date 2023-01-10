
export function Error({ error }: { error: Error }) {
  return (
    <div>
      <h1>Error</h1>
      <p>{error.message}</p>
      <pre>{error.stack}</pre>
    </div>
  );
}
