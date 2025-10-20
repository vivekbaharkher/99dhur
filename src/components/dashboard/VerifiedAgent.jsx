import React from 'react'
import { useTranslation } from '../context/TranslationContext';
import { useSelector } from 'react-redux';
import CustomLink from '../context/CustomLink';
import { BadgeSvg } from '@/utils/helperFunction';

const VerifiedAgent = () => {
    const t = useTranslation();

    const webSettings = useSelector(state => state.WebSetting?.data);
    const userVerificationStatus = webSettings?.verification_status; // possible values: "initial", "pending", "success", "failed"


    // Render verification content based on status
    const renderVerificationContent = () => {
        switch (userVerificationStatus) {
            case "success":
                return (
                    <div className="p-5 h-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-medium mb-2">
                                {t("verifySuccessTitle")}
                            </h1>
                            <p className="text-base mb-4 opacity-80">{t("verifySuccessDesc")}</p>
                        </div>
                        <div className="flex items-center gap-2 primaryColor bg-white uppercase px-3 py-2 rounded-lg font-bold">
                            <span className="font-medium">{t("verified")}</span>
                            {<BadgeSvg color="#087c7c" />}
                        </div>
                    </div>
                );
            case "failed":
                return (
                    <div className="p-5 h-full flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-medium mb-2">
                                {t("verifyFailTitle")}
                            </h1>
                            <p className="text-base mb-4 opacity-80">{t("verifyFailDesc")}</p>
                        </div>
                        <CustomLink href="/user/verification-form">
                            <button className="text-base  font-semibold bg-white primaryColor px-5 py-2.5 rounded-lg">
                                {t("reApply")}
                            </button>
                        </CustomLink>
                    </div>
                );
            case "pending":
                return (
                    <div className="p-5 h-full flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-medium mb-2">
                                {t("verifyPendingTitle")}
                            </h1>
                            <p className="text-base mb-4 opacity-80">{t("verifyPendingDesc")}</p>
                        </div>
                    </div>
                );
            case "initial":
            default:
                return (
                    <div className="p-5 h-full flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h1 className="text-2xl md:text-4xl font-medium mb-2">
                                {t("verifyIntialTitle")}
                            </h1>
                            <p className="text-base mb-4 opacity-80">{t("verifyIntialDesc")}</p>
                        </div>
                        <CustomLink href="/user/verification-form">
                            <button className="bg-white primaryColor px-4 py-2 rounded-md font-bold">
                                {t("apply")}
                            </button>
                        </CustomLink>
                    </div>
                );
        }
    };

    return (
        <div className='grid grid-cols-1 gap-4'>
            <div className="min-h-[130px] border col-span-12 md:col-span-12 primaryBg text-white rounded-lg overflow-hidden">
                {renderVerificationContent()}
            </div>
        </div>
    )
}

export default VerifiedAgent