import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';
import { useTranslation } from '../context/TranslationContext';

const RecentAppointments = ({
  appointmentData = [],
  selectedTimeframe,
  currentPage = 1,
  onPageChange,
  isLoading = false
}) => {
  const t = useTranslation();
  const itemsPerPage = 5;

  // Get current appointments based on selectedTimeframe
  // If appointmentData is an array, use it directly, otherwise get from timeframe key
  const currentAppointments = Array.isArray(appointmentData) ? appointmentData : appointmentData[selectedTimeframe];
  const totalPages = Math.ceil(currentAppointments?.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageAppointments = currentAppointments?.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (pageNum) => {
    if (onPageChange) {
      onPageChange(pageNum);
    }
  };

  // Show loading skeleton for table content
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-6">
        <div className="flex-1 overflow-hidden overflow-x-auto">
          <div className="w-full">
            {/* Table Header Skeleton */}
            <div className="flex mb-4">
              <div className="flex-1 h-10 bg-gray-200 rounded mr-2"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded mr-2"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded mr-2"></div>
              <div className="flex-1 h-10 bg-gray-200 rounded"></div>
            </div>
            {/* Table Rows Skeleton */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center mb-3 p-3">
                <div className="flex items-center gap-3 w-full">
                  <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-100 rounded mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                  </div>
                  <div className="flex-1 h-4 bg-gray-100 rounded"></div>
                  <div className="flex-1 h-4 bg-gray-100 rounded"></div>
                  <div className="flex-1 h-4 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show no data message if no appointments
  if (!currentAppointments || currentAppointments.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">{t('noDataAvailable')}</p>
          <p className="text-sm">{t('noAppointmentsFound')}</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col p-6">
      <div className="flex-1 overflow-hidden overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className='mb-4'>
              <th className="text-left py-3 px-4 font-medium text-sm first:rounded-l-xl last:rounded-r-xl primaryBackgroundBg">{t('property')}</th>
              <th className="text-left py-3 px-4 font-medium text-sm primaryBackgroundBg">{t('date')}</th>
              <th className="text-left py-3 px-4 font-medium text-sm primaryBackgroundBg">{t('time')}</th>
              <th className="text-left py-3 px-4 font-medium text-sm first:rounded-l-xl last:rounded-r-xl primaryBackgroundBg">{t('meetingType')}</th>
            </tr>
          </thead>
          <tbody>
            {currentPageAppointments?.map((appointment) => {
              const propertyTitle = appointment.property?.translated_title ? appointment.property?.translated_title : appointment.property?.title;
              return (
                <tr key={appointment.id} className="border-b border-gray-100 last:border-none">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 overflow-hidden">
                        <ImageWithPlaceholder
                          src={appointment.property?.title_image}
                          alt={propertyTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">
                          {propertyTitle}
                        </div>
                        <div className="text-gray-500 text-xs truncate">
                          {appointment.agent?.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {appointment.date}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {(() => {
                      // Convert 24-hour format to 12-hour format
                      const formatTime = (timeString) => {
                        const [hours, minutes] = timeString.split(':');
                        const hour = parseInt(hours);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                        return `${displayHour}:${minutes} ${ampm}`;
                      };

                      return `${formatTime(appointment?.start_at)} - ${formatTime(appointment?.end_at)}`;
                    })()}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700 capitalize">
                    {appointment?.meeting_type}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-500">
          {t('showing')} {startIndex + 1} {t('to')} {Math.min(endIndex, currentAppointments?.length)} {t('of')} {currentAppointments?.length} {t('entries')}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronLeft className="w-4 h-4 text-gray-400" />
          </button>

          {/* Show all page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => handlePageClick(pageNum)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${currentPage === pageNum
                ? 'bg-gray-800 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FaChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecentAppointments;
