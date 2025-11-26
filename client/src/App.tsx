import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Quotes from "@/pages/Quotes";
import Schedule from "@/pages/Schedule";
import Jobs from "@/pages/Jobs";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/jobs" component={Jobs} />
        {/* Placeholders for other routes */}
        <Route path="/customers">
          <div className="flex items-center justify-center h-full text-slate-400">Customers Page Placeholder</div>
        </Route>
        <Route path="/settings">
          <div className="flex items-center justify-center h-full text-slate-400">Settings Page Placeholder</div>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
