import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ConditionalProvider } from "./context/ConditionalProvider";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import NotFound from "@/pages/not-found";

// Import fonts
import "@fontsource/roboto-condensed/400.css";
import "@fontsource/roboto-condensed/700.css";
import "@fontsource/bangers/400.css";
import "@fontsource/teko/500.css";

// Get base path for GitHub Pages
const base = import.meta.env.DEV ? '' : '/opbb';

// Prefix all routes with base path
function useBasePath() {
  return (path: string) => `${base}${path}`;
}

function Router() {
  const makePath = useBasePath();
  return (
    <Switch>
      <Route path={makePath("/")} component={Home} />
      <Route path={makePath("/admin")} component={Admin} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConditionalProvider>
        <Router />
        <Toaster />
      </ConditionalProvider>
    </QueryClientProvider>
  );
}

export default App;