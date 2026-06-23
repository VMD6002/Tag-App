import { lazy, Suspense } from "react";
import { Router, Route, Switch } from "wouter";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/NavBar";
import Spinner from "@/components/craft/Spinner";
import { useHashLocation } from "wouter/use-hash-location";

const PageNotFound = lazy(() => import("./404"));
const Library = lazy(() => import("./routes/"));
const TagPage = lazy(() => import("./routes/tags"));

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
