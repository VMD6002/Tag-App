import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import Spinner from "@/components/craft/Spinner";
import NavBar from "@/components/NavBar";
import { ThemeProvider } from "@/components/theme-provider";

const PageNotFound = lazy(() => import("./404"));
const Library = lazy(() => import("./routes/"));
const TagPage = lazy(() => import("./routes/tags"));
// Dev-only mock pages of the extension UI; absent from production builds.
const Mock = import.meta.env.DEV ? lazy(() => import("./mock")) : null;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <Router hook={useHashLocation}>
      <ThemeProvider>
        <Switch>
          {Mock && (
            <Route path="/mock" nest>
              <Suspense fallback={<Spinner />}>
                <Mock />
              </Suspense>
            </Route>
          )}
          <Route>
            <NavBar />
            <QueryClientProvider client={queryClient}>
              <main className="mx-auto w-[calc(100%-2rem)] max-w-6xl sm:w-[calc(100%-4rem)]">
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
            </QueryClientProvider>

            <div className="h-12" />
          </Route>
        </Switch>
      </ThemeProvider>
    </Router>
  );
}

export default App;
