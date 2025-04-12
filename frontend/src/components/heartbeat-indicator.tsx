import { SiteStatus } from "@/types";

const HeartBeatIndicator = ({
	status,
	size,
}: { status: SiteStatus; size?: "small" | "default" }) => (
	<div className="flex justify-center items-center">
		<div
			className={`${size === "small" ? "h-2 w-2" : "h-4 w-4"} pulse-${size} bg-green-500 rounded-full flex justify-center items-center ${
				status === SiteStatus.UP
					? "animation-pulse-good"
					: "animation-pulse-alert"
			}`}
		/>
	</div>
);

export default HeartBeatIndicator;
