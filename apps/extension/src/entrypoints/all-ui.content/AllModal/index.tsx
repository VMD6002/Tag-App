import MainContent from "./MainContent";

export default function App() {
  const [Load, setLoad] = useState<boolean>(false);

  if (!Load)
    return (
      <>
        <form
          style={{ display: "none" }}
          onSubmit={(e) => {
            e.preventDefault();
            setLoad(true);
          }}
        >
          <input id="loadAndRefresh" type="submit" />
        </form>
        <form
          style={{ display: "none" }}
          onSubmit={(e) => {
            e.preventDefault();
            setLoad(false);
          }}
        >
          <input id="remove" type="submit" />
        </form>
      </>
    );
  return <MainContent />;
}
