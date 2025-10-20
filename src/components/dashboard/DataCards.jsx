import React from 'react'
import AdvancedDataCard from './AdvancedDataCard'
import { useTranslation } from '../context/TranslationContext';

const DataCards = ({ dashboardData }) => {
  const t = useTranslation()

  // Helper function to transform monthly data to chart format
  const transformMonthlyData = (monthlyData) => {
    if (!monthlyData || !Array.isArray(monthlyData)) {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      };
    }

    const labels = monthlyData.map(item => {
      const date = new Date(item.month_key + '-01');
      return date.toLocaleDateString('en-US', { month: 'short' });
    });

    const values = monthlyData.map(item => item.total_properties || item.total_projects || item.total_views || item.total_appointments || 0);

    return { labels, values };
  };

  // Transform API data to match component structure
  const propertiesData = {
    title: t("properties"),
    mainValue: dashboardData?.properties?.total_properties?.toString() || "0",
    changeValue: dashboardData?.properties?.current_month_property_count?.toString() || "0",
    changeTimeframe: (t("thisMonth")),
    chartData: transformMonthlyData(dashboardData?.properties?.monthly_property_counts)
  };

  const projectsData = {
    title: t("projects"),
    mainValue: dashboardData?.projects?.total_projects?.toString() || "0",
    changeValue: dashboardData?.projects?.current_month_project_count?.toString() || "0",
    changeTimeframe : (t("thisMonth")),
    chartData: transformMonthlyData(dashboardData?.projects?.monthly_project_counts)
  };

  const viewsData = {
    title: t("propertyViews"),
    mainValue: dashboardData?.properties_views?.total_views?.toString() || "0",
    changeValue: dashboardData?.properties_views?.current_month_property_views?.toString() || "0",
    changeTimeframe: (t("thisMonth")),
    chartData: transformMonthlyData(dashboardData?.properties_views?.monthly_property_views)
  };

  const appointmentsData = {
    title: t("appointments"),
    mainValue: dashboardData?.appointments?.current_month_appointment_count?.toString() || "0",
    changeValue: dashboardData?.appointments?.today_appointment_count?.toString() || "0",
    changeTimeframe: (t("today")),
    chartData: transformMonthlyData(dashboardData?.appointments?.monthly_appointment_counts)
  };

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4'>
      <AdvancedDataCard {...propertiesData} />
      <AdvancedDataCard {...projectsData} />
      <AdvancedDataCard {...viewsData} />
      <AdvancedDataCard {...appointmentsData} />
    </div>
  )
}

export default DataCards