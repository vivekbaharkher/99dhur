"use client";

import { useState, useEffect } from "react";
import { MdAddCircleOutline } from "react-icons/md";
import { FaChevronDown, FaBell, FaSignOutAlt, FaUser, FaCalendarAlt } from "react-icons/fa";
import { useTranslation } from "../context/TranslationContext";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setActiveLanguage, setCurrentLanguage, setIsFetched, setIsLanguageLoaded } from "@/redux/slices/languageSlice";
import { beforeLogoutApi, getLanguageData } from "@/api/apiRoutes";
import { handlePackageCheck, isRTL } from "@/utils/helperFunction";
import { PackageTypes } from "@/utils/checkPackages/packageTypes";
import toast from "react-hot-toast";
import { BiBuildingHouse, BiCollapse, BiExpand } from "react-icons/bi";
import { store } from "@/redux/store";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Swal from "sweetalert2";
import { logout } from "@/redux/slices/authSlice";
import FirebaseData from "@/utils/Firebase";
import { IoHomeOutline } from "react-icons/io5";
import VerifiedIcon from "@/assets/verified.svg";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { useSidebar } from "@/components/ui/sidebar";

const UserHeader = ({ isMobile }) => {
    const t = useTranslation();
    const router = useRouter();
    const dispatch = useDispatch();
    const isRtl = isRTL();
    const { locale } = router?.query;

    // Get sidebar state from shadcn sidebar context
    const { state: sidebarState, isMobile: sidebarIsMobile, toggleSidebar } = useSidebar();

    // Redux state for language management
    const languages = useSelector((state) => state.LanguageSettings?.languages);
    const defaultLang = useSelector((state) => state.LanguageSettings?.default_language);
    const activeLang = useSelector((state) => state.LanguageSettings?.active_language);
    const currentLang = activeLang;
    const langFile = useSelector((state) => state.LanguageSettings?.current_language);

    // State for dropdowns
    const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    // Get user data from Redux store
    const userData = store.getState()?.User?.data;

    const { signOut } = FirebaseData();
    const FcmToken = useSelector((state) => state.WebSetting?.fcmToken);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.language-dropdown')) {
                setIsLangDropdownOpen(false);
            }
            if (!event.target.closest('.profile-dropdown')) {
                setIsProfileDropdownOpen(false);
            }
        };

        if (isLangDropdownOpen || isProfileDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isLangDropdownOpen, isProfileDropdownOpen]);

    // Language change handler - based on main Header implementation
    const handleLanguageChange = async (newLang) => {
        try {
            // Skip if already the current language
            if (newLang === currentLang && langFile?.code !== newLang) return;

            // Close dropdown
            setIsLangDropdownOpen(false);

            // Set manual change flag to prevent Layout from refetching
            // dispatch(setManualChange({ data: true }));

            // Fetch language data for the new language
            const response = await getLanguageData({
                language_code: newLang,
                web_language_file: 1,
            });

            // Handle RTL/LTR direction
            if (response?.data?.rtl === 1) {
                document.dir = "rtl";
            } else {
                document.dir = "ltr";
            }
            document.documentElement.lang = newLang;
            // Update Redux state with the new language data
            dispatch(setActiveLanguage({ data: newLang }));
            dispatch(setCurrentLanguage({ data: response.data }));
            dispatch(setIsFetched({ data: true }));
            dispatch(setIsLanguageLoaded({ data: true }));

            // Update URL to reflect language change
            let newPath = router.asPath;

            // Handle root path
            if (newPath === '/') {
                newPath = `/${newLang}`;
            }
            // Handle path with existing locale
            else if (locale) {
                newPath = newPath.replace(`/${locale}/`, `/${newLang}/`);
            }
            // Handle path without locale
            else if (newPath.startsWith('/')) {
                newPath = `/${newLang}${newPath}`;
            }

            // Use router.push with shallow option to prevent triggering getServerSideProps
            router.push(newPath, undefined, { shallow: true });
        } catch (error) {
            console.error("Failed to change language:", error);
            toast.error(t("languageChangeError"));
        }
    };

    // Handle profile menu navigation
    const handleProfileMenuClick = (menuType) => {
        setIsProfileDropdownOpen(false);

        switch (menuType) {
            case 'properties':
                router.push(`/${locale}/user/properties`);
                break;
            case 'project':
                router.push(`/${locale}/user/projects`);
            case 'booking':
                router.push(`/${locale}/user/bookings`);
                break;
            case 'profile':
                router.push(`/${locale}/user/profile`);
                break;
            case 'notifications':
                router.push(`/${locale}/user/notifications`);
                break;
            default:
                break;
        }
    };

    // Handle logout
    // handle logout functionality
    const handleLogout = async () => {
        Swal.fire({
            title: t("areYouSure"),
            text: t("youNotAbelToRevertThis"),
            icon: "warning",
            showCancelButton: true,
            customClass: {
                confirmButton: "Swal-confirm-buttons",
                cancelButton: "Swal-cancel-buttons",
            },
            confirmButtonText: t("yesLogout"),
            cancelButtonText: t("cancel"),
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (FcmToken) {
                        const res = await beforeLogoutApi({ fcm_id: FcmToken });
                        if (!res.error) {
                            dispatch(logout());
                            signOut();
                            toast.success(t("logoutSuccess"));
                            router.push("/");
                        }
                    } else {
                        dispatch(logout());
                        signOut();
                        toast.success(t("logoutSuccess"));
                        router.push("/");
                    }
                } catch (error) {
                    console.error("Error logging out:", error);
                }
            } else {
                toast.error(t("logoutcancel"));
            }
        });
    };


    return (
        <header className="w-full h-24 flex items-center justify-between px-4 sm:px-6 transition-all duration-300 ease-out">
            {/* Left Section - Sidebar Toggle */}
            <div className="flex-shrink-0">
                {sidebarState === "expanded" && (
                    <button
                        onClick={toggleSidebar}
                        className="text-lg rounded-full h-10 w-10 flex items-center justify-center font-semibold primaryBgLight12 hover:bg-gray-100 transition-colors ml-2"
                        aria-label="Collapse Sidebar"
                    >
                        <div className="block md:hidden">
                            <BiExpand className="primaryColor h-5 w-5" aria-hidden="true" />
                        </div>
                        <div className="hidden md:block">
                            <BiCollapse className="primaryColor h-5 w-5" aria-hidden="true" />
                        </div>
                    </button>
                )}
            </div>

            {/* Right Section - User Controls */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
                {/* Desktop Only - Language Dropdown */}
                {!isMobile && (
                    <div className="relative language-dropdown">
                        <button
                            className="flex w-max items-center gap-1 bg-transparent p-0 text-sm font-medium text-gray-700 transition-all hover:text-gray-900"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isProfileDropdownOpen) setIsProfileDropdownOpen(false);
                                setIsLangDropdownOpen(!isLangDropdownOpen);
                            }}
                        >
                            {languages?.find((lang) => lang.code === currentLang)?.name || t("language")}
                            <FaChevronDown
                                size={10}
                                className={`transition-transform duration-200 ${isLangDropdownOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {isLangDropdownOpen && (
                            <div className={`absolute ${isRtl ? "left-0" : "right-0"} top-full z-20 mt-1 w-[110px] rounded-md bg-white shadow-lg border`}>
                                <ul className="py-1 [&>li:last-child>button]:border-b-0">
                                    {languages &&
                                        languages.map((lang) => (
                                            <li key={lang.code}>
                                                <button
                                                    className="hover:primaryColor hover:primaryBorderColor group block w-full cursor-pointer border-b-2 border-dashed px-3 py-2 text-left transition-all duration-150"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleLanguageChange(lang.code);
                                                    }}
                                                >
                                                    <span className="transition-all duration-150 group-hover:ml-2">
                                                        {lang.name}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Desktop Only - User Profile Dropdown */}
                {!isMobile && (
                    <div className="relative profile-dropdown">
                        <button
                            className="flex items-center gap-2 p-1.5 hover:bg-gray-50 rounded-lg transition-colors max-w-[200px]"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isLangDropdownOpen) setIsLangDropdownOpen(false);
                                setIsProfileDropdownOpen(!isProfileDropdownOpen);
                            }}
                        >
                            {/* Profile Picture */}
                            <div className="relative flex-shrink-0">
                                <Avatar className="w-8 h-8">
                                    <AvatarImage
                                        src={userData?.profile}
                                        alt={userData?.name}
                                    />
                                    <AvatarFallback className="bg-gray-300 text-gray-600 text-xs font-medium">
                                        {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
                                    </AvatarFallback>
                                </Avatar>
                                {/* Verified Badge */}
                                {userData?.is_user_verified &&
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center bg-white">
                                        <ImageWithPlaceholder src={VerifiedIcon} alt="Verified" className='w-full h-full' width={0} height={0} />
                                    </div>
                                }
                            </div>

                            {/* User Info */}
                            <div className="text-left flex flex-col items-end min-w-0 flex-1">
                                <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                    {userData?.name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {userData?.is_agent ? t("agentPanel") : t("userPanel")}
                                </div>
                            </div>

                            <FaChevronDown
                                size={8}
                                className={`transition-transform duration-200 flex-shrink-0 ${isProfileDropdownOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>

                        {/* Profile Dropdown Menu */}
                        {isProfileDropdownOpen && (
                            <div className={`absolute ${isRtl ? "left-0" : "right-0"} top-full z-20 mt-2 w-64 bg-white rounded-lg shadow-lg border`}>
                                {/* Welcome Header */}
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <div className="text-sm font-medium text-gray-900">
                                        {t("welcome")}! {userData?.name?.split(' ')[0] || "Jack"}
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div className="py-2">
                                    {userData?.is_agent && (
                                        <button
                                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => handleProfileMenuClick('properties')}
                                        >
                                            <IoHomeOutline size={16} className="text-gray-500" />
                                            <span>{t("myProperties")}</span>
                                        </button>
                                    )}
                                    {userData?.is_agent && (
                                        <button
                                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => handleProfileMenuClick('project')}
                                        >
                                            <BiBuildingHouse size={16} className="text-gray-500" />
                                            <span>{t("myProject")}</span>
                                        </button>
                                    )}

                                    {userData?.is_agent && (
                                        <button
                                            className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                            onClick={() => handleProfileMenuClick('booking')}
                                        >
                                            <FaCalendarAlt size={16} className="text-gray-500" />
                                            <span>{t("booking")}</span>
                                        </button>
                                    )}

                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => handleProfileMenuClick('profile')}
                                    >
                                        <FaUser size={16} className="text-gray-500" />
                                        <span>{t("myProfile")}</span>
                                    </button>

                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        onClick={() => handleProfileMenuClick('notifications')}
                                    >
                                        <FaBell size={16} className="text-gray-500" />
                                        <span>{t("notifications")}</span>
                                    </button>
                                </div>

                                {/* Separator */}
                                <div className="border-t border-gray-100"></div>

                                {/* Logout Button */}
                                <div className="p-2">
                                    <button
                                        className="flex items-center gap-3 w-full px-4 py-3 text-left text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                                        onClick={handleLogout}
                                    >
                                        <FaSignOutAlt size={16} />
                                        <span>{t("logout")}</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Add Property/Project Button */}
                <div className="text-sm text-gray-500 flex-shrink-0">
                    {router?.asPath?.includes("dashboard") ?
                        <button
                            className='flex items-center gap-1.5 px-2 py-1.5 secondaryTextBg primaryTextColor rounded-md hover:opacity-90 transition-opacity text-xs sm:text-sm'
                            onClick={(e) => handlePackageCheck(e, PackageTypes.PROPERTY_LIST, router, null, null, true, null, t)}
                        >
                            <MdAddCircleOutline size={16} className="sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">{t("addProperty")}</span>
                            <span className="sm:hidden">Add</span>
                        </button>
                        :
                        router?.asPath?.includes("projects") ?
                            <button
                                className='flex items-center gap-1.5 px-2 py-1.5 secondaryTextBg primaryTextColor rounded-md hover:opacity-90 transition-opacity text-xs sm:text-sm'
                                onClick={(e) => handlePackageCheck(e, PackageTypes.PROJECT_LIST, router, null, null, true, null, t)}
                            >
                                <MdAddCircleOutline size={16} className="sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">{t("addProject")}</span>
                                <span className="sm:hidden">Add</span>
                            </button>
                            : null
                    }
                </div>
            </div>
        </header>
    );
};

export default UserHeader;