import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import store from "./store.ts";
import "./index.css";
import App from "./App.tsx";
import LoginScreen from "./screens/LoginScreen.tsx";
import PrivateRoute from "./components/common/PrivateRoute.tsx";
import DashboardScreen from "./screens/DashboardScreen.tsx";
import PublicRoute from "./components/common/PublicRoute.tsx";
import ColdStorageScreen from "./screens/ColdStorageScreen/index.tsx";
import SingleColdStorageScreen from "./screens/SingleColdStorageScreen/index.tsx";
import IncomingReceiptScreen from "./screens/IncomingReceiptScreen.tsx";

// Initialize the Query Client
const queryClient = new QueryClient();

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<PrivateRoute />}>
        <Route index element={<DashboardScreen />} />
        <Route path="/cold-storages" element={<ColdStorageScreen />} />
      </Route>
      <Route path="/cold-storages/:id" element={<SingleColdStorageScreen />} />
      <Route
        path="/cold-storages/:id/incoming-orders/:orderId"
        element={<IncomingReceiptScreen />}
      />

      <Route path="" element={<PublicRoute />}>
        <Route path="/login" element={<LoginScreen />} />
      </Route>
    </Route>
  )
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
