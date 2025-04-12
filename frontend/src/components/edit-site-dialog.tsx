import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Site } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Spinner from "./spinner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { siteDataKey } from "./site-list";

interface EditSiteDialogParams {
	site: Site;
	open: boolean;
	handleOpenChange: (open: boolean) => void;
	invalidateQueryKeys?: string[];
}

const EditSiteDialog = ({ site, open, handleOpenChange, invalidateQueryKeys }: EditSiteDialogParams) => {
	const queryClient = useQueryClient();
	const [httpMethod, setHttpMethod] = useState("GET");

	useEffect(() => {
		if (site) {
			setHttpMethod(site.httpMethod);
		}
	}, [site]);

	const { isPending, mutate: addSiteMutation } = useMutation({
		mutationFn: (payload: {
			address: string;
			name: string;
			interval: number;
			httpMethod?: string;
		}) => {
			return fetch(`${process.env.NEXT_PUBLIC_API_URL}/site/${site.id}`, {
				method: "PUT",
				body: JSON.stringify({
					address: payload.address,
					name: payload.name,
					interval: payload.interval,
					httpMethod: payload.httpMethod,
				}),
				credentials: "include",
				headers: {
					accept: "application/json",
					"content-type": "application/json",
				},
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: invalidateQueryKeys });
			handleOpenChange(false);
		},
	});

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const interval = formData.get("interval")
			? Number.parseInt(formData.get("interval") as string)
			: 5;

		const payload = {
			address: formData.get("address")?.toString() ?? "",
			name: formData.get("name")?.toString() ?? "",
			httpMethod: formData.get("http_method")?.toString() ?? undefined,
			interval: interval,
		};

		addSiteMutation(payload);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="mb-4">Edit site</DialogTitle>
					<DialogDescription>
						Edit the configurations for a monitorable system or website
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={onSubmit}>
					<div className="form-field block mb-4">
						<Label htmlFor="name" className="block mb-2">
							Name
						</Label>
						<Input
							type="text"
							id="name"
							name="name"
							defaultValue={site?.name}
							required
						/>
					</div>
					<div className="form-field block mb-4">
						<Label htmlFor="address" className="block mb-2">
							Address
						</Label>
						<Input
							type="text"
							id="address"
							name="address"
							defaultValue={site?.address}
							placeholder="https://"
							required
						/>
					</div>
					<div className="form-field block mb-4">
						<Label htmlFor="http_method" className="block mb-2">
							HTTP Method
						</Label>
						<Select name="http_method" defaultValue="GET" value={httpMethod}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select used HTTP method" />
							</SelectTrigger>
							<SelectContent>
								{["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"].map(
									(method) => (
										<SelectItem key={method} value={method}>
											{method}
										</SelectItem>
									),
								)}
							</SelectContent>
						</Select>
					</div>
					<div className="form-field block mb-4">
						<Label htmlFor="interval" className="block mb-2">
							Update interval
						</Label>
						<Select name="interval" defaultValue="15">
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Select update interval" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="1">Every minute</SelectItem>
								<SelectItem value="5">Every 5 minutes</SelectItem>
								<SelectItem value="15">Every 15 minutes</SelectItem>
								<SelectItem value="30">Every 30 minutes</SelectItem>
								<SelectItem value="60">Every hour</SelectItem>
								<SelectItem value="120">Every two hours</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<DialogFooter className="mt-4">
						<Button type="submit" className="bg-primary" disabled={isPending}>
							Save
							{isPending && (
								<svg
									className="animate-spin h-5 w-5 text-white ml-2"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<title>Loading...</title>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
							)}
						</Button>
						<DialogClose asChild>
							<Button type="button" variant="outline" disabled={isPending}>
								Cancel
							</Button>
						</DialogClose>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default EditSiteDialog;
