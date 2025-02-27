import React, { useEffect, useState } from "react";
import Head from "next/head";
import "@/styles/core.css";
import "@/styles/fonts.css";
import "@/styles/globals.css";
import "@/styles/elements.css";
import "@/styles/modal.css";
import "@/styles/dropdown.css";
import "@/styles/auth.css";
import "@/styles/profile.css";
import "@/styles/tables.css";
import "@/styles/kanban.css";
import "@/styles/sidepanel.css";
import "@/styles/dashboard.css";
import "@/styles/form.css";
import type { AppProps } from "next/app";
import { DEPLOYED_API_BASE_URL } from "@/utils/apiConfig";
import { useRouter } from "next/router";
import { AppProvider } from "@/components/context/AppContext";
import { refreshToken } from "@/utils/httpCalls";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshTokenOnLoad = async () => {
      if (!localStorage.access_token || !localStorage.refresh_token) {
        router.push("/auth");
      } else {
        if (localStorage.refresh_token) {
          await refreshToken((error) => {
            console.error("Error:", error);
            window.location.href = "/auth";
          });
          setInterval(async () => {
            await refreshToken((error) => {
              console.error("Error:", error);
            });
          }, 1000 * 30);
        } else {
          router.push("/auth");
        }
      }
    };

    refreshTokenOnLoad().finally(() => {
      setTimeout(() => {
        setLoading(false);
      }, 1000)
    });
  }, []);

  if (loading) {
    return (
      <div
        className="spinner-container"
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <div className="spinner" />
      </div>
    )
  } else {
    return (
      <AppProvider>
        <Head>
          <title>Ingenius</title>
        </Head>
        <div className="root">
          <Component {...pageProps} />
        </div>
      </AppProvider>
    );
  }
}
