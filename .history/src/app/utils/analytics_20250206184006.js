// utils/analytics.js
export const getDateRangeFilter = (timeRange) => {
  const now = new Date();
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = new Date(now.setDate(now.getDate() - days));
  return startDate.toISOString();
};
