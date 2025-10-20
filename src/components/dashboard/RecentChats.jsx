import React from 'react';
import ImageWithPlaceholder from '../image-with-placeholder/ImageWithPlaceholder';
import { useTranslation } from '../context/TranslationContext';
import CustomLink from '../context/CustomLink';

const RecentChats = ({ chatData = [], isLoading = false }) => {
  const t = useTranslation();
  // Only format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return t('justNow');
    if (diffInHours < 24)
      return `${diffInHours} ${t('hour')}${diffInHours > 1 ? t('s') : ''} ${t('ago')}`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7)
      return `${diffInDays} ${t('day')}${diffInDays > 1 ? t('s') : ''} ${t('ago')}`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} ${t('week')}${diffInWeeks > 1 ? t('s') : ''} ${t('ago')}`;
  };

  // Show loading skeleton for chat content
  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-start gap-4 p-3">
              {/* Avatar Skeleton */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              </div>

              {/* Content Skeleton */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-100 rounded w-full"></div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-3 bg-gray-100 rounded w-12"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show no data message if no chats
  if (!chatData || chatData.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">{t('noDataAvailable')}</p>
          <p className="text-sm">{t('noMessagesFound')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="space-y-4">
        {chatData.map((chat) => {
          // Directly use API fields
          const propertyId = chat.property?.id;
          const otherUser = chat.other_user; // API already gives other user
          const otherUserId = otherUser?.id;

          return (
            <CustomLink
              href={`/user/chat?propertyId=${propertyId}&userId=${otherUserId}`}
              key={chat.id}
              className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden">
                  <ImageWithPlaceholder
                    src={otherUser?.profile}
                    alt={otherUser?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 text-sm mb-1">
                      {otherUser?.name}
                    </div>
                    <div className="text-gray-600 text-sm line-clamp-1">
                      {chat.last_message} {/* API gives last_message */}
                    </div>
                  </div>

                  {/* Timestamp and Unread Badge */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {chat.unread_count > 0 && (
                      <div className="w-5 h-5 primaryBg text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {chat.unread_count}
                      </div>
                    )}
                    <div className="text-xs text-gray-500">
                      {formatTimestamp(chat.last_message_time)} {/* API gives last_message_time */}
                    </div>
                  </div>
                </div>
              </div>
            </CustomLink>
          );
        })}

      </div>
    </div>
  );
};

export default RecentChats;
