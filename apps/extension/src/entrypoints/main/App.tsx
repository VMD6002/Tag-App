import { useAtomValue } from "jotai";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { ConfirmProvider } from "@/components/craft/confirm-dialog";
import MyQueryProvider from "@/components/MyQueryProvider";
import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import PageNotFound from "./404";
import { appModeAtom } from "./atoms/settings";
import Library from "./routes/library";
import RemoteLibrary from "./routes/remote";
import RemoteTagPage from "./routes/remoteTags";
import Settings from "./routes/settings";
import Supported from "./routes/supported";
import TagPage from "./routes/tags";

function App() {
  const appMode = useAtomValue(appModeAtom);
  return (
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
        <ConfirmProvider />
        <Toaster />
      </ThemeProvider>
    </Router>
  );
}

export default App;
