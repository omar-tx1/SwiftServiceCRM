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

import Settings from "@/pages/Settings";

import Customers from "@/pages/Customers";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/quotes" component={Quotes} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/customers" component={Customers} />
        <Route path="/settings" component={Settings} />
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
