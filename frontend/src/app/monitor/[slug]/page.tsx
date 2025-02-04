"use client";

import React, { useMemo } from "react";
import { format, isWithinInterval, sub } from "date-fns";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import Layout from "@/components/layouts/default";
import Spinner from "@/components/spinner";
import { Site, SiteStatus, StatusPing } from "@/types";
import HeartBeatIndicator from "@/components/heartbeat-indicator";

interface ChartDataPoint {
  time: string;
  responseTime: number;
}

const Monitor = () => {
  const params = useParams<{ slug: string }>();

  const { isPending, data } = useQuery<Site>({
    queryKey: [`site-data-${params.slug}`],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/site/${params.slug}`, {
        credentials:
          process.env.NODE_ENV === "production" ? "same-origin" : "include",
      }).then((res) => res.json()),
  });

  const avgResponseTime = useMemo(() => {
    if (data?.statuses && data.statuses.length > 0) {
      const statuses = data.statuses;
      const responseTimes = statuses.map((status) => status.responseTime);
      return responseTimes.reduce((a, b) => a + b) / statuses.length;
    }

    return 0;
  }, [data]);

  const filterStatusesByTimeRange = (statuses: StatusPing[], days: number) => {
    const now = new Date();
    const lastWeek = sub(now, { days });

    return statuses.filter((status) => {
      const timestamp = new Date(status.time);
      return isWithinInterval(timestamp, {
        start: lastWeek,
        end: now,
      });
    });
  };

  const uptimeWeek = useMemo(() => {
    if (data?.statuses && data.statuses.length > 0) {
      const statuses = filterStatusesByTimeRange(data.statuses, 7);
      // Status is reported as 1 or 0, so it's fairly easy to just
      const heartbeatsUp = statuses.map((status) => status.siteStatus);
      return (heartbeatsUp.reduce((a, b) => a + b) / statuses.length) * 100;
    }

    return 0;
  }, [data]);

  const uptimeMonth = useMemo(() => {
    if (data?.statuses && data.statuses.length > 0) {
      const statuses = filterStatusesByTimeRange(data.statuses, 30);
      // Status is reported as 1 or 0, so it's fairly easy to just
      const heartbeatsUp = statuses.map((status) => status.siteStatus);
      return (heartbeatsUp.reduce((a, b) => a + b) / statuses.length) * 100;
    }

    return 0;
  }, [data]);

  const chartDateForResponseTimes = useMemo<ChartDataPoint[]>(() => {
    if (data?.statuses) {
      const statuses = data.statuses
        .filter((status) => {
          const timestamp = new Date(status.time);
          const now = new Date();
          const yesterday = sub(now, { days: 1 });
          return (
            status.siteStatus === SiteStatus.UP &&
            isWithinInterval(timestamp, { start: yesterday, end: now })
          );
        })
        .map((status) => {
          return {
            time: format(new Date(status.time), "HH:ss"),
            responseTime: status.responseTime,
          };
        });

      return statuses ?? [];
    }

    return [];
  }, [data]);

  if (isPending) {
    return (
      <Layout>
        <div className="text-center m-auto">
          <Spinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-orange-500">
              Monitors
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground">
              {data?.name}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex sm:items-center">
        <div className="flex-auto text-left">
          <div className="flex items-center">
            <div className="flex-initial mr-8">
              {data?.status && <HeartBeatIndicator status={data.status} />}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">{data?.name}</h1>
              <div className="uptime mt-4">
                <p>
                  {data?.status === SiteStatus.UP ? (
                    <span className="text-green-500 mr-2">UP</span>
                  ) : (
                    <span className="text-red-500 mr-2">DOWN</span>
                  )}
                  ⊚
                  <span className="ml-2 mr-2 text-muted-foreground">
                    Checked every {data?.interval !== 1 ? data?.interval : ""}{" "}
                    {data?.interval === 1 ? "minute" : "minutes"}
                  </span>
                  ⊚
                  <span className="ml-2 mr-2 text-muted-foreground">
                    {data?.address}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="statistics flex mt-8 gap-4">
        <StatCard
          title="Avg. response time (24h)"
          value={`${avgResponseTime.toFixed(0)}ms`}
        />
        <StatCard
          title="Uptime (24 hours)"
          value={`${uptimeWeek.toFixed(2)}%`}
        />
        <StatCard
          title="Uptime (30 days)"
          value={`${uptimeMonth.toFixed(2)}%`}
        />
      </div>
      <div className="mt-4">
        <ResponseTimeChart chartData={chartDateForResponseTimes} />
      </div>
    </Layout>
  );
};

const StatCard = ({ title, value }: { title: string; value: string }) => (
  <div className="flex-1">
    <Card className="flex-grow">
      <CardHeader>
        <CardTitle className="text-muted-foreground font-normal">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <h3 className="text-xl font-bold">{value}</h3>
      </CardContent>
    </Card>
  </div>
);

const ResponseTimeChart = ({ chartData }: { chartData: ChartDataPoint[] }) => {
  const chartConfig = {
    responseTime: {
      label: "Time (ms)",
      color: "hsl(var(--primary))",
    },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Response times</CardTitle>
        <CardDescription>
          This chart displays the response time of each request for the past 24
          hours
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
            />
            <YAxis
              tickLine={true}
              axisLine={false}
              tickMargin={8}
              tickCount={4}
              unit=" ms"
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillResponsetime" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="hsl(var(--primary))"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="responseTime"
              type="natural"
              fill="url(#fillResponsetime)"
              fillOpacity={0.4}
              stroke="hsl(var(--primary))"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default Monitor;
