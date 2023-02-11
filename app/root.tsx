// noinspection JSUnusedGlobalSymbols

import type { LinksFunction, MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import tailwindStylesheetUrl from "./styles/tailwind.css";
import highlightJsStylesheetUrl from "highlight.js/styles/github-dark.css";
import NavBar from "~/components/NavBar";

export const links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: tailwindStylesheetUrl },
    { rel: "stylesheet", href: highlightJsStylesheetUrl },
  ];
};

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "Noah's Thoughts",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en" className="h-full">
      <head>
        <script
          defer
          data-domain="noahguillory.com"
          src="https://analytics.noahguillory.me/js/script.js"
        ></script>
        <Meta />
        <Links />
      </head>
      <body className="bg-white">
        <NavBar />
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
