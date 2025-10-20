import React, { useState } from 'react';
import { FaClock, FaFileAlt } from 'react-icons/fa';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '../context/TranslationContext';
import { IoMegaphone } from 'react-icons/io5';
import { useSelector } from 'react-redux';
import CustomLink from '../context/CustomLink';

const ActiveSubscriptions = ({ selectedPlan, activeSubscriptionsData, isLoading = false }) => {
  const t = useTranslation();
  const systemSettings = useSelector(state => state?.WebSetting?.data);
  const CurrencySymbol = systemSettings?.currency_symbol;

  // Show loading skeleton for subscription content
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6">
        {/* Header Bar Skeleton */}
        <div className="bg-gray-200 px-3 md:px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between rounded-xl gap-2">
          <div className="h-6 w-32 bg-gray-300 rounded"></div>
          <div className="flex items-center gap-2">
            <div className="h-6 w-16 bg-gray-300 rounded"></div>
            <span className="text-gray-300">|</span>
            <div className="h-4 w-12 bg-gray-300 rounded"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-6">
          {/* Listing Section Skeleton */}
          <div className="space-y-3 md:space-y-4 bg-gray-100 p-3 md:p-4 rounded-xl">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="h-4 w-20 bg-gray-300 rounded"></div>
            </div>
            <div className="space-y-2 md:space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-3 md:p-4">
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Ad Section Skeleton */}
          <div className="space-y-3 md:space-y-4 bg-gray-100 p-3 md:p-4 rounded-xl">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
              <div className="h-4 w-24 bg-gray-300 rounded"></div>
            </div>
            <div className="space-y-2 md:space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-3 md:p-4">
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Subscription Dates Skeleton */}
          <div className="bg-gray-100 rounded-xl p-3 md:p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-xs md:text-sm">
              <div>
                <div className="h-3 w-16 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
              <div className="text-left sm:text-right">
                <div className="h-3 w-12 bg-gray-200 rounded mb-1"></div>
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-3">
              <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold">
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get current package data based on selectedPlan
  const getCurrentPackage = () => {
    if (!activeSubscriptionsData || !Array.isArray(activeSubscriptionsData) || !selectedPlan) {
      return null;
    }

    // Try both string and number comparison
    const foundPackage = activeSubscriptionsData.find(pkg => {
      const matches = pkg.id.toString() === selectedPlan.toString() ||
        pkg.id === parseInt(selectedPlan) ||
        pkg.id === selectedPlan;
      return matches;
    });
    return foundPackage;
  };

  const currentPlan = getCurrentPackage();

  // Check if there are no active subscriptions
  if (!activeSubscriptionsData || !Array.isArray(activeSubscriptionsData) || activeSubscriptionsData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 text-center h-full">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <FaFileAlt className="w-8 h-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{t("noActiveSubscriptions")}</h3>
          <p className="text-gray-600 text-sm max-w-md">
            {t("noActiveSubscriptionsDescription")}
          </p>
        </div>
        <CustomLink href={"/subscription-plan"}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          {t("explorePlans")}
        </CustomLink>
      </div>
    );
  }

  // Check if selected plan doesn't match any active subscription
  if (!currentPlan) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <FaFileAlt className="w-8 h-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">{t("noActiveSubscriptions")}</h3>
          <p className="text-gray-600 text-sm max-w-md">
            {t("noActiveSubscriptionsDescription")}
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/subscription'}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          {t("explorePlans")}
        </button>
      </div>
    );
  }

  // Format date helper function
  const formatDate = (inputDate) => {
    if (inputDate === null) {
      return "Lifetime";
    }

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const date = new Date(inputDate);
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${t(dayOfWeek?.toLowerCase())}, ${day} ${t(month?.toLowerCase())}, ${year}`;
  };

  // Calculate remaining time helper function
  const calculateRemainingTime = (endDate, durationHours) => {
    const now = new Date();
    const end = new Date(endDate);
    const timeDiff = end - now;

    if (timeDiff <= 0) return "0 " + t("timeLeft"); // Expired

    // If duration is in hours (less than 24 hours)
    if (durationHours && durationHours < 24) {
      const remainingHours = Math.ceil(timeDiff / (1000 * 60 * 60));
      return `${remainingHours} ${t("hoursLeft")}`;
    }

    // Otherwise, calculate remaining days
    const remainingDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return `${remainingDays} ${t("daysLeft")}`;
  };

  // Helper to get feature limit and inclusion status
  const getFeatureLimit = (features, featureId) => {
    const feature = features?.find(f => f.id === featureId);

    if (!feature) {
      return { included: false, limit: null };
    }

    if (feature.limit_type === "unlimited") {
      return {
        included: true,
        limit: null,
        type: feature.limit_type,
      };
    } else {
      return {
        included: true,
        limit: feature.total_limit,
        usedLimit: feature.used_limit,
        type: feature.limit_type,
      };
    }
  };

  const formatDuration = (hours) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      return `${days} ${t("days")}`;
    } else {
      return `${hours} ${t("hours")}`;
    }
  };

  const getFeatureData = (features, type) => {
    // prevent error if features is undefined, null, or not an array
    if (!features || !Array.isArray(features)) {
      return {
        properties: { status: "not_included" },
        projects: { status: "not_included" },
      };
    }

    let propertyKey = type === "listing" ? "Property List" : "Property Feature List";
    let projectKey = type === "listing" ? "Project List" : "Project Feature List";

    // find property feature
    const propertyFeature = features.find(f => f.name === propertyKey);
    const projectFeature = features.find(f => f.name === projectKey);

    const makeLimitObj = (feature) => {
      if (!feature) return { status: "not_included" };
      if (feature.limit_type === "unlimited") return { status: "unlimited" };
      return {
        status: "limited",
        total: feature.total_limit ?? feature.limit ?? 0,
        used: feature.used_limit ?? 0,
      };
    };

    return {
      properties: makeLimitObj(propertyFeature),
      projects: makeLimitObj(projectFeature),
    };
  };



  const ListeningSection = ({ title, icon, data }) => {
    const renderRow = (label, item) => {
      // Not Included
      if (item.status === "not_included") {
        return (
          <div className="bg-white rounded-lg p-3 md:p-4">
            <div className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-gray-600">{t(label)}</span>
              <span className="font-bold">{t("notIncluded")}</span>
            </div>
          </div>
        );
      }

      // Unlimited (progress bar full 100%)
      if (item.status === "unlimited") {
        return (
          <div className="bg-white rounded-lg p-3 md:p-4">
            <div className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-gray-600">{t(label)}</span>
              <span className="font-bold">{t("unlimited")}</span>
            </div>
            <div className="relative">
              <Progress
                value={100} // always full
                className="h-2 [&>div]:primaryBg"
              />
            </div>
          </div>
        );
      }

      // Limited
      return (
        <div className="bg-white rounded-lg p-3 md:p-4">
          <div className="flex justify-between text-xs md:text-sm mb-2">
            <span className="text-gray-600">{t(label)}</span>
            <span className="font-bold text-gray-900">
              {item.used} / {item.total}
            </span>
          </div>
          <div className="relative">
            <Progress
              value={(item.used / item.total) * 100}
              className="h-2 [&>div]:primaryBg"
            />
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-3 md:space-y-4 primaryBackgroundBg p-3 md:p-4 rounded-xl">
        <div className="flex items-center gap-2 md:gap-3">
          {icon}
          <span className="font-medium text-sm md:text-base">{t(title)}</span>
        </div>

        <div className="space-y-2 md:space-y-3">
          {renderRow("properties", data.properties)}
          {renderRow("projects", data.projects)}
        </div>
      </div>
    );
  };


  // Only process feature data if currentPlan exists
  const processedDataForListing = currentPlan ? getFeatureData(currentPlan.features, "listing") : { properties: { status: "not_included" }, projects: { status: "not_included" } };
  const processedDataForFeatured = currentPlan ? getFeatureData(currentPlan.features, "featured") : { properties: { status: "not_included" }, projects: { status: "not_included" } };


  return (
    <div className="flex flex-col gap-4 md:gap-6 p-3 md:p-6">
      {/* Header Bar */}
      <div className="bg-black text-white px-3 md:px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between rounded-xl gap-2">
        <span className="font-semibold text-white capitalize text-sm md:text-base">{currentPlan?.translated_name}</span>
        <div className="flex items-center gap-2">
          <span className="text-base md:text-lg font-bold text-white"> {currentPlan?.price ? `${CurrencySymbol}${currentPlan?.price}` : t("free")}</span>
          {currentPlan?.duration &&
            <>
              <span className="text-white">|</span>
              <span className="text-xs md:text-sm text-white">{formatDuration(currentPlan?.duration)}</span>
            </>
          }
        </div>
      </div>

      {/* Content */}
      <div className="space-y-6">

        {/* Listening Section */}
        <ListeningSection
          title="listing"
          type="listing"
          icon={<FaFileAlt size={20} className='primaryColor' />}
          data={processedDataForListing}
        />

        {/* Featured Ad Section */}
        <ListeningSection
          title="featuredAd"
          type="featured"
          icon={<IoMegaphone size={20} className='primaryColor' />}
          data={processedDataForFeatured}
        />



        {/* Subscription Dates */}
        <div className="primaryCatBg rounded-xl p-3 md:p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-xs md:text-sm">
            <div>
              <div className="text-gray-500 text-xs mb-1">{t("startedOn")}</div>
              <div className="font-semibold text-gray-900 text-xs md:text-sm">{formatDate(currentPlan?.start_date)}</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-gray-500 text-xs mb-1">{t("endsOn")}</div>
              <div className="font-semibold text-gray-900 text-xs md:text-sm">{formatDate(currentPlan?.end_date)}</div>
            </div>
          </div>
          <div className="border-t border-dashed primaryBorderColor pt-3">
            <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold">
              <FaClock size={16} className='primaryColor md:w-5 md:h-5' />
              {calculateRemainingTime(currentPlan?.end_date, currentPlan?.duration)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveSubscriptions;
