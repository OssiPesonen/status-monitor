export interface Site {
  id: number;
  address: string;
  name: string;
  interval: number;
  status: SiteStatus;
  statuses?: StatusPing[]
}

export interface StatusPing {
  siteStatus: SiteStatus,
  siteId: number,
  responseTime: number;
  time: string,
}

export enum SiteStatus {
  DOWN = 0,
  UP = 1,
}
