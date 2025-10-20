import React, { useEffect, useState } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { Tabs, TabsContent, TabsTrigger, TabsList } from '../ui/tabs';
import AppointmentTableRow from './AppointmentTableRow';
import NewBreadcrumb from '../breadcrumb/NewBreadCrumb';
import { useTranslation } from '../context/TranslationContext';
import { getUserAppointmentsApi } from '@/api/apiRoutes';
import CustomPagination from '../ui/custom-pagination';
import { getFormattedDate } from '@/utils/helperFunction';

const UserAppointmentRequests = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState('upcoming');
    const limit = 10;
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [isPageLoading, setIsPageLoading] = useState(false);

    const handlePageChange = (newPage) => {
        setOffset((newPage - 1) * limit);
        // Fetch new data based on new offset if needed
    };


    const t = useTranslation();


    const handleFetchAppointmentRequests = async () => {
        try {
            setIsPageLoading(true);
            const res = await getUserAppointmentsApi({ offset, limit, date_filter: activeTab });
            
            // Transform the data to match the expected structure
            const transformedAppointments = res.data?.map(appointment => ({
                ...appointment,
                // Handle admin appointments (requested) vs agent appointments (booked)
                agent: appointment.agent || appointment.admin,
                // Ensure consistent property structure
                property: appointment.property,
                // Handle different meeting type formats
                meeting_type: appointment.meeting_type,
                // Ensure status is consistent
                status: appointment.status,
                // Handle availability types
                availability_types: appointment.availability_types
            })) || [];
            
            setAppointments(transformedAppointments);
            setTotal(res.total);
        } catch (error) {
            console.error("Error fetching appointments:", error);
        } finally {
            setIsPageLoading(false);
        }
    }


    // Function to group appointments by date
    const groupAppointmentsByDate = (appointments) => {
        const grouped = appointments?.reduce((acc, appointment) => {
            const date = appointment.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(appointment);
            return acc;
        }, {});

        // Sort appointments within each date group by start_at time (if available) or meetingTime
        Object.keys(grouped).forEach(date => {
            grouped[date].sort((a, b) => {
                // Use start_at if available, otherwise fallback to meetingTime
                const timeA = new Date(a.start_at).getTime();
                const timeB = new Date(b.start_at).getTime();
                return timeA - timeB;
            });
        });

        return grouped;
    };

    // Get grouped appointments and sort dates
    const groupedAppointments = groupAppointmentsByDate(appointments);
    const sortedDates = Object?.keys(groupedAppointments)?.sort((a, b) => {
        // Parse dates for proper sorting (assuming format "DD MMM YYYY" or similar)
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA - dateB;
    });
    useEffect(() => {
        handleFetchAppointmentRequests();
    }, [activeTab])

    const totalEntries = appointments.length;
    const showingFrom = 1;
    const showingTo = totalEntries;

    return (
        <div className='flex flex-col'>
            {/* Breadcrumb */}
            <div className='pt-2 pb-7 brandColor font-bold text-2xl'>
                {t("myRequestedAppointments")}
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
                        {/* Upcoming appointments will be listed here */}
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
                                                    isAgent={false}
                                                    activeTab={activeTab}
                                                    refetchData={handleFetchAppointmentRequests}
                                                    isRequestedAppointment={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {appointments.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="brandColor opacity-75 text-lg">{t("noUpcomingAppointments")}</p>
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
                    </TabsContent>
                    <TabsContent value="previous">
                        {/* Previous appointments will be listed here */}
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
                                                    <h4 className="text-base font-bold brandColor">{getFormattedDate(date, t)}</h4>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Appointments for this date */}
                                        <div className="flex flex-col gap-4">
                                            {dateAppointments.map((appointment) => (
                                                <AppointmentTableRow
                                                    key={appointment.id}
                                                    appointment={appointment}
                                                    isAgent={false}
                                                    activeTab={activeTab}
                                                    isRequestedAppointment={true}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {appointments.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <p className="brandColor opacity-75 text-lg">{t("noPreviousAppointments")}</p>
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
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default UserAppointmentRequests;