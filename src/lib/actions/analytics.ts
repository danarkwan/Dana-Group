'use server'

import { getRevenueChartData, getExpenseCategoriesData } from '../services/analytics'

export async function fetchRevenueChartData(period: '7d' | '30d' | '12m' | 'all' | 'custom' = '30d', customStart?: Date, customEnd?: Date) {
  return await getRevenueChartData(period, customStart, customEnd);
}

export async function fetchExpenseCategoriesData(period: '7d' | '30d' | '12m' | 'all' | 'custom' = '30d', customStart?: Date, customEnd?: Date) {
  return await getExpenseCategoriesData(period, customStart, customEnd);
}
