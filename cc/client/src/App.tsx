import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/not-found";
import { SocketProvider } from "./contexts/SocketContext";
import { MatchProvider } from "./contexts/MatchContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/admin" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <MatchProvider>
          <Router />
          <Toaster />
        </MatchProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
}

export default App;
