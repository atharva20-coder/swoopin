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
  Tooltip
} from 'recharts'
import { useAnalytics } from '@/hooks/use-analytics'
import { useParams } from 'next/navigation'
import MetricsCard from './metrics-card'

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
      <Card className="border-none p-0 border-opacity-50 rounded-lg mx-0 sm:mx-2 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-base text-gray-500">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics?.data?.chartData || analytics.data.chartData.length === 0) {
    return (
      <Card className="border-none p-0 border-opacity-50 rounded-lg mx-0 sm:mx-2 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
          <p className="text-base sm:text-lg text-gray-500 text-center px-2">
            No activity data available yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <Card className="border-none p-0 border-opacity-50 rounded-lg mx-0 sm:mx-2 shadow-sm w-full">
        <CardContent className="p-0">
          <ResponsiveContainer height={300} width={'100%'}>
            <ChartContainer config={chartConfig}>
              <BarChart
                data={analytics.data.chartData}
                margin={{
                  left: 24,
                  right: 24,
                  top: 24,
                  bottom: 24
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={true}
                  axisLine={true}
                  tickMargin={16}
                  fontSize={14}
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                  interval={0}
                />
                <YAxis
                  tickLine={true}
                  axisLine={true}
                  tickMargin={16}
                  fontSize={14}
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8' }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      className="w-[180px]"
                      formatter={(value, name, item, index) => (
                        <>
                          <div
                            className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                            style={{ backgroundColor: chartConfig[name as keyof typeof chartConfig]?.color }}
                          />
                          {chartConfig[name as keyof typeof chartConfig]?.label || name}
                          <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                            {value}
                          </div>
                          {index === 2 && (
                            <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                              Total
                              <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium tabular-nums text-foreground">
                                {item.payload.dmCount + item.payload.commentCount + item.payload.commentReply}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    />
                  }
                  cursor={false}
                  defaultIndex={1}
                />
                <Bar
                  dataKey="dmCount"
                  stackId="stack1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                  fill="#2F329F"
                  minPointSize={3}
                />
                <Bar
                  dataKey="commentCount"
                  stackId="stack2"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={35}
                  fill="#4B4EC6"
                  minPointSize={3}
                />
                <Bar
                  dataKey="commentReply"
                  stackId="stack3"
                  radius={[0, 0, 4, 4]}
                  maxBarSize={35}
                  fill="#7273E9"
                  minPointSize={3}
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