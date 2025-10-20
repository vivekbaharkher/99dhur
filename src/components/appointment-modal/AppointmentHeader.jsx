import { useTranslation } from '../context/TranslationContext'
import CloseButton from './close-button/CloseButton'

const AppointmentHeader = ({ onClose, currentStep }) => {
    const t = useTranslation();

    const getStepTitle = (step) => {
        switch (step) {
            case 1:
                return t('chooseProperty');
            case 2:
                return t('pickDateAndMeetPrefs');
            case 3:
                return t('confirmation');
            default:
                return '';
        }
    }
    return (
        <header className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <h2 className="brandColor font-bold text-2xl">{getStepTitle(currentStep)}</h2>
            </div>
            <CloseButton onClose={onClose} />
        </header>
    )
}

export default AppointmentHeader