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

type Props = {
  hasActivity?: boolean
}

const chartData = [
  { month: 'January', comments: 86, dms: 90 },
  { month: 'February', comments: 50, dms: 45 },
  { month: 'March', comments: 37, dms: 42 },
  { month: 'April', comments: 73, dms: 68 },
  { month: 'May', comments: 29, dms: 35 },
  { month: 'June', comments: 14, dms: 20 },
]

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
}

const Chart = ({ hasActivity = false }: Props) => {
  if (!hasActivity) {
    return (
      <Card className="border-none p-0 border-opacity-50 rounded-sm mx-2 sm:mx-4">
        <CardContent className="p-4 sm:p-6 flex items-center justify-center min-h-[250px] sm:min-h-[300px]">
          <p className="text-base sm:text-lg text-gray-500 text-center px-2">
            We&apos;re currently gathering your activity!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-none p-0 border-opacity-50 rounded-sm mx-2 sm:mx-4">
      <CardContent className="p-0">
        <ResponsiveContainer
          height={250}
          width={'100%'}
        >
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              margin={{
                left: 8,
                right: 8,
                top: 8,
                bottom: 8
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
              />
            </AreaChart>
          </ChartContainer>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default Chart