"use client";
import { TranslationProvider } from "@/components/context/TranslationContext";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import FullScreenSpinLoader from "@/components/ui/loaders/FullScreenSpinLoader";
import { store } from "@/redux/store";
import "@/styles/globals.css";
import { getCurrentLocationData } from "@/utils/helperFunction";
import { Router, useRouter } from "next/router";
import Script from "next/script";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { Suspense, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function App({ Component, pageProps }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: parseInt(process.env.NEXT_PUBLIC_API_STALE_TIME) || 0,
        refetchOnWindowFocus: false,
      }
    }
  })) // 👈 stable client

  Router.events.on("routeChangeStart", () => {
    NProgress.start();
  });
  Router.events.on("routeChangeError", () => {
    NProgress.done();
  });
  Router.events.on("routeChangeComplete", () => {
    NProgress.done();
  });
  // Function to request location permission
  const requestLocationPermission = async () => {
    if ("geolocation" in navigator) {
      // Use getCurrentLocationData with proper callbacks
      getCurrentLocationData(
        (locationData) => {
        },
        (error) => {
          // Error callback
          console.error("Error getting location:", error);
        },
      );
    } else {
      // Geolocation is not supported
      console.error("Geolocation is not supported by this browser");
    }
  };

  const router = useRouter();
  const [needsPannellum, setNeedsPannellum] = useState(false);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Check if the current page needs Pannellum (property or project detail pages)
  useEffect(() => {
    const path = router.asPath;
    const isPannellumNeeded = path.includes('/property-details/') ||
      path.includes('/project-details/') ||
      path.includes('/user/properties/') ||
      path.includes('/my-property/');

    setNeedsPannellum(isPannellumNeeded);
  }, [router.asPath]);

  // Load Google Ads after window load
  useEffect(() => {
    const loadGoogleAds = () => {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3363691002401473';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.body.appendChild(script);
    };

    if (window.addEventListener) {
      window.addEventListener('load', loadGoogleAds, { once: true });
    } else {
      window.attachEvent('onload', loadGoogleAds);
    }

    return () => {
      if (window.removeEventListener) {
        window.removeEventListener('load', loadGoogleAds);
      } else if (window.detachEvent) {
        window.detachEvent('onload', loadGoogleAds);
      }
    };
  }, []);

  return (
    <>
      {needsPannellum && (
        <Script
          src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"
          strategy="lazyOnload"
        />
      )}

      {/* Google Maps - needed after user interaction */}
      <Script
        async
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API}&libraries=places&loading=async`}
        strategy="afterInteractive"
      />
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <Provider store={store}>
            <TranslationProvider>
              <Suspense fallback={<FullScreenSpinLoader />}>
                <Component {...pageProps} />
              </Suspense>
              <Toaster />
            </TranslationProvider>
          </Provider>
        </QueryClientProvider>
      </ErrorBoundary>
    </>
  );
}
