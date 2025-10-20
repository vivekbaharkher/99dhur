import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from '../context/TranslationContext';

// Dynamically import Chart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const CategoryViewChart = ({ selectedTimeframe = 'weekly', categoryData = null, isLoading = false }) => {
  const t = useTranslation();

  // Show loading skeleton for chart content
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-3 md:p-6">
        {/* Chart Skeleton */}
        <div className="flex justify-center relative mb-4 md:mb-8 w-full">
          <div className="relative w-full max-w-sm md:max-w-lg lg:max-w-xl">
            <div className="w-full h-80 bg-gray-100 rounded-full"></div>
          </div>
        </div>

        {/* Legend Skeleton */}
        <div className="flex items-center justify-center flex-wrap gap-2 md:gap-4 px-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-1 md:gap-2">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-200 rounded-full"></div>
              <div className="h-4 w-16 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Dynamic color generation function
  const generateColors = (count) => {
    const colors = [];
    const hueStep = 360 / count; // Distribute colors evenly across the color wheel

    for (let i = 0; i < count; i++) {
      const hue = (i * hueStep) % 360;
      const saturation = 70 + (i % 3) * 10; // Vary saturation between 70-90%
      const lightness = 50 + (i % 2) * 10; // Vary lightness between 50-60%
      colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }

    return colors;
  };

  // Transform API data to chart format
  const transformApiData = (apiData) => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      return {
        series: [1, 1], // Default data
        labels: [t('testCategoryForList'), t('home')]
      };
    }

    const series = apiData.map(item => item.views || 0);
    const labels = apiData.map(item => item.title || t('unknownCategory'));

    return {
      series,
      labels
    };
  };

  // Get current data based on API response
  const currentData = transformApiData(categoryData);


  // Apex Chart options
  const getChartOptions = (data) => {
    // Generate dynamic colors based on the number of categories
    const dynamicColors = generateColors(data.labels.length);

    return {
      chart: {
        type: 'donut',
        height: 500,
        width: '100%',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 2,
          left: 2,
          blur: 8,
          opacity: 0.15
        },
        responsive: [{
          breakpoint: 1024,
          options: {
            chart: {
              height: 400
            }
          }
        }, {
          breakpoint: 768,
          options: {
            chart: {
              height: 300
            }
          }
        }, {
          breakpoint: 480,
          options: {
            chart: {
              height: 250
            }
          }
        }]
      },
      series: data.series,
      labels: data.labels,
      colors: dynamicColors, // Use dynamically generated colors
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            background: 'transparent',
            labels: {
              show: false
            }
          }
        }
      },
      legend: {
        show: false
      },
      tooltip: {
        enabled: true,
        style: {
          fontSize: '12px'
        }
      },
      stroke: {
        width: 2,
        colors: ['#ffffff']
      },
      dataLabels: {
        enabled: false
      },
      fill: {
        type: 'gradient',
        gradient: {
          type: 'radial', // radial = inside → outside
          shade: 'light',
          shadeIntensity: 2,
          gradientToColors: dynamicColors, // outer ring colors
          inverseColors: false,
          opacityFrom: 0.1,
          opacityTo: 1,
          stops: [0, 100] // 0% white center → 100% category color
        }
      },
      states: {
        hover: {
          filter: {
            type: 'lighten',
            value: 0.05
          }
        }
      }
    };
  };

  // Generate colors for the current data
  const currentColors = generateColors(currentData.labels.length);

  return (
    <div className="flex flex-col items-center justify-center flex-1 p-3 md:p-6">
      {/* Donut Chart */}
      <div className="flex justify-center relative mb-4 md:mb-8 w-full">
        <div className="relative w-full max-w-sm md:max-w-lg lg:max-w-xl">
          {/* Inner white glow effect */}
          <div className="absolute inset-0 rounded-full bg-white opacity-10 blur-md scale-90"></div>
          <div className="relative z-10">
            <Chart
              options={getChartOptions(currentData)}
              series={currentData.series}
              type="donut"
              height={500}
              width="100%"
            />
          </div>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex items-center justify-center flex-wrap gap-2 md:gap-4 px-2">
        {currentData.labels.map((label, index) => (
          <div key={index} className="flex items-center gap-1 md:gap-2">
            <div
              className="w-3 h-3 md:w-4 md:h-4 rounded-full shadow-sm"
              style={{ backgroundColor: currentColors[index] }}
            ></div>
            <span className="text-xs md:text-sm text-gray-700 font-medium max-w-32 md:max-w-none truncate">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryViewChart;
