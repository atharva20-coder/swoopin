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
    color: '#2761D8',
  },
  commentCount: {
    label: 'Comments',
    color: '#2DB78A',
  },
  commentReply: {
    label: 'Replies',
    color: '#105427',
  },
} as const

const Chart = ({ hasActivity = false }: Props) => {
  const params = useParams()
  const { data: analytics, isLoading } = useAnalytics(params.slug as string)

  if (isLoading) {
    return (
      <Card className="border-none p-0 border-opacity-50 rounded-lg mx-0 sm:mx-2 shadow-sm">
        <CardContent className="p-0">
          <ResponsiveContainer height={300} width={'100%'}>
            <BarChart
              data={[
                { date: "2024-07-15", dmCount: 450, commentCount: 300, commentReply: 200 },
                { date: "2024-07-16", dmCount: 380, commentCount: 420, commentReply: 150 },
                { date: "2024-07-17", dmCount: 520, commentCount: 120, commentReply: 300 },
                { date: "2024-07-18", dmCount: 140, commentCount: 550, commentReply: 250 },
                { date: "2024-07-19", dmCount: 600, commentCount: 350, commentReply: 180 },
                { date: "2024-07-20", dmCount: 480, commentCount: 400, commentReply: 220 },
              ]}
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
              />
              <YAxis
                tickLine={true}
                axisLine={true}
                tickMargin={16}
                fontSize={14}
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <Bar
                dataKey="dmCount"
                stackId="stack"
                fill="#2761D8"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
                animationDuration={300}
                minPointSize={3}
              />
              <Bar
                dataKey="commentCount"
                stackId="stack"
                fill="#2DB78A"
                radius={[0, 0, 0, 0]}
                maxBarSize={40}
                animationDuration={300}
                minPointSize={3}
              />
              <Bar
                dataKey="commentReply"
                stackId="stack"
                fill="#105427"
                radius={[0, 0, 4, 4]}
                maxBarSize={40}
                animationDuration={300}
                minPointSize={3}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    )
  }

  if (!analytics?.data?.chartData || analytics.data.chartData.length === 0) {
    return (
      <Card className="border-none p-0 border-opacity-50 rounded-lg mx-0 sm:mx-2 shadow-sm">
        <CardContent className="p-4 sm:p-6 flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
          <p className="text-base sm:text-lg text-gray-500 text-center px-2">
            {hasActivity ? 'No activity data available yet.' : 'We\'re currently gathering your activity!'}
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
                  stackId="stack"
                  radius={[0, 0, 4, 4]}
                  maxBarSize={40}
                  animationDuration={300}
                  fill="#2761D8"
                />
                <Bar
                  dataKey="commentCount"
                  stackId="stack"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={40}
                  animationDuration={300}
                  fill="#2DB78A"
                />
                <Bar
                  dataKey="commentReply"
                  stackId="stack"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                  animationDuration={300}
                  fill="#105427"
                />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <div className="w-full max-w-[1200px] px-2">
        <MetricsCard />
      </div>
    </div>
  )
}

export default Chart