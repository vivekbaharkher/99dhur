"use client";
import { useRouter } from "next/router";
import { useState } from "react";
import {
  BiTachometer,
  BiUserCircle,
  BiTrashAlt, BiCog,
  BiUserPlus,
  BiNews,
  BiMessageSquareDetail,
  BiBell,
  BiCreditCard,
  BiDollarCircle, BiHeart,
  BiBuildingHouse,
  BiCalendar, BiExpand, BiCollapse,
  BiChevronRight
} from "react-icons/bi";
import { RiAdvertisementLine } from "react-icons/ri";
import { FaGlobe, FaSignOutAlt } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import CustomLink from "../context/CustomLink";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { useTranslation } from "../context/TranslationContext";
import Swal from "sweetalert2";
import { getAuth, deleteUser } from "firebase/auth";
import FirebaseData from "@/utils/Firebase";
import toast from "react-hot-toast";
import { logout } from "@/redux/slices/authSlice";
import { isDemoMode, isRTL } from "@/utils/helperFunction";
import { beforeLogoutApi, deleteUserAccountApi, getLanguageData } from "@/api/apiRoutes";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { IoHomeOutline } from "react-icons/io5";
import { setActiveLanguage, setCurrentLanguage, setIsFetched, setIsLanguageLoaded } from "@/redux/slices/languageSlice";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";

/**
 * UserSidebar Component
 * 
 * A modern, responsive sidebar navigation component for user dashboard
 * Features:
 * - Hierarchical navigation with grouped sections
 * - Pixel-perfect design matching Figma specifications
 * - Responsive design (mobile/desktop)
 * - Accessibility features (ARIA labels, keyboard navigation)
 * - Smooth animations and transitions
 * - Active state indicators
 * - Custom scrollbar styling
 * - RTL support
 * - Collapsible functionality with tooltips for icons
 * 
 * @param {boolean} isMobile - Whether the sidebar is in mobile mode
 * @param {boolean} open - Whether the sidebar is open/visible
 * @param {function} toggleDrawer - Function to toggle sidebar visibility
 * @param {boolean} collapsed - Whether the sidebar is collapsed (desktop only)
 */

