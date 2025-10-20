import { useTranslation } from '@/components/context/TranslationContext';
import { getFormattedDate } from '@/utils/helperFunction';
import { BiPhoneCall } from 'react-icons/bi';
import { FaRegCalendarAlt, FaRegClock } from 'react-icons/fa';
import { LuPencilLine } from 'react-icons/lu';

const MeetingScheduleCard = ({
    date,
    time,
    meetingType,
    onChangeClick = () => { },
}) => {

    const t = useTranslation();
    return (
        <div className="cardBg newBorder rounded-2xl w-full">
            <div className="flex items-stretch justify-between p-3 md:p-4 border-b border-solid newBorderColor">
                <div className="flex items-center gap-2 flex-grow">
                    <h3 className="brandColor font-semibold text-sm md:text-base">{t("meetingSchedule")}</h3>
                </div>
                <button
                    onClick={onChangeClick}
                    className="flex items-center gap-1 px-2 rounded-lg"
                    aria-label="Change meeting schedule"
                >
                    <LuPencilLine className="w-4 h-4 md:w-5 md:h-5 brandColor" />
                    <span className="brandColor text-sm md:text-base font-medium">{t("change")}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-7 p-4">
                {/* Date */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 primaryBgLight12 rounded-lg flex items-center justify-center p-2 md:p-3 flex-shrink-0">
                        <FaRegCalendarAlt className="w-5 h-5 md:w-6 md:h-6 primaryColor" />
                    </div>
                    <div className="flex flex-col justify-center gap-1 md:gap-2 min-w-0">
                        <h4 className="brandColor text-sm md:text-base font-bold truncate">{getFormattedDate(date, t)}</h4>
                        <p className="leadColor text-xs md:text-sm font-medium">{t("appointmentDate")}</p>
                    </div>
                </div>

                {/* Time */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 primaryBgLight12 rounded-lg flex items-center justify-center p-2 md:p-3 flex-shrink-0">
                        <FaRegClock className="w-5 h-5 md:w-6 md:h-6 primaryColor" />
                    </div>
                    <div className="flex flex-col justify-center gap-1 md:gap-2 min-w-0">
                        <h4 className="brandColor text-sm md:text-base font-bold truncate">{time}</h4>
                        <p className="leadColor text-xs md:text-sm font-medium">{t("appointmentTime")}</p>
                    </div>
                </div>

                {/* Meeting Type */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 md:w-12 md:h-12 primaryBgLight12 rounded-lg flex items-center justify-center p-2 md:p-3 flex-shrink-0">
                        <BiPhoneCall className="w-5 h-5 md:w-6 md:h-6 primaryColor" />
                    </div>
                    <div className="flex flex-col justify-center gap-1 md:gap-2 min-w-0">
                        <h4 className="brandColor text-sm md:text-base font-bold truncate">{t(meetingType)}</h4>
                        <p className="leadColor text-xs md:text-sm font-medium">{t("meetingType")}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MeetingScheduleCard;