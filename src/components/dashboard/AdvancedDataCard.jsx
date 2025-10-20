import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { FaPlus } from 'react-icons/fa';
import Image from 'next/image';
import PropertiesIcon from '@/assets/dashboard-icons/propertiesIcon.svg';
import ProjectsIcon from '@/assets/dashboard-icons/projectsIcon.svg';
import PropertyViewsIcon from '@/assets/dashboard-icons/propertyViews.svg';
import AppointmentsIcon from '@/assets/dashboard-icons/appointments.svg';
import { useTranslation } from '../context/TranslationContext';
// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const getIcon = (title) => {
  switch (title) {
    case "Properties":
      return (<Image src={PropertiesIcon.src} alt="Properties" width={24} height={24} />);
    case "Projects":
      return (<Image src={ProjectsIcon.src} alt="Projects" width={24} height={24} />);
    case "Property Views":
      return (<Image src={PropertyViewsIcon.src} alt="Views" width={24} height={24} />);
    case "Appointments":
      return (<Image src={AppointmentsIcon.src} alt="Appointments" width={24} height={24} />);
    default:
      return (<FaPlus size={24} />);
  }
}

const AdvancedDataCard = ({
  title,
  mainValue,
  changeValue,
  changeTimeframe,
  chartData
}) => {
  const t = useTranslation();
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipData, setTooltipData] = useState(null);

  // Ensure we always have data to display
  const safeChartData = chartData || { values: [], labels: [] };
  const chartValues = safeChartData.values && safeChartData.values.length > 0
    ? safeChartData.values
    : Array(12).fill(0); // Default to 12 months with zero values
  const chartLabels = safeChartData.labels && safeChartData.labels.length > 0
    ? safeChartData.labels
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const maxValue = Math.max(...chartValues) || 1; // Ensure we have a minimum max value

  const handleMouseEnter = (index, value, label) => {
    setHoveredBar(index);
    setTooltipData({
      month: label,
      value: value,
      title: title.includes("Property") ? t("propertyViews") : title.split(" ")[0],
    });
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
    setTooltipData(null);
  };

  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header with icon and change indicator */}
      <div className="flex items-start justify-between mb-6">
        {/* Left side - Icon and main content */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 primaryBgLight rounded-xl flex items-center justify-center">
            {/* <FaPlus size={20} className='primaryColor' /> */}
            {getIcon(title)}
          </div>

          {/* Main value and title */}
          <div>
            <div className="text-2xl font-bold text-gray-900">{mainValue}</div>
            <div className="text-sm text-gray-500 font-medium">{title}</div>
          </div>
        </div>

        {/* Change indicator */}
        <div className="text-right">
          <div className="text-white font-semibold bg-black px-3 py-1 rounded-full text-sm inline-block">
            {changeValue}
          </div>
          <div className="text-sm text-gray-500 mt-2">{changeTimeframe}</div>
        </div>
      </div>


      {/* Tooltip - positioned on the hovered bar */}
      {tooltipData && hoveredBar !== null && (
        <div
          className="absolute bg-white border border-gray-200 rounded-lg shadow-lg z-10"
          style={{
            bottom: '6rem', // Position on the bar area
            left: `${(hoveredBar / chartValues.length) * 100}%`,
            transform: 'translateX(-50%)', // Center the tooltip on the bar
            minWidth: '120px'
          }}
        >
          <div className="text-sm font-semibold text-black bg-[#F5F5F4] border-b border-gray-200 p-2 rounded-t-lg">
            {tooltipData?.month}
          </div>
          <div className="flex items-center gap-2 p-2">
            <div className="w-3 h-3 primaryBg rounded-full"></div>
            <span className="text-sm text-gray-600">
              {tooltipData?.title}: {tooltipData?.value}
            </span>
          </div>
        </div>
      )}

      {/* Simple Bar Chart */}
      <div className="flex items-end justify-between gap-1.5 h-20">
        {chartValues.map((value, index) => {
          const height = Math.max((value / maxValue) * 100, 8); // min 8% and reduced overall height
          const isHovered = hoveredBar === index;

          return (
            <div
              key={index}
              className={`flex-1 rounded-md transition-all duration-200 cursor-pointer ${isHovered ? "primaryBg" : "bg-gray-200"
                } ${isHovered ? "ring-2 ring-[#087c7c]/20" : ""}`}
              style={{ height: `${height}%` }}
              onMouseEnter={() =>
                handleMouseEnter(index, value, chartLabels[index])
              }
              onMouseLeave={handleMouseLeave}
            />
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedDataCard;