import React from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '../context/TranslationContext';

// Dynamically import Chart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const MostViewedListings = ({ selectedTimeframe, selectedView, mostViewedData, isLoading = false }) => {
  const t = useTranslation();

  // Show loading skeleton for chart content
  if (isLoading) {
    return (
      <div className="flex-1 p-3 md:p-6">
        <div className="h-80 bg-gray-100 rounded-lg"></div>
      </div>
    );
  }
  // Process API data into chart format
  const processApiData = (apiData) => {
    if (!apiData || !Array.isArray(apiData) || apiData.length === 0) {
      return {
        series: [{ name: t('views'), data: [] }],
        categories: []
      };
    }

    // Sort by views in descending order and take top 8
    const sortedData = apiData
      .sort((a, b) => b.views - a.views)
      .slice(0, 8);

    return {
      series: [{
        name: t('views'),
        data: sortedData.map(item => item.views)
      }],
      categories: sortedData.map(item =>
        item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title
      )
    };
  };

  const currentData = processApiData(mostViewedData);

  if (!currentData.series[0].data.length) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-lg font-medium">{t('noDataAvailable')}</p>
          <p className="text-sm">{t('noListingsFoundForTimeframe')}</p>
        </div>
      </div>
    );
  }

  // Max views to help set tick amount
  const maxViews = Math.max(...currentData.series[0].data);
  // round up nicely
  const roundedMax = maxViews < 100 ? Math.ceil(maxViews / 10) * 10 : Math.ceil(maxViews / 100) * 100;

  const getChartOptions = () => ({
    chart: {
      type: 'bar',
      height: 300,
      toolbar: { show: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      },
      responsive: [{
        breakpoint: 768,
        options: {
          chart: {
            height: 250
          }
        }
      }]
    },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        dataLabels: {
          position: 'top'
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: currentData.categories,
      // let Apex compute nice ticks instead of forcing max
      min: 0,
      max: roundedMax,
      tickAmount: 5, // 👈 ensures evenly spaced ticks, no duplicates
      labels: {
        style: {
          fontSize: '12px',
          colors: '#6B7280'
        },
        showDuplicates: false
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
      yaxis: {
        labels: {
          style: {
            fontSize: '10px',
            colors: '#6B7280'
          },
          maxWidth: 150,
          formatter: function (value) {
            return value.length > 20 ? value.substring(0, 20) + '...' : value;
          }
        }
      },
    grid: {
      xaxis: {
        lines: {
          show: true,
          strokeDashArray: 3
        }
      },
      yaxis: {
        lines: { show: false }
      },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }
    },
    colors: ['#087c7c'],
    tooltip: {
      y: {
        formatter: function (val) {
          return `${val}`;
        }
      },
      style: {
        fontSize: '12px'
      }
    }
  });

  return (
    <div className="flex-1 p-3 md:p-6">
      <Chart
        options={getChartOptions()}
        series={currentData.series}
        type="bar"
        height={300}
        width="100%"
      />
    </div>
  );
};

export default MostViewedListings;
