"use client"
import { useSelector } from "react-redux"
import { useTranslation } from "../context/TranslationContext"
import { isRTL } from "@/utils/helperFunction"

const UserFooter = () => {
    const t = useTranslation()
    const currentYear = new Date().getFullYear()
    const CompanyName = useSelector(state => state.WebSetting?.data?.company_name)
    return (
        <footer className="w-full h-12 flex justify-center items-center px-4 transition-all duration-300 ease-out">
            <div className="text-base font-medium secondryTextColor text-center">{t("copyright")} &copy; {currentYear} {CompanyName} {t("allRightsReserved")}</div>
        </footer>
    )
}

export default UserFooter