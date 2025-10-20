import { PiVideoCamera } from 'react-icons/pi';
import { useTranslation } from '../context/TranslationContext';
import { BiPhoneCall, BiUserPlus } from 'react-icons/bi';
import { MdOutlineMeetingRoom } from 'react-icons/md';

// Icon mapping for meeting types
const getIconComponent = (iconName) => {
    const iconMap = {
        'PiVideoCamera': PiVideoCamera,
        'BiPhoneCall': BiPhoneCall,
        'BiUserPlus': BiUserPlus
    };
    return iconMap[iconName] || MdOutlineMeetingRoom;
};

/**
 * MeetingTypeCard component for selecting meeting type options in appointment flow
 * 
 * @param {Object} props - Component props
 * @param {Array} props.meetingTypes - Array of meeting type options to display
 * @param {string} props.selectedType - Currently selected meeting type
 * @param {Function} props.onSelectMeetingType - Handler function when meeting type is selected
 */
const MeetingTypeCard = ({
    meetingTypes = [],
    selectedType = '',
    onSelectMeetingType = () => { }
}) => {
    const t = useTranslation();
    return (
        <div className="newBorder bg-white rounded-2xl overflow-hidden">
            {/* Card Header */}
            <div className="flex justify-between items-center p-4 border-b newBorderColor">
                <h2 className="text-base font-semibold secondryTextColor">{t("selectMeetingType")}</h2>
            </div>

            {/* Meeting Type Options */}
            <div className="p-4 flex flex-col gap-6">
                {meetingTypes.map((type, index) => {
                    const IconComponent = getIconComponent(type.icon);
                    return (
                        <div
                            key={`${type?.id}-${index}`}
                            className={`py-2 px-3 rounded-lg cursor-pointer transition-all duration-200 flex items-center gap-3 relative newBorder`}
                            onClick={() => onSelectMeetingType(type?.id)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onSelectMeetingType(type.id);
                                }
                            }}
                            tabIndex={0}
                            role="button"
                        >

                            <IconComponent className="w-5 h-5 leadColor" />

                            <div className="flex justify-between items-center w-full">
                                <h3 className="text-base font-medium leadColor">{t(type.label)}</h3>
                                <input
                                    type="radio"
                                    name="meetingType"
                                    id={type.id}
                                    checked={selectedType === type.id}
                                    onChange={() => onSelectMeetingType(type.id)}
                                    className="w-5 h-5 cursor-pointer primaryCheckbox"
                                />
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MeetingTypeCard;