"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "../context/TranslationContext";
import UserHeader from "./UserHeader";
import UserFooter from "./UserFooter";
import UserSidebar from "./UserSidebar";
import { getWebSetting } from "@/api/apiRoutes";
import { useRouter } from "next/router";
import { setWebSettings } from "@/redux/slices/webSettingSlice";
import { logout } from "@/redux/slices/authSlice";
import FirebaseData from "@/utils/Firebase";
import Swal from "sweetalert2";
import withAuth from "../HOC/withAuth";
import { isRTL } from "@/utils/helperFunction";
import {
    SidebarProvider,
    Sidebar,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";

const VerticleLayout = ({ children }) => {
    const { signOut } = FirebaseData();
    const t = useTranslation();
    const router = useRouter();
    const { slug } = router.query;
    const dispatch = useDispatch();

    const isRtl = isRTL();
    const webSettings = useSelector((state) => state?.WebSetting?.data);
    const currentLang = useSelector(
        (state) => state.LanguageSettings?.current_language
    );

    const [isMobile, setIsMobile] = useState(false);

    // 🔹 Logout if account is deactivated
    const CheckActiveUserAccount = () => {
        if (webSettings?.is_active === false) {
            Swal.fire({
                title: t("opps"),
                text: t("yourAccountDeactivated"),
                icon: "warning",
                allowOutsideClick: false,
                showCancelButton: false,
                customClass: {
                    confirmButton: "Swal-confirm-buttons",
                    cancelButton: "Swal-cancel-buttons",
                },
                confirmButtonText: t("logout"),
            }).then((result) => {
                if (result.isConfirmed) {
                    dispatch(logout());
                    signOut();
                }
            });
        }
    };

    useEffect(() => {
        CheckActiveUserAccount();
    }, [webSettings?.is_active]);

    // 🔹 Fetch settings
    const fetchWebSettings = async () => {
        try {
            const res = await getWebSetting();
            if (!res?.error) {
                dispatch(setWebSettings({ data: res.data }));
                document.documentElement.lang = currentLang?.code;
                document.documentElement.dir = currentLang?.rtl ? "rtl" : "ltr";

                document.documentElement.style.setProperty(
                    "--primary-color",
                    res?.data?.system_color
                );
                document.documentElement.style.setProperty(
                    "--primary-category-background",
                    res?.data?.category_background
                );
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (slug) {
            fetchWebSettings();
        }
    }, [slug]);

    // 🔹 Handle window resize
    const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <SidebarProvider>
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar using shadcn components */}
                <Sidebar
                    side={isRtl ? "right" : "left"}
                    variant="sidebar"
                    collapsible="icon"
                    className="border-r border-gray-200 bg-white flex-shrink-0"
                >
                    <UserSidebar isMobile={isMobile} />
                </Sidebar>

                {/* Main content area with header and footer */}
                <SidebarInset className="flex flex-col flex-1 min-w-0 overflow-hidden">
                    {/* Header - Fixed at top of main content area */}
                    <div className="border-b">
                        <UserHeader isMobile={isMobile} />
                    </div>

                    {/* Main content area with proper spacing */}
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <main className="h-full w-full max-w-full overflow-y-auto primaryBackgroundBg">
                            <div className="w-full max-w-full p-2 md:p-4 lg:p-6">
                                {children}
                            </div>
                        </main>
                    </div>

                    {/* Footer - Fixed at bottom of main content area */}
                    <div className="border-t">
                        <UserFooter isMobile={isMobile} />
                    </div>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
};

export default withAuth(VerticleLayout);
