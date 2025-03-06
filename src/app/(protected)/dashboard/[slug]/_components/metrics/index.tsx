'use client'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import React from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { useAnalytics } from '@/hooks/use-analytics'
import { useParams } from 'next/navigation'

type Props = {
  hasActivity?: boolean
}

const chartConfig = {
  dmCount: {
    label: 'Messages',
    color: '#2F329F',
  },
  commentCount: {
    label: 'Comments',
    color: '#4B4EC6',
  },
  commentReply: {
    label: 'Replies',
    color: '#7273E9',
  },
} as const

const Chart = ({ hasActivity = false }: Props) => {
  const params = useParams()
  const { data: analytics, isLoading } = useAnalytics(params.slug as string)

  if (isLoading) {
    return (
      <Card className="border-none rounded-xl shadow-sm bg-white">
        <CardContent className="p-6 flex items-center justify-center min-h-[280px]">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-600">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics?.data?.chartData || analytics.data.chartData.length === 0) {
    return (
      <Card className="border-none rounded-xl shadow-sm bg-white">
        <CardContent className="p-6 flex items-center justify-center min-h-[280px]">
          <p className="text-sm text-gray-600 text-center">
            No activity data available yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full">
      <Card className="border-none rounded-xl shadow-sm bg-white">
        <CardContent className="p-4">
          <ResponsiveContainer height={320} width="100%">
            <ChartContainer config={chartConfig}>
              <BarChart
                data={analytics.data.chartData.map((item) => ({
                  ...item,
                  date: new Date(item.date).toLocaleDateString('default', {
                    month: 'short',
                    day: 'numeric',
                  }),
                }))}
                margin={{ top: 20, right: 10, left: 0, bottom: 10 }}
              >
                <CartesianGrid
                  stroke="#e2e8f0"
                  strokeDasharray="5 5"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickMargin={10}
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickMargin={10}
                  fontSize={12}
                  tick={{ fill: '#64748b' }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      className="w-[160px] bg-white shadow-md border border-gray-100 rounded-lg"
                      formatter={(value, name, item, index) => (
                        <>
                          <div
                            className="h-3 w-3 shrink-0 rounded-full"
                            style={{
                              backgroundColor:
                                chartConfig[name as keyof typeof chartConfig]?.color,
                            }}
                          />
                          {chartConfig[name as keyof typeof chartConfig]?.label || name}
                          <div className="ml-auto text-sm font-medium text-gray-900">
                            {value}
                          </div>
                          {index === 2 && (
                            <div className="mt-2 flex items-center border-t border-gray-200 pt-2 text-xs text-gray-700">
                              Total
                              <div className="ml-auto font-medium">
                                {item.payload.dmCount +
                                  item.payload.commentCount +
                                  item.payload.commentReply}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    />
                  }
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                />
                <Bar
                  dataKey="dmCount"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                  fill={chartConfig.dmCount.color}
                  barSize={30}
                  background={{ fill: '#f1f5f9', radius: 6 }}
                  minPointSize={5} // Small bump for zero values
                />
                <Bar
                  dataKey="commentCount"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                  fill={chartConfig.commentCount.color}
                  barSize={30}
                  background={{ fill: '#f1f5f9', radius: 6 }}
                  minPointSize={5} // Small bump for zero values
                />
                <Bar
                  dataKey="commentReply"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={50}
                  fill={chartConfig.commentReply.color}
                  barSize={30}
                  background={{ fill: '#f1f5f9', radius: 6 }}
                  minPointSize={5} // Small bump for zero values
                />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

export default Chart