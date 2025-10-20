import { useEffect, useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '../ui/tabs';
import { useTranslation } from '../context/TranslationContext';
import AppointmentTableRow from './AppointmentTableRow';
import CustomPagination from '@/components/ui/custom-pagination';
import { useSelector } from 'react-redux';
import { getAgentAppointmentsApi, getUserAppointmentsApi, updateAppointmentStatusApi } from '@/api/apiRoutes';
import AppointmentActionModal from '../reusable-components/appointment/AppointmentActionModal';
import { getFormattedDate } from '@/utils/helperFunction';
import { useRouter } from 'next/router';

const UserAppointmentBookings = () => {
    const t = useTranslation();
    const router = useRouter()
    const { locale } = router?.query;

    // State management
    const [activeTab, setActiveTab] = useState('upcoming');
    const [offset, setOffset] = useState(0);
    const [appointments, setAppointments] = useState([]);
    const [total, setTotal] = useState(0);
    const [isPageLoading, setIsPageLoading] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
    const [isExpanded, setIsExpanded] = useState(false);

    // Constants
    const limit = 10;

    // Redux state
    const User = useSelector(state => state.User?.data);
    const isAgent = User?.is_agent;


    // Utility functions
    const groupAppointmentsByDate = useCallback((appointments) => {
        const grouped = appointments.reduce((acc, appointment) => {
            const date = appointment.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(appointment);
            return acc;
        }, {});

        // Sort appointments within each date group by start_at time
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => {
                const timeA = new Date(a.start_at).getTime();
                const timeB = new Date(b.start_at).getTime();
                return timeA - timeB;
            });
        });

        return grouped;
    }, []);

    // Get grouped appointments and sort dates
    const groupedAppointments = groupAppointmentsByDate(appointments);
    const sortedDates = Object.keys(groupedAppointments).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB;
    });

    // Page change handler
    const handlePageChange = useCallback((newPage) => {
        setOffset((newPage - 1) * limit);
    }, [limit]);

    // Data fetching functions
    const fetchAppointments = useCallback(async () => {
        setIsPageLoading(true);
        try {
            const apiCall = isAgent ? getAgentAppointmentsApi : getUserAppointmentsApi;
            const res = await apiCall({ offset, limit, date_filter: activeTab });

            if (res?.error === false && res?.data) {
                setAppointments(res.data);
                setTotal(res?.total || 0);
            } else {
                // Handle API error response
                setAppointments([]);
                setTotal(0);
            }
        } catch (error) {
            console.error("Error fetching appointments:", error);
            setAppointments([]);
            setTotal(0);
        } finally {
            setIsPageLoading(false);
        }
    }, [isAgent, offset, limit, activeTab, locale]);
    // Modal handlers
    const handleShowCancelModal = useCallback((appointmentId) => {
        setShowCancelModal(true);
        setSelectedAppointmentId(appointmentId);
    }, []);

    const handleCloseCancelModal = useCallback(() => {
        setShowCancelModal(false);
        setSelectedAppointmentId(null);
    }, []);

    // Appointment action handlers
    const handleCancelAppointment = useCallback(async (reason) => {
        try {
            const response = await updateAppointmentStatusApi({
                appointment_id: selectedAppointmentId,
                status: 'cancelled',
                reason: reason
            });

            if (response?.error === false && response?.data) {
                handleCloseCancelModal();
                fetchAppointments(); // Refresh data after successful cancellation
            }
        } catch (error) {
            console.error("Error cancelling appointment:", error);
        }
    }, [selectedAppointmentId, fetchAppointments, handleCloseCancelModal]);

    const handleAcceptClick = useCallback(async (appointment) => {
        try {
            const response = await updateAppointmentStatusApi({
                appointment_id: appointment.id,
                status: "confirmed"
            });

            if (!response?.error && response?.data) {
                fetchAppointments(); // Refresh data after successful acceptance
            }
        } catch (error) {
            console.error("Error accepting appointment:", error);
        }
    }, [fetchAppointments]);

    const handleShowViewDetails = useCallback((appointment) => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);
    // Effects
    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Render appointment list for a specific tab
    const renderAppointmentList = (tabType) => {
        const emptyMessage = tabType === 'upcoming' ? t("noUpcomingAppointments") : t("noPreviousAppointments");

        return (
            <div className="flex flex-col gap-8">
                {sortedDates.map((date) => {
                    const dateAppointments = groupedAppointments[date];
                    return (
                        <div key={date} className="flex flex-col gap-4">
                            {/* Date Header */}
                            <div className="flex flex-col gap-2 py-4 px-6 primaryBackgroundBg rounded-lg border newBorder">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium brandColor opacity-75">{t("date")}</span>
                                        <span className="brandColor opacity-75">-</span>
                                        <h3 className="text-base font-bold brandColor">{getFormattedDate(date, t)}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Appointments for this date */}
                            <div className="flex flex-col gap-4">
                                {dateAppointments.map((appointment) => (
                                    <AppointmentTableRow
                                        key={appointment.id}
                                        appointment={appointment}
                                        isAgent={isAgent}
                                        onCancel={handleShowCancelModal}
                                        onViewDetails={handleShowViewDetails}
                                        onAccept={handleAcceptClick}
                                        activeTab={activeTab}
                                        refetchData={fetchAppointments}
                                        isRequestedAppointment={true}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {appointments.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="brandColor opacity-75 text-lg">{emptyMessage}</p>
                    </div>
                )}

                {appointments.length > 0 && (
                    <CustomPagination
                        currentPage={Math.floor(offset / limit) + 1}
                        totalItems={total}
                        itemsPerPage={limit}
                        onPageChange={handlePageChange}
                        isLoading={isPageLoading}
                        translations={{
                            showing: t("showing"),
                            to: t("to"),
                            of: t("of"),
                            entries: t("entries")
                        }}
                    />
                )}
            </div>
        );
    };

    return (
        <div className='flex flex-col '>
            {/* Breadcrumb */}
            <div className='pt-2 pb-7 brandColor font-bold text-2xl'>
                {t("myAppointments")}
            </div>

            <div className='flex bg-white h-full px-4'>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full bg-white">
                    <div className="border-b newBorderColor overflow-x-auto">
                        <TabsList className="w-full h-auto bg-transparent p-0 gap-7 rounded-none justify-start">
                            <TabsTrigger
                                value="upcoming"
                                className="p-3 rounded-none border-b-2 border-transparent data-[state=active]:primaryBorderColor data-[state=active]:bg-transparent bg-transparent hover:bg-transparent transition-colors !shadow-none"
                            >
                                <span className={`text-sm sm:text-base font-manrope whitespace-nowrap ${activeTab === 'upcoming'
                                    ? 'font-bold primaryColor'
                                    : 'font-medium brandColor'
                                    }`}>
                                    {t("upcoming")}
                                </span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="previous"
                                className="p-3 rounded-none border-b-2 border-transparent data-[state=active]:primaryBorderColor data-[state=active]:bg-transparent bg-transparent hover:bg-transparent transition-colors !shadow-none"
                            >
                                <span className={`text-sm sm:text-base font-manrope whitespace-nowrap ${activeTab === 'previous'
                                    ? 'font-bold primaryColor'
                                    : 'font-medium brandColor'
                                    }`}>
                                    {t("previous")}
                                </span>
                            </TabsTrigger>
                        </TabsList>

                    </div>
                    <TabsContent value="upcoming">
                        {renderAppointmentList('upcoming')}
                    </TabsContent>
                    <TabsContent value="previous">
                        {renderAppointmentList('previous')}
                    </TabsContent>
                </Tabs>
            </div>
            {showCancelModal && (
                <AppointmentActionModal
                    isOpen={showCancelModal}
                    onClose={handleCloseCancelModal}
                    appointmentId={selectedAppointmentId}
                    actionType="cancel"
                    title="cancelAppointment"
                    warningText="cancelAppointmentWarning"
                    submitButtonText="confirmCancelAppointment"
                    submitButtonColor="bgRed"
                    initialReason=""
                    showWarning={true}
                    isRequired={true}
                    handleSubmit={handleCancelAppointment}
                />
            )}
        </div>
    );
};

export default UserAppointmentBookings;