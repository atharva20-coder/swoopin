'use client'
import { Card, CardContent } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import React from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
} from 'recharts'
import { useAnalytics } from '@/hooks/use-analytics'
import { useParams } from 'next/navigation'
import MetricsCard from './metrics-card'

type Props = {
  hasActivity?: boolean
}

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
}

const Chart = ({ hasActivity = false }: Props) => {
  const params = useParams()
  const { data: analytics, isLoading } = useAnalytics(params.slug as string)

  if (isLoading) {
    return (
      <Card className="border-none p-0 border-opacity-50 rounded-lg mx-0 sm:mx-2 shadow-sm">
        <CardContent className="p-0">
          <ResponsiveContainer height={300} width={'100%'}>
            <AreaChart
              data={Array.from({ length: 7 }, (_, i) => ({
                month: `Day ${i + 1}`,
                desktop: Math.random() * 50 + 25,
              }))}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12
              }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tickFormatter={(value) => value.slice(0, 3)}
                fontSize={12}
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="hsl(var(--muted))"
                fillOpacity={0.4}
                stroke="hsl(var(--muted))"
              />
            </AreaChart>
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
              <AreaChart
                accessibilityLayer
                data={analytics.data.chartData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={6}
                  tickFormatter={(value) => value.slice(0, 3)}
                  fontSize={12}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="desktop"
                  type="natural"
                  fill="var(--color-desktop)"
                  fillOpacity={0.4}
                  stroke="var(--color-desktop)"
                  animationDuration={300}
                />
              </AreaChart>
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