const UserSidebar = ({ isMobile = false }) => {
  const router = useRouter();
  const pathname = router?.asPath;
  const dispatch = useDispatch();
  const settingData = useSelector((state) => state.WebSetting?.data);
  const userData = useSelector((state) => state.User?.data);
  const logo = settingData?.web_footer_logo;
  const t = useTranslation();
  const { signOut } = FirebaseData();
  const FcmToken = useSelector((state) => state.WebSetting?.fcmToken);
  const { locale } = router?.query;

  // Get sidebar state from shadcn sidebar context
  const { state: sidebarState, isMobile: sidebarIsMobile, toggleSidebar } = useSidebar();

  // Redux state for language management
  const languages = useSelector((state) => state.LanguageSettings?.languages);
  const activeLang = useSelector((state) => state.LanguageSettings?.active_language);
  const currentLang = activeLang;
  const langFile = useSelector((state) => state.LanguageSettings?.current_language);

  const isAgent = userData?.is_agent;

  // State for language submenu
  const [isLanguageSubmenuOpen, setIsLanguageSubmenuOpen] = useState(false);

  // Language change handler
  const handleLanguageChange = async (newLang) => {
    try {
      if (newLang === currentLang && langFile?.code !== newLang) return;

      // Close submenu after selection
      setIsLanguageSubmenuOpen(false);

      const response = await getLanguageData({
        language_code: newLang,
        web_language_file: 1,
      });

      if (response?.data?.rtl === 1) {
        document.dir = "rtl";
      } else {
        document.dir = "ltr";
      }
      document.documentElement.lang = newLang;

      dispatch(setActiveLanguage({ data: newLang }));
      dispatch(setCurrentLanguage({ data: response.data }));
      dispatch(setIsFetched({ data: true }));
      dispatch(setIsLanguageLoaded({ data: true }));

      let newPath = router.asPath;
      if (newPath === '/') {
        newPath = `/${newLang}`;
      } else if (locale) {
        newPath = newPath.replace(`/${locale}/`, `/${newLang}/`);
      } else if (newPath.startsWith('/')) {
        newPath = `/${newLang}${newPath}`;
      }

      router.push(newPath, undefined, { shallow: true });
    } catch (error) {
      console.error("Failed to change language:", error);
      toast.error(t("languageChangeError"));
    }
  };

  // Handle logout functionality
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

  // Handle delete account functionality
  const handleDeleteAcc = async () => {
    if (isDemoMode()) {
      Swal.fire({
        title: t("opps"),
        text: t("notAllowdDemo"),
        icon: "warning",
        showCancelButton: false,
        customClass: {
          confirmButton: "Swal-confirm-buttons",
          cancelButton: "Swal-cancel-buttons",
        },
        confirmButtonText: t("ok"),
        cancelButtonText: t("cancel"),
      });
      return; // Stop further execution
    }

    // Initialize Firebase Authentication
    const auth = getAuth();

    // Get the currently signed-in user
    const user = auth?.currentUser;

    Swal.fire({
      title: t("areYouSure"),
      text: t("youNotAbelToRevertThis"),
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "Swal-confirm-buttons",
        cancelButton: "Swal-cancel-buttons",
      },
      cancelButtonColor: "#d33",
      confirmButtonText: t("yes"),
      cancelButtonText: t("cancel"),
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Delete the user
        if (user) {
          try {
            // Firebase deleteUser returns undefined on success
            await deleteUser(user);

            // After successful Firebase deletion, call the API
            const response = await deleteUserAccountApi();

            // Handle success
            router.push("/");
            toast.success(t("accountDeletedSuccessfully"));
            dispatch(logout());
            signOut();
          } catch (error) {
            console.error("Error deleting user:", error.message);
            if (error.code === "auth/requires-recent-login") {
              router.push("/");
              toast.error(error.message);
              dispatch(logout());
              signOut();
            }
          }
        } else {
          try {
            const response = await deleteUserAccountApi();
            router.push("/");
            toast.success(t("accountDeletedSuccessfully"));
            dispatch(logout());
            signOut();
          } catch (err) {
            console.error(err);
          }
        }
      } else {
        console.error("delete account process canceled ");
      }
    });
  };

  // Sidebar navigation structure based on Figma design
  const sidebarSections = [
    {
      title: t("main"),
      items: [
        isAgent && {
          title: t("myDashboard"),
          icon: BiTachometer,
          url: "/user/dashboard",
        },
        {
          title: t("myProfile"),
          icon: BiUserCircle,
          url: "/user/profile",
        },
      ].filter(Boolean)
    },
    isAgent && {
      title: t("listings"),
      items: [
        {
          title: t("myProperties"),
          icon: IoHomeOutline,
          url: "/user/properties",
        },
        {
          title: t("myProjects"),
          icon: BiBuildingHouse,
          url: "/user/projects",
        },
        {
          title: t("myAdvertisement"),
          icon: RiAdvertisementLine,
          url: "/user/advertisement/?tab=property",
        },
        {
          title: t("favourites"),
          icon: BiHeart,
          url: "/user/favourites",
        },
      ]
    },
    {
      title: t("appointments"),
      items: [
        {
          title: t("bookings"),
          icon: BiCalendar,
          url: "/user/bookings",
        },
        !isAgent && {
          title: t("favourites"), // if you want Favourites here for normal user
          icon: BiHeart,
          url: "/user/favourites",
        },
        isAgent && {
          title: t("requests"),
          icon: BiUserPlus,
          url: "/user/requested-bookings",
        },
        isAgent && {
          title: t("appointmentSettings"),
          icon: BiCog,
          url: "/user/appointment-settings",
        },
      ].filter(Boolean)
    },
    {
      title: t("communication"),
      items: [
        {
          title: t("messages"),
          icon: BiMessageSquareDetail,
          url: "/user/chat",
        },
        {
          title: t("userNotification"),
          icon: BiBell,
          url: "/user/notifications",
        },
        {
          title: t("personalizeFeed"),
          icon: BiNews,
          url: "/user/personalize-feed",
        },
      ]
    },
    {
      title: t("accountAndBilling"),
      items: [
        isAgent && {
          title: t("mySubscriptions"),
          icon: BiCreditCard,
          url: "/user/subscription",
        },
        {
          title: t("transactionHistory"),
          icon: BiDollarCircle,
          url: "/user/transaction-history",
        },
        {
          title: t("deleteAccount"),
          icon: BiTrashAlt,
          onClick: handleDeleteAcc,
        },
      ].filter(Boolean)
    }
  ].filter(Boolean);


  return (
    <>
      {/* Header Section */}
      <SidebarHeader className="relative border-b" >
        <div className={`flex items-center justify-between !bg-white transition-all duration-300 ${sidebarState === "collapsed" ? "px-2 py-7" : "p-6"}`}>
          {/* Logo and Collapse button - Show when expanded */}
          {sidebarState === "expanded" && (
            <div className="flex items-center justify-between w-full">
              <CustomLink href="/" className="flex-shrink-0">
                <ImageWithPlaceholder
                  src={settingData?.web_logo || logo}
                  alt="eBroker Logo"
                  className="h-12 w-auto object-contain"
                />
              </CustomLink>
            </div>
          )}

          {/* Expand button - Show when collapsed (replaces logo) */}
          {sidebarState === "collapsed" && !sidebarIsMobile && (
            <button
              onClick={toggleSidebar}
              className="text-lg rounded-full h-10 w-10 flex items-center justify-center font-semibold primaryBgLight12 hover:bg-gray-100 transition-colors"
              aria-label="Expand Sidebar"
            >
              <BiExpand className="primaryColor h-5 w-5" aria-hidden="true" />
            </button>
          )}

          {/* Mobile close button */}
          {sidebarIsMobile && (
            <button
              onClick={toggleSidebar}
              className="text-lg rounded-full h-12 w-12 flex items-center justify-center font-semibold primaryBgLight12"
              aria-label="Close Sidebar Menu"
            >
              <div className="block md:hidden">
                <BiCollapse className="primaryColor h-5 w-5" aria-hidden="true" />
              </div>
              <div className="hidden md:block">
                <BiExpand className="primaryColor h-5 w-5" aria-hidden="true" />
              </div>
            </button>
          )}
        </div>
      </SidebarHeader>

      {/* Navigation Content */}
      <SidebarContent className="flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        <TooltipProvider>
          {sidebarSections.map((section, sectionIndex) => (
            <SidebarGroup key={section.title}>
              {/* Section Header */}
              <SidebarGroupLabel className="text-sm font-semibold leadColor uppercase px-3 py-2 text-left w-full">
                {section.title}
              </SidebarGroupLabel>

              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item, itemIndex) => {
                    const pathSegment = pathname?.split("/")[3];
                    const itemSegment = item?.url?.split("/")[2];
                    const isActive = pathSegment === itemSegment;
                    const IconComponent = item.icon;

                    // Handle submenu items
                    if (item.hasSubmenu) {
                      return (
                        <SidebarMenuItem key={`${sectionIndex}-${itemIndex}`}>
                          <SidebarMenuButton
                            onClick={(e) => {
                              e.preventDefault();
                              if (item.onToggleSubmenu) {
                                item.onToggleSubmenu();
                              }
                            }}
                            isActive={isActive}
                            className={`
                              ${isActive
                                ? "primaryColor primaryBgLight08 font-bold"
                                : "brandColor hover:bg-black/5 font-medium"
                              }
                            `}
                            tooltip={sidebarState === "collapsed" ? item.title : undefined}
                          >
                            {/* Icon */}
                            <span
                              className={`flex-shrink-0 w-5 h-5 transition-colors ${isActive ? "primaryColor" : "brandText"
                                }`}
                            >
                              <IconComponent size={20} aria-hidden="true" />
                            </span>

                            {/* Text - Hidden when collapsed */}
                            {(!sidebarState === "collapsed" || isMobile) && (
                              <>
                                <span className="flex-1 truncate text-left">
                                  {item.title}
                                </span>
                                <BiChevronRight
                                  size={16}
                                  className={`transition-transform duration-200 ${item.isSubmenuOpen ? 'rotate-90' : ''}`}
                                />
                              </>
                            )}
                          </SidebarMenuButton>

                          {/* Submenu */}
                          {item.isSubmenuOpen && item.submenuItems && (
                            <SidebarMenuSub>
                              {item.submenuItems.map((subItem, subIndex) => (
                                <SidebarMenuSubItem key={subIndex}>
                                  <SidebarMenuSubButton
                                    onClick={(e) => {
                                      e.preventDefault();
                                      if (subItem.onClick) {
                                        subItem.onClick();
                                      }
                                    }}
                                    isActive={subItem.isActive}
                                    className={`
                                      ${subItem.isActive
                                        ? "primaryColor primaryBgLight08 font-medium"
                                        : "text-gray-600 hover:bg-gray-100"
                                      }
                                    `}
                                  >
                                    {subItem.title}
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuItem>
                      );
                    }

                    // Regular menu items
                    return (
                      <SidebarMenuItem key={`${sectionIndex}-${itemIndex}`}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`
                            ${isActive
                              ? "primaryColor primaryBgLight08 font-bold"
                              : "brandColor hover:bg-black/5 font-medium"
                            }
                          `}
                          tooltip={sidebarState === "collapsed" ? item.title : undefined}
                        >
                          <CustomLink
                            href={item.url || "#"}
                            onClick={(e) => {
                              if (item.onClick) {
                                e.preventDefault();
                                item.onClick();
                              }
                              if (sidebarIsMobile) {
                                toggleSidebar();
                              }
                            }}
                          >
                            <IconComponent size={sidebarState === "collapsed" ? 24 : 20} aria-hidden="true" />
                            {sidebarState === "expanded" &&
                              <span>{item.title}</span>
                            }
                          </CustomLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}

          {/* Mobile-only Settings Section */}
          <SidebarGroup className="block md:hidden">
            <SidebarGroupLabel className="text-sm font-semibold leadColor uppercase px-3 py-2 text-start w-full">
              {t("settings")}
            </SidebarGroupLabel>

            <SidebarGroupContent>
              <SidebarMenu>
                {/* Language Selection */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={(e) => {
                      e.preventDefault();
                      setIsLanguageSubmenuOpen(!isLanguageSubmenuOpen);
                    }}
                    isActive={isLanguageSubmenuOpen}
                    className={`
                      ${isLanguageSubmenuOpen
                        ? "primaryColor primaryBgLight08 font-bold"
                        : "brandColor hover:bg-black/5 font-medium"
                      }
                    `}
                    tooltip={sidebarState === "collapsed" ? t("language") : undefined}
                  >
                    <FaGlobe size={sidebarState === "collapsed" ? 24 : 20} aria-hidden="true" />
                    <span>{t("language")}</span>
                    <BiChevronRight
                      size={sidebarState === "collapsed" ? 18 : 16}
                      className={`transition-transform duration-200 ${isLanguageSubmenuOpen ? 'rotate-90' : ''}`}
                    />
                  </SidebarMenuButton>

                  {/* Language Submenu */}
                  {isLanguageSubmenuOpen && (
                    <SidebarMenuSub>
                      {languages?.map((lang, langIndex) => (
                        <SidebarMenuSubItem key={langIndex}>
                          <SidebarMenuSubButton
                            onClick={(e) => {
                              e.preventDefault();
                              handleLanguageChange(lang.code);
                            }}
                            isActive={lang.code === currentLang}
                            className={`
                              ${lang.code === currentLang
                                ? "primaryColor primaryBgLight08 font-medium"
                                : "text-gray-600 hover:bg-gray-100"
                              }
                            `}
                          >
                            {lang.name}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>

                {/* Logout Button */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={(e) => {
                      e.preventDefault();
                      handleLogout();
                      if (sidebarIsMobile) {
                        toggleSidebar();
                      }
                    }}
                    className="brandColor hover:bg-red-50 hover:text-red-600 font-medium"
                    tooltip={sidebarState === "collapsed" ? t("logout") : undefined}
                  >
                    <FaSignOutAlt size={sidebarState === "collapsed" ? 24 : 20} aria-hidden="true" className="text-red-500" />
                    <span>{t("logout")}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </TooltipProvider>
      </SidebarContent>
    </>
  );
};

export default UserSidebar;
