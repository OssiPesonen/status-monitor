import { SiteStatus } from "@/types";

const StatusBadge = ({ status }: { status: SiteStatus | undefined }) => {
	return status === SiteStatus.UP ? (
		<Badge color="green">Up</Badge>
	) : (
		<Badge color="red">Down</Badge>
	);
};

interface BadgeProps {
	color: "green" | "red" | "orange" | "gray";
	children?: React.ReactNode;
}

const Badge = ({ color, children }: BadgeProps) => {
	const [bgColor, textColor] = {
		green: ["bg-green-100", "text-green-800"],
		red: ["bg-red-100", "text-red-800"],
		orange: ["bg-orange-100", "text-orange-800"],
		gray: ["bg-gray-100", "text-gray-800"],
	}[color];

	return (
		<span
			className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-sm font-medium uppercase ${bgColor} ${textColor}`}
		>
			{children}
		</span>
	);
};

export default StatusBadge;
