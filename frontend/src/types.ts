type HttpMethod = "GET" | "POST" | "PUT" | "CONNECT" | "HEAD";

export interface Site {
	id: number;
	address: string;
	name: string;
	interval: number;
	status: SiteStatus;
	httpMethod: HttpMethod;
	statuses?: StatusPing[];
}

export interface StatusPing {
	siteStatus: SiteStatus;
	siteId: number;
	responseTime: number;
	time: string;
}

export enum SiteStatus {
	DOWN = 0,
	UP = 1,
}
