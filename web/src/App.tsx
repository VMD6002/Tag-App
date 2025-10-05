import { Router, Route, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/NavBar";
import DocProvider from "./routes/contexts/Doc.Context";
import { Suspense, lazy } from "react";
import Spinner from "./components/craft/Spinner";

// 🔹 Lazy-loaded routes for code-splitting
const PageNotFound = lazy(() => import("./404"));
const Library = lazy(() => import("./routes/"));
const TagPage = lazy(() => import("./routes/tags"));
const ImgSetPage = lazy(() => import("./routes/ImgSet/[id]"));
const ImagePage = lazy(() => import("./routes/img/[id]"));
const VideoPage = lazy(() => import("./routes/video/[id]"));
const VideoSet = lazy(() => import("./routes/VideoSet/[id]"));

function App() {
  return (
    <Router hook={useHashLocation}>
      <ThemeProvider>
        <NavBar />
        <main className="max-w-5xl w-[calc(100%-4rem)] mx-auto">
          <Suspense fallback={<Spinner />}>
            <Switch>
              <Route path="/">
                <Library />
              </Route>

              <Route path="/tags">
                <TagPage />
              </Route>

              <DocProvider>
                <Route path="/server/img/:id">
                  <ImagePage />
                </Route>
                <Route path="/server/video/:id">
                  <VideoPage />
                </Route>
                <Route path="/server/ImgSet/:id">
                  <ImgSetPage />
                </Route>
                <Route path="/server/VideoSet/:id">
                  <VideoSet />
                </Route>
              </DocProvider>

              <Route>
                <PageNotFound />
              </Route>
            </Switch>
          </Suspense>
        </main>

        <div className="h-12" />
      </ThemeProvider>
    </Router>
  );
}

export default App;
