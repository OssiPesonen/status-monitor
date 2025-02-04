"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Spinner from "./spinner";
import AddSiteDialog from "./add-site-dialog";
import { Site, SiteStatus, StatusPing } from "@/types";
import Link from "next/link";
import HeartBeatIndicator from "./heartbeat-indicator";

export const siteDataKey = "site-data";
export const statusDataKey = "statuses-data";

const SiteList = () => {
  const queryClient = useQueryClient();

  const { isPending, data: sites } = useQuery<Site[]>({
    queryKey: [siteDataKey],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/sites`, {
        credentials:
          process.env.NODE_ENV === "production" ? "same-origin" : "include",
      }).then((res) => res.json()),
  });

  const { data: statuses } = useQuery<StatusPing[]>({
    queryKey: [statusDataKey],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/statuses`, {
        credentials:
          process.env.NODE_ENV === "production" ? "same-origin" : "include",
      }).then((res) => res.json()),
  });

  const deleteSiteMutation = useMutation({
    mutationFn: (siteId: number) => {
      return fetch(`${process.env.NEXT_PUBLIC_API_URL}/site/${siteId}`, {
        method: "DELETE",
        credentials:
          process.env.NODE_ENV === "production" ? "same-origin" : "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [siteDataKey] });
    },
  });

  const groupedStatuses = useMemo(() => {
    if (statuses && sites) {
      sites.map((site) => {
        site.statuses = statuses.filter((status) => status.siteId === site.id);
      });
    } else {
      return [];
    }

    return sites;
  }, [statuses, sites]);

  if (isPending) {
    return <Spinner />;
  }

  const formatTime = (time: string) => {
    const date = new Date(time);
    const format = new Intl.DateTimeFormat("fi-FI", {
      dateStyle: "long",
      timeStyle: "short",
    });
    return format.format(date);
  };

  return (
    <>
      <div className="flex sm:items-center">
        <div className="flex-auto text-left">
          <h1 className="text-xl font-semibold">Monitored systems</h1>
        </div>
        <div className="flex-auto text-right">
          <AddSiteDialog />
        </div>
      </div>
      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-md">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-950">
                  <TableRow>
                    <TableHead scope="col">Name</TableHead>
                    <TableHead scope="col" className="text-left">
                      Heartbeat
                    </TableHead>
                    <TableHead scope="col">
                      <span className="sr-only"></span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedStatuses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3}>
                        Nothing to monitor yet. Add a website to see it here.
                      </TableCell>
                    </TableRow>
                  )}
                  {groupedStatuses.map((site: Site) => {
                    return (
                      <TableRow key={site.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="ml-2 mr-2">
                              <HeartBeatIndicator
                                status={site.status}
                                size="small"
                              />
                            </span>
                            <Link
                              href={`/monitor/${site.id}`}
                              className="text-orange-500"
                            >
                              {site.name}
                            </Link>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 m-auto justify-start">
                            {site.statuses?.slice(0, 12).map((status, i) => (
                              <div
                                className="has-tooltip relative"
                                key={`status-${status}-${i}`}
                              >
                                <div className="absolute tooltip -top-[32px] h-[32px] hidden TableRowansition-opacity bg-gray-900 text-white shadow-sm text-sm w-max p-1 border-2 border-gray-200 z-10 rounded-md">
                                  {formatTime(status.time)}
                                </div>
                                {status.siteStatus === SiteStatus.UP ? (
                                  <div className="h-8 w-2 rounded-xl bg-green-400 block"></div>
                                ) : (
                                  <div className="h-8 w-2 rounded-xl bg-red-400 block"></div>
                                )}
                              </div>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <HiOutlineDotsHorizontal />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() =>
                                  deleteSiteMutation.mutate(site.id)
                                }
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SiteList;
