import { useTranslation } from "@/components/context/TranslationContext";
import React from "react";

const ProgressBar = ({ currentStep, totalSteps }) => {
    const t = useTranslation();
    const progressPercentage = (currentStep / totalSteps) * 100;

    return (
        <div className="flex flex-col gap-4 p-6 border-t newBorder">
            <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-700">{t("steps")}</span>
                <span className="text-sm font-bold text-gray-700">{currentStep}/{totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="primaryBg h-2 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${progressPercentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;