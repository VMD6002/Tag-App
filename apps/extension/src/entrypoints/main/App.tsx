import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/NavBar";
import PageNotFound from "./404";

import Library from "./routes/library";
import RemoteLibrary from "./routes/remote";
import Supported from "./routes/supported";
import Settings from "./routes/settings";
import TagPage from "./routes/tags";
import RemoteTagPage from "./routes/remoteTags";
import MyQueryProvider from "@/components/MyQueryProvider";
import { appModeAtom } from "./atoms/settings";
import { useAtomValue } from "jotai";

function App() {
  const appMode = useAtomValue(appModeAtom);
  return (
    <>
      <Router hook={useHashLocation}>
        <ThemeProvider>
          <NavBar />
          <main className="max-w-5xl w-[calc(100%-4rem)] mx-auto relative">
            <MyQueryProvider>
              <Switch>
                <Route path={"/"}>
                  {appMode === "local" ? <Library /> : <RemoteLibrary />}
                </Route>
                <Route path={"/tags"}>
                  {appMode === "local" ? <TagPage /> : <RemoteTagPage />}
                </Route>
                <Route path={"/supported"}>
                  <Supported />
                </Route>
                <Route path={"/settings"}>
                  <Settings />
                </Route>
                <Route>
                  <PageNotFound />
                </Route>
              </Switch>
            </MyQueryProvider>
          </main>
          <div className="h-12" />
        </ThemeProvider>
      </Router>
    </>
  );
}

export default App;
