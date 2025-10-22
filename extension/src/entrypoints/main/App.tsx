import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import Library from "./routes/library";
import Supported from "./routes/supported";
import Settings from "./routes/settings";
import TagPage from "./routes/tags";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/NavBar";
import PageNotFound from "./404";
import Server from "./routes/server";
import ServerTags from "./routes/server/tags";
import ImgSetPage from "./routes/server/ImgSet/[id]";
import ImagePage from "./routes/server/img/[id]";
import VideoPage from "./routes/server/video/[id]";
import VideoSet from "./routes/server/VideoSet/[id]";
import DocProvider from "./routes/server/contexts/Doc.Context";
import ScriptingGuid from "./routes/supported/doc";

function App() {
  return (
    <>
      <Router hook={useHashLocation}>
        <ThemeProvider>
          <NavBar />
          <main className="max-w-5xl w-[calc(100%-4rem)] mx-auto">
            <Switch>
              <Route path={"/"}>
                <Library />
              </Route>
              <Route path={"/tags"}>
                <TagPage />
              </Route>
              <Route path={"/supported"}>
                <Supported />
              </Route>
              <Route path={"/supported/docs"}>
                <ScriptingGuid />
              </Route>
              <Route path={"/settings"}>
                <Settings />
              </Route>
              <Route path={"/server"}>
                <Server />
              </Route>
              <Route path={"/server/tags"}>
                <ServerTags />
              </Route>
              <DocProvider>
                <Route path={"/server/img/:id"}>
                  <ImagePage />
                </Route>
                <Route path={"/server/video/:id"}>
                  <VideoPage />
                </Route>
                <Route path={"/server/ImgSet/:id"}>
                  <ImgSetPage />
                </Route>
                <Route path={"/server/VideoSet/:id"}>
                  <VideoSet />
                </Route>
              </DocProvider>
              <Route>
                <PageNotFound />
              </Route>
            </Switch>
          </main>
          <div className="h-12" />
        </ThemeProvider>
      </Router>
    </>
  );
}

export default App;
