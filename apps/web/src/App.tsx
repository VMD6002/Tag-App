import { lazy, Suspense } from "react";
import { Router, Route, Switch } from "wouter";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/NavBar";
import Spinner from "@/components/craft/Spinner";
import DocProvider from "./routes/contexts/Doc.Context";
import { useHashLocation } from "wouter/use-hash-location";

const PageNotFound = lazy(() => import("./404"));
const Library = lazy(() => import("./routes/"));
const TagPage = lazy(() => import("./routes/tags"));
const ImagePage = lazy(() => import("./routes/img/[id]"));
const VideoPage = lazy(() => import("./routes/video/[id]"));
const GalleryPage = lazy(() => import("./routes/gallery/[id]"));
const TextPage = lazy(() => import("./routes/txt/[id]"));
const AudioPage = lazy(() => import("./routes/audio/[id]"));

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
                <Route path="/img/:id">
                  <ImagePage />
                </Route>
                <Route path="/video/:id">
                  <VideoPage />
                </Route>
                <Route path="/gallery/:id">
                  <GalleryPage />
                </Route>
                <Route path="/txt/:id">
                  <TextPage />
                </Route>
                <Route path="/audio/:id">
                  <AudioPage />
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
