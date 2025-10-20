import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FaArrowRight } from 'react-icons/fa';
import { useTranslation } from '../context/TranslationContext';
import Link from 'next/link';
import CustomLink from '../context/CustomLink';

const DashboardCard = ({
  title,
  filterOptions = [],
  selectedFilter,
  onFilterChange,
  tabs = [],
  selectedTab,
  onTabChange,
  children,
  className = "",
  showFilter = true,
  showTabs = false,
  showActions = false
}) => {
  const t = useTranslation();
  
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row flex-wrap sm:items-center justify-between p-4 md:p-6 border-b border-gray-100 gap-3 sm:gap-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">{title}</h2>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Filter Selector */}
          {showFilter && filterOptions.length > 0 && (
            <Select value={selectedFilter} onValueChange={onFilterChange}>
              <SelectTrigger className="w-full sm:w-40 bg-gray-100 hover:bg-gray-200 border-gray-200">
                <SelectValue placeholder={t('selectFilter')}>
                  {selectedFilter ? filterOptions.find(option => option.value === selectedFilter)?.label || selectedFilter : t('selectFilter')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Tabs */}
          {showTabs && tabs.length > 0 && (
            <div className="flex border rounded-lg p-1 w-full sm:w-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => onTabChange(tab.value)}
                  className={`flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none ${selectedTab === tab.value
                      ? 'bg-black text-white shadow-sm'
                      : ''
                    }`}
                >
                  {tab.icon && <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />}
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Right Section - Actions */}
          {showActions && (
            <CustomLink href={'/user/chat'} className='flex items-center justify-center gap-2 border border-black rounded-lg py-2 px-3 sm:px-4 text-sm sm:text-base font-medium w-full sm:w-auto'>
              <span className="hidden sm:inline">{t('viewAllMessages')}</span>
              <span className="sm:hidden">{t('viewAll')}</span>
              <FaArrowRight size={16} className="sm:w-5 sm:h-5" />
            </CustomLink>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;
