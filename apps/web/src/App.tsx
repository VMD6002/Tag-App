import { lazy, Suspense } from "react";
import { Router, Route, Switch } from "wouter";
import { ThemeProvider } from "@/components/theme-provider";
import NavBar from "@/components/NavBar";
import Spinner from "@/components/craft/Spinner";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const PageNotFound = lazy(() => import("./404"));
const Library = lazy(() => import("./routes/"));
const TagPage = lazy(() => import("./routes/tags"));

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
        <NavBar />
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>

        <div className="h-12" />
      </ThemeProvider>
    </Router>
  );
}

export default App;
