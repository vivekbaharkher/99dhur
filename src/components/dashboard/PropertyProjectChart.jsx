import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { useTranslation } from '../context/TranslationContext';
import { RiFileList3Fill } from 'react-icons/ri';
import Image from 'next/image';
import { getMonthFromNumber } from '@/utils/appointmentHelper';
import availablePropertiesIcon from '../../assets/dashboard-icons/availableProperties.svg'
import soldIcon from '../../assets/dashboard-icons/soldIcon.svg'
import rentPropertiesIcon from '../../assets/dashboard-icons/rentPropertiesIcon.svg'
import availableProjectsIcon from '../../assets/dashboard-icons/availableProjectsIcon.svg'
import underConstructionIcon from '../../assets/dashboard-icons/underConstructionIcon.svg'
import upcomingProjectsIcon from '../../assets/dashboard-icons/upcomingProjectsIcon.svg'
// Register Chart.js components
Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const PropertyProjectChart = ({ selectedTimeframe = 'weekly', selectedType = 'property', listingsData = null, isLoading = false }) => {

    const t = useTranslation()
    // Show loading skeleton for chart content
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 bg-white rounded-2xl">
                {/* Left Section - Data Cards Skeleton */}
                <div className="xl:col-span-1 space-y-4 border-r p-5">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="shadow-sm border border-gray-100 rounded-[8px] p-4">
                            <div className="flex flex-col justify-center items-center gap-2">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                                <div className='flex flex-col justify-center items-center gap-2'>
                                    <div className="h-8 w-16 bg-gray-200 rounded"></div>
                                    <div className="h-4 w-20 bg-gray-100 rounded"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Section - Chart Skeleton */}
                <div className="xl:col-span-3">
                    <div className="h-full p-2">
                        <div className="h-80 bg-gray-100 rounded-lg"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Generate last 30 days labels dynamically
    const generateLast30DaysLabels = () => {
        const labels = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const day = date.getDate();
            const monthNumber = date.getMonth() + 1;
            const month = getMonthFromNumber(monthNumber, t).substring(0, 3); // Get first 3 chars
            labels.push(`${day} ${month}`);
        }

        return labels;
    };

    // Generate this week labels dynamically (last 7 days)
    const generateThisWeekLabels = () => {
        const labels = [];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const day = date.getDate();
            const monthNumber = date.getMonth() + 1;
            const month = getMonthFromNumber(monthNumber, t).substring(0, 3); // Get first 3 chars
            labels.push(`${day} ${month}`);
        }

        return labels;
    };

    // Generate this year labels dynamically (last 12 months from current month)
    const generateThisYearLabels = () => {
        const labels = [];
        const today = new Date();

        for (let i = 11; i >= 0; i--) {
            const date = new Date(today);
            date.setMonth(today.getMonth() - i);
            const monthNumber = date.getMonth() + 1;
            const month = getMonthFromNumber(monthNumber, t).substring(0, 3); // Get first 3 chars
            const year = date.getFullYear();
            // Show month and year for better clarity
            labels.push(`${month} ${year}`);
        }

        return labels;
    };

    // Transform API data to chart format for properties
    const transformPropertyApiData = (apiData, timeframe) => {
        if (!apiData || !apiData.range_wise) {
            return {
                labels: timeframe === 'weekly' ? generateThisWeekLabels() :
                    timeframe === 'monthly' ? generateLast30DaysLabels() :
                        generateThisYearLabels(),
                datasets: [
                    {
                        label: t("totalProperties"),
                        data: timeframe === 'yearly' ? Array(12).fill(0) : Array(7).fill(0),
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#3B82F6',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: t("rentProperties"),
                        data: timeframe === 'yearly' ? Array(12).fill(0) : Array(7).fill(0),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#10B981',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: t("saleProperties"),
                        data: timeframe === 'yearly' ? Array(12).fill(0) : Array(7).fill(0),
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#F59E0B',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            };
        }

        const labels = apiData.range_wise.map(item => {
            // Handle different API response structures
            if (item.date) {
                // For weekly/monthly data (has date field)
                const date = new Date(item.date);
                const day = date.getDate();
                const monthNumber = date.getMonth() + 1;
                const month = getMonthFromNumber(monthNumber, t).substring(0, 3); // Get first 3 chars
                return `${day} ${month}`;
            } else if (item.month) {
                // For yearly data (has month field like "January 2025")
                const monthParts = item.month.split(' ');
                const monthName = monthParts[0];
                const year = monthParts[1];
                // Find the month number from the month name and get translated short name
                const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
                if (monthIndex !== -1) {
                    const translatedMonth = getMonthFromNumber(monthIndex + 1, t).substring(0, 3);
                    return `${translatedMonth} ${year}`;
                }
                return `${monthName.substring(0, 3)} ${year}`; // Fallback to original
            }
            return 'Invalid';
        });

        const totalData = apiData.range_wise.map(item => item.total_properties || 0);
        const rentData = apiData.range_wise.map(item => item.rent_properties || 0);
        const sellData = apiData.range_wise.map(item => item.sell_properties || 0);

        return {
            labels,
            datasets: [
                {
                    label: t("totalProperties"),
                    data: totalData,
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3B82F6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: t("rentProperties"),
                    data: rentData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: t("saleProperties"),
                    data: sellData,
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#F59E0B',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        };
    };

    // Transform API data to chart format for projects
    const transformProjectApiData = (apiData, timeframe) => {
        if (!apiData || !apiData.range_wise) {
            return {
                labels: timeframe === 'weekly' ? generateThisWeekLabels() :
                    timeframe === 'monthly' ? generateLast30DaysLabels() :
                        generateThisYearLabels(),
                datasets: [
                    {
                        label: t("totalProjects"),
                        data: timeframe === 'yearly' ? Array(12).fill(0) : Array(7).fill(0),
                        borderColor: '#8B5CF6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#8B5CF6',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: t("underConstruction"),
                        data: timeframe === 'yearly' ? Array(12).fill(0) : Array(7).fill(0),
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#F59E0B',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                    {
                        label: t("upcoming"),
                        data: timeframe === 'yearly' ? Array(12).fill(0) : Array(7).fill(0),
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4,
                        pointBackgroundColor: '#10B981',
                        pointBorderColor: '#ffffff',
                        pointBorderWidth: 2,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                    },
                ],
            };
        }

        const labels = apiData.range_wise.map(item => {
            // Handle different API response structures
            if (item.date) {
                // For weekly/monthly data (has date field)
                const date = new Date(item.date);
                const day = date.getDate();
                const monthNumber = date.getMonth() + 1;
                const month = getMonthFromNumber(monthNumber, t).substring(0, 3); // Get first 3 chars
                return `${day} ${month}`;
            } else if (item.month) {
                // For yearly data (has month field like "January 2025")
                const monthParts = item.month.split(' ');
                const monthName = monthParts[0];
                const year = monthParts[1];
                // Find the month number from the month name and get translated short name
                const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'].indexOf(monthName);
                if (monthIndex !== -1) {
                    const translatedMonth = getMonthFromNumber(monthIndex + 1, t).substring(0, 3);
                    return `${translatedMonth} ${year}`;
                }
                return `${monthName.substring(0, 3)} ${year}`; // Fallback to original
            }
            return 'Invalid';
        });

        // For projects, use the correct API field names
        const totalData = apiData.range_wise.map(item => item.total_projects || 0);
        const underConstructionData = apiData.range_wise.map(item => item.under_construction_projects || 0);
        const upcomingData = apiData.range_wise.map(item => item.upcoming_projects || 0);

        return {
            labels,
            datasets: [
                {
                    label: t("totalProjects"),
                    data: totalData,
                    borderColor: '#8B5CF6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#8B5CF6',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: t("underConstruction"),
                    data: underConstructionData,
                    borderColor: '#F59E0B',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#F59E0B',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
                {
                    label: t("upcoming"),
                    data: upcomingData,
                    borderColor: '#10B981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10B981',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        };
    };

    // Property data for different timeframes
    const propertyData = {
        'weekly': transformPropertyApiData(listingsData, 'weekly'),
        'monthly': transformPropertyApiData(listingsData, 'monthly'),
        'yearly': transformPropertyApiData(listingsData, 'yearly'),
    };

    // Project data for different timeframes
    const projectData = {
        'weekly': transformProjectApiData(listingsData, 'weekly'),
        'monthly': transformProjectApiData(listingsData, 'monthly'),
        'yearly': transformProjectApiData(listingsData, 'yearly'),
    };

    // Property data cards using API data
    const propertyCards = [
        {
            icon: <Image width={24} height={24} src={availablePropertiesIcon.src} alt="Available Properties" />,
            value: listingsData?.overall?.total_properties?.toString() || "0",
            label: t("totalProperties"),
            color: "bg-[#2B7FFF]",
            iconColor: "text-blue-500"
        },
        {
            icon: <Image width={24} height={24} src={rentPropertiesIcon.src} alt="Rent Properties" />,
            value: listingsData?.overall?.rent_properties?.toString() || "0",
            label: t("rentProperties"),
            color: "bg-[#00BC7D]",
            iconColor: "text-green-500"
        },
        {
            icon: <Image width={24} height={24} src={soldIcon.src} alt="Sold Properties" />,
            value: listingsData?.overall?.sell_properties?.toString() || "0",
            label: t("saleProperties"),
            color: "bg-[#FE9A00]",
            iconColor: "text-orange-500"
        }
    ];

    // Project data cards using API data
    const projectCards = [
        {
            icon: <Image width={24} height={24} src={availableProjectsIcon.src} alt="Available Projects" />,
            value: listingsData?.overall?.total_projects?.toString() || "0",
            label: t("totalProjects"),
            color: "bg-purple-500",
            iconColor: "text-purple-500"
        },
        {
            icon: <Image width={24} height={24} src={underConstructionIcon.src} alt="Under Construction Projects" />,
            value: listingsData?.overall?.under_construction_projects?.toString() || "0",
            label: t("underConstruction"),
            color: "bg-orange-500",
            iconColor: "text-orange-500"
        },
        {
            icon: <Image width={24} height={24} src={upcomingProjectsIcon.src} alt="Upcoming Projects" />,
            value: listingsData?.overall?.upcoming_projects?.toString() || "0",
            label: t("upcoming"),
            color: "bg-green-500",
            iconColor: "text-green-500"
        }
    ];

    // Calculate dynamic Y-axis scale based on current data
    const getDynamicYAxisScale = (data) => {
        if (!data || !data.datasets) return { min: 0, max: 10, stepSize: 1 };

        // Find the maximum value across all datasets
        let maxValue = 0;
        data.datasets.forEach(dataset => {
            if (dataset.data && Array.isArray(dataset.data)) {
                const datasetMax = Math.max(...dataset.data);
                maxValue = Math.max(maxValue, datasetMax);
            }
        });

        // Add some padding (20% of max value, minimum 1)
        const padding = Math.max(1, Math.ceil(maxValue * 0.2));
        const dynamicMax = maxValue + padding;

        // Calculate appropriate step size
        let stepSize = 1;
        if (dynamicMax <= 5) {
            stepSize = 1;
        } else if (dynamicMax <= 10) {
            stepSize = 2;
        } else if (dynamicMax <= 20) {
            stepSize = 5;
        } else if (dynamicMax <= 50) {
            stepSize = 10;
        } else {
            stepSize = Math.ceil(dynamicMax / 10);
        }

        return {
            min: 0,
            max: dynamicMax,
            stepSize: stepSize
        };
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false, // We'll create custom legend
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#1F2937',
                bodyColor: '#6B7280',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: function (context) {
                        return context[0].label;
                    },
                    label: function (context) {
                        return `${context.dataset.label}: ${context.parsed.y}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: '#6B7280',
                    font: {
                        size: 12,
                    },
                },
            },
            y: {
                grid: {
                    color: '#E5E7EB',
                    borderDash: [5, 5],
                },
                ticks: {
                    color: '#6B7280',
                    font: {
                        size: 12,
                    },
                },
                min: 0,
                // Dynamic max and stepSize will be set below
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
        elements: {
            point: {
                hoverRadius: 6,
                radius: selectedTimeframe === 'monthly' ? 2 : 4, // Smaller points for month view
            },
        },
    };

    const currentData = selectedType === 'property'
        ? propertyData[selectedTimeframe]
        : projectData[selectedTimeframe];
    const currentCards = selectedType === 'property' ? propertyCards : projectCards;
    const currentLegend = selectedType === 'property'
        ? [
            { color: 'bg-blue-500', label: t('totalProperties') },
            { color: 'bg-green-500', label: t('rentProperties') },
            { color: 'bg-orange-500', label: t('saleProperties') }
        ]
        : [
            { color: 'bg-purple-500', label: t('totalProjects') },
            { color: 'bg-orange-500', label: t('underConstruction') },
            { color: 'bg-green-500', label: t('upcoming') }
        ];

    // Apply dynamic Y-axis scale to chart options
    const dynamicYScale = getDynamicYAxisScale(currentData);
    chartOptions.scales.y.max = dynamicYScale.max;
    chartOptions.scales.y.ticks.stepSize = dynamicYScale.stepSize;

    return (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 bg-white rounded-2xl ">
            {/* Left Section - Data Cards */}
            <div className="xl:col-span-1 space-y-4  border-r p-5">
                {currentCards.map((card, index) => (
                    <div key={index} className="shadow-sm border border-gray-100 rounded-[8px] p-4">
                        <div className="flex flex-col justify-center items-center gap-2">
                            <div className={`w-14 h-14 ${card.color} rounded-xl flex items-center justify-center relative overflow-hidden`}>
                                {/* Left half with white overlay */}
                                <div className="absolute left-0 top-0 w-1/2 h-full bg-white/20 bg-opacity-50 z-10"></div>
                                {/* Icon */}
                                <div className="relative z-20">
                                    {card.icon}
                                </div>
                            </div>
                            <div className='flex flex-col justify-center items-center gap-2'>
                                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                                <div className="text-sm text-gray-500 font-medium">{card.label}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Right Section - Chart */}
            <div className="xl:col-span-3">
                {/* Chart */}
                <div className="h-full p-2">
                    <Line data={currentData} options={chartOptions} />
                </div>

            </div>
        </div>
    );
};

export default PropertyProjectChart;
