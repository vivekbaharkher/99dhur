// Reusable modal component for appointment actions like Reason for reschedule, Cancel Appointment, Report user.

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
    DialogDescription,
} from '@/components/ui/dialog'
import { IoMdClose } from 'react-icons/io'
import { useTranslation } from '@/components/context/TranslationContext'
import { IoWarningOutline } from 'react-icons/io5'


const AppointmentActionModal = ({
    isOpen = false,
    onClose = () => { },
    handleSubmit = () => { },
    title = "",
    description = "",
    showWarning = false,
    warningText = "",
    submitButtonText = "",
    submitButtonColor = "brandBg",
    initialReason = "",
    isRequired = false
}) => {
    const [reason, setReason] = useState(initialReason);
    const t = useTranslation();

    // Reset reason when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setReason(initialReason);
        } else {
            setReason('');
        }
    }, [isOpen, initialReason]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-xl rounded-2xl p-0 gap-0 border-none overflow-hidden [&>button]:hidden  bg-white">
                <DialogHeader>
                    <div className='p-6 rounded-t-2xl newBorder flex items-center justify-between'>
                        <DialogTitle className='text-xl font-bold brandColor'>{t(title)}</DialogTitle>
                        <DialogDescription className="sr-only">
                            {t(description)}
                        </DialogDescription>
                        <button className='primaryBackgroundBg rounded-lg p-2 w-10 h-10' onClick={onClose}>
                            <IoMdClose className='w-6 h-6' />
                        </button>
                    </div>
                </DialogHeader>
                <div className='py-6 px-4 flex flex-col gap-4'>
                    {showWarning && (
                        <div className='p-6 rounded-lg borderRed flex flex-col gap-4 redBgLight04'>
                            <div className='flex flex-col items-start gap-4'>
                                <div className='flex items-center gap-4'>
                                    <span className="flex items-center justify-center w-10 h-10 bgRed rounded-full">
                                        <IoWarningOutline className='w-5 h-5 text-white' />
                                    </span>
                                    <span className='font-bold text-base md:text-xl redColor'>{t("warning")}</span>
                                </div>
                                <p className='font-medium brandColor text-sm md:text-base'>
                                    {t(warningText)}
                                </p>
                            </div>
                        </div>
                    )}

                    <div className='flex flex-col gap-2.5'>
                        <label htmlFor='reason' className='text-base font-medium brandColor'>
                            {t("reason")} {isRequired && <span className='text-red-500'>*</span>}
                        </label>
                        <textarea
                            id='reason'
                            name='reason'
                            rows={4}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder={t("writeReason")}
                            className='w-full primaryBackgroundBg newBorder py-3 px-4 rounded-lg resize-none focus:outline-none'
                        />
                    </div>
                </div>
                <div className='py-4 px-6 bg-white flex justify-end gap-4 border-t newBorderColor'>
                    <div className='flex items-center justify-between gap-4'>
                        <button className='font-medium text-sm md:text-base' onClick={onClose}>
                            {t("cancel")}
                        </button>
                        <button
                            className={`font-medium text-sm md:text-base rounded-lg text-white ${submitButtonColor} py-2 md:py-3 px-3 md:px-4`}
                            onClick={() => handleSubmit(reason)}
                        >
                            {t(submitButtonText)}
                        </button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    )
}

export default AppointmentActionModal