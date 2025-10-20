import dynamic from "next/dynamic";
import * as api from "@/api/apiRoutes";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setWebSettings } from "@/redux/slices/webSettingSlice";
import {
  setActiveLanguage,
  setCurrentLanguage,
  setDefaultLanguage,
  setIsFetched,
  setLanguages, setIsLanguageLoaded
} from "@/redux/slices/languageSlice";
import { useRouter } from "next/router";
import SomthingWentWrong from "../error/SomthingWentWrong";
import { setCategories, setInitialLoadComplete } from "@/redux/slices/cacheSlice";
import withAuth from "../HOC/withAuth";
import Header from "./Header";
import Footer from "./Footer";
import FullScreenSpinLoader from "../ui/loaders/FullScreenSpinLoader";
// To suppress hydration error
const PushNotificationLayout = dynamic(
  () => import("../wrapper/PushNotificationLayout"),
  { ssr: false },
);

import { useTranslation } from "../context/TranslationContext";
import CookieComponent from "../cookie/Cookie";
import PWAInstallButton from "../PWAInstallButton";
import UnderMaintenance from "../under-maintenance/UnderMaintenance";
import { useQuery } from "@tanstack/react-query";

const Layout = ({ children }) => {
  const router = useRouter();
  const t = useTranslation()
  const dispatch = useDispatch();
  const [isInitialLoading, setIsInitialLoading] = useState(false); // Only for initial app load
  const [isRouteChanging, setIsRouteChanging] = useState(false); // Only for route changes
  const [isError, setIsError] = useState(false);
  const isLoadCompleted = useSelector((state) => state.cacheData.initialLoadComplete); // Track if initial load finished

  // Get locale from router
  const urlLocale = router.query?.locale || router.locale;

  // Get language settings from Redux
  const defaultLanguage = useSelector((state) => state.LanguageSettings?.default_language);
  const activeLanguage = useSelector((state) => state.LanguageSettings?.active_language);
  const isFetched = useSelector((state) => state.LanguageSettings?.isFetched);
  const manualChange = useSelector((state) => state.LanguageSettings?.manual_change);
  const isLanguageLoaded = useSelector((state) => state.LanguageSettings?.isLanguageLoaded);
  const currentLanguage = useSelector((state) => state.LanguageSettings?.current_language);
  const webSettings = useSelector((state) => state.WebSetting?.data);
  const underMaintenance = webSettings?.web_maintenance_mode === "1";
  const allowCookies = webSettings?.allow_cookies;

  // Memoized API calls to prevent unnecessary re-renders
  const fetchWebSettings = useCallback(async () => {
    try {
      const response = await api.getWebSetting();
      const { data } = response;
      document.documentElement.lang = currentLanguage?.code;
      document.documentElement.style.setProperty(
        "--primary-color",
        data?.system_color
      );
      document.documentElement.style.setProperty(
        "--primary-category-background",
        data?.category_background
      );
      document.documentElement.style.setProperty(
        "--primary-sell",
        data?.sell_web_color
      );
      document.documentElement.style.setProperty(
        "--primary-rent",
        data?.rent_web_color
      );
      document.documentElement.style.setProperty(
        "--primary-sell-bg",
        data?.sell_web_background_color
      );
      document.documentElement.style.setProperty(
        "--primary-rent-bg",
        data?.rent_web_background_color
      );
      document.querySelectorAll("link[rel='icon']").forEach((link) => {
        link.href = data?.web_favicon;
      });

      dispatch(setWebSettings({ data }));
      dispatch(setLanguages({ data: data.languages }));
      dispatch(setDefaultLanguage({ data: data.default_language }));
      document.dir = currentLanguage?.rtl === 1 ? "rtl" : "ltr";

      // Determine if active language from URL is valid in response data language list
      const isLangValid = data.languages.some((lang) => lang.code === activeLanguage);
      if (!isLangValid && activeLanguage !== data.default_language) {
        // If active language is invalid, switch to default language
        dispatch(setIsLanguageLoaded({ data: false })); // Reset to allow fetch
        router.replace(`/${data.default_language}`);
      }
      return true;
    } catch (error) {
      console.error("Failed to fetch web settings:", error);
      setIsError(true);
      return false;
    }
  }, [dispatch]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.getCategoriesApi({ limit: "12", offset: "0" });
      dispatch(setCategories({ data: response.data }));
      return true;
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      return false;
    }
  }, [dispatch]);

  const fetchLanguageData = useCallback(
    async (localeCode) => {
      if (!localeCode) return false;

      // Skip if this is the current active language and data is already loaded
      if (localeCode === activeLanguage && isLanguageLoaded) {
        return true;
      }

      try {
        const response = await api.getLanguageData({
          language_code: localeCode,
          web_language_file: 1,
        });
        if (response?.data?.rtl === 1) {
          document.dir = "rtl";
        } else {
          document.dir = "ltr";
        }

        // Set active language to the requested locale
        dispatch(setActiveLanguage({ data: localeCode }));
        dispatch(setCurrentLanguage({ data: response.data }));
        dispatch(setIsFetched({ data: true }));

        // Also fetch categories to ensure they're updated with new language
        await fetchCategories();

        // Finally mark language as loaded after all dependent data is refreshed
        dispatch(setIsLanguageLoaded({ data: true }));

        return true;
      } catch (error) {
        console.error(
          `Failed to fetch language data for ${localeCode}:`,
          error,
        );
        return false;
      }
    },
    [dispatch, activeLanguage, isLanguageLoaded, fetchCategories],
  );

  // Fetch web settings using React Query for caching and stale time
  const webSettingsQuery = useQuery({
    queryKey: ['webSettings'],
    queryFn: fetchWebSettings,
    keepPreviousData: true,
    staleTime: 300000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  })

  // Fetch language data on initial load, manual change or language inactive conflict
  useEffect(() => {
    const loadLanguageData = async () => {
      // Only show loading for initial app load
      if (!isLoadCompleted) {
        setIsInitialLoading(true);
      }
      try {
        await fetchLanguageData(urlLocale);
      } catch (error) {
        console.error("Error loading language data:", error);
        setIsError(true);
      } finally {
        dispatch(setInitialLoadComplete(true));
        setIsInitialLoading(false);
      }
    };

    loadLanguageData();

    return () => { };
  }, [urlLocale]);



  // Show loader for initial load or route changes
  if (isInitialLoading) {
    return <FullScreenSpinLoader />;
  }

  if (underMaintenance) {
    return (
      <UnderMaintenance />
    )
  }

  if (isError) {
    return <SomthingWentWrong />;
  }

  return (
    <PushNotificationLayout>
      <Header />
      <main className="min-h-screen w-full">{children}</main>
      <Footer />
      {allowCookies && <CookieComponent />}
      {process.env.NEXT_PUBLIC_PWA_ENABLED === "true" && (
        <PWAInstallButton />
      )}
    </PushNotificationLayout>
  );
};

export default withAuth(Layout);
