import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog'
import { useTranslation } from '../context/TranslationContext'

/**
 * UserBlockModal component for blocking a user
 * 
 * @param {Object} param0 - Component props
 * @param {boolean} param0.isOpen - Whether the modal is open
 * @param {Function} param0.onClose - Handler function when modal is closed
 * @param {Function} param0.onConfirm - Handler function when block is confirmed
 * @param {string} param0.reason - Reason for blocking the user
 * @param {Function} param0.setReason - Function to set the reason for blocking
 * @param {Object} param0.activeChat - Active chat/user information
 * @returns {JSX.Element} - UserBlockModal component
 */
const UserBlockModal = ({
    isOpen,
    onClose,
    onConfirm,
    reason,
    setReason,
    activeChat,
}) => {
    const t = useTranslation();
    return (
        <Dialog
            open={isOpen}
            onOpenChange={onClose}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        <h2>{t('areYouSureBlock')}</h2>
                        <div className='text-sm mt-4'>
                            {t('blockUserConfirmation')}
                        </div>
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        {t('blockUserConfirmation')}
                    </DialogDescription>

                    <div className='flex flex-col gap-4 mt-6'>
                        <textarea
                            className="w-full p-2 newBorder primaryBackgroundBg rounded-md focus:outline-none resize-none"
                            placeholder={`${t('reason')} ${t('optional')}`}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                        />
                        <div className='flex justify-end gap-2'>
                            <button
                                className="px-4 py-2 primaryBackground border brandBorder rounded-md"
                                onClick={onClose}
                            >
                                {t('cancel')}
                            </button>
                            <button
                                className="px-4 py-2 primaryBg text-white rounded-md"
                                onClick={() => {
                                    onConfirm(activeChat);
                                    setReason("");
                                    onClose();
                                }}
                            >
                                {t('ok')}
                            </button>
                        </div>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default UserBlockModal