import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/header";
import Footer from "@/components/footer";
import Home from "@/pages/home";
import LocationDetail from "@/pages/location-detail";
import SubmitLocation from "@/pages/submit-location";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();
  const isHomePage = location === "/";

  return (
    <div className="min-h-screen flex flex-col">
      <Switch>
        <Route path="/">
          {/* Home page without header/footer for clean intro experience */}
          <Home />
        </Route>
        <Route path="/location/:id">
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <LocationDetail />
            </main>
            <Footer />
          </div>
        </Route>
        <Route path="/submit">
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <SubmitLocation />
            </main>
            <Footer />
          </div>
        </Route>
        <Route path="/admin">
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <Admin />
            </main>
            <Footer />
          </div>
        </Route>
        <Route>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              <NotFound />
            </main>
            <Footer />
          </div>
        </Route>
      </Switch>
    </div>
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
