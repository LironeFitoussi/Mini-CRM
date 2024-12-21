// src/index.jsx
import "./index.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from './queryClient'; // Ensure correct path

import routes from "./router.jsx";
import './i18n.js';

const root = createRoot(document.getElementById("root"));

const onRedirectCallback = (appState) => {
  window.location.href = appState?.returnTo || window.location.pathname;
};

const router = createBrowserRouter(routes);

// Root rendering
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin,
          audience: import.meta.env.VITE_AUTH0_AUDIENCE, // Add if using API access
          scope: 'openid profile email', // Ensure 'email' scope is included
        }}
        cacheLocation="localstorage"
        onRedirectCallback={onRedirectCallback} // Preserve route
      >
        <RouterProvider router={router} />
      </Auth0Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
