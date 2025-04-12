"use client";

import AuthLayout from "@/components/layouts/auth";
import Spinner from "@/components/spinner";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
	const toast = useToast();
	const router = useRouter();

	useEffect(() => {
		// Simply call logout and wait for it to complete at some point
		logout();
	}, []);

	async function logout() {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`,
			{
				method: "POST",
				credentials:
					process.env.NODE_ENV === "production" ? "same-origin" : "include",
				headers: { "Content-Type": "application/json" },
			},
		);

		if (response.ok) {
			toast.toast({
				title: "Signed out",
				description: "You've successfully logged out.",
			});
			router.push("/sign-in");
		} else {
			toast.toast({
				title: "Something went wrong",
				description:
					"We are not able to sign you out at this time. If you still wish to be signed out clear your browser's cache and cookies.",
				variant: "destructive",
			});
			router.push("/");
		}
	}

	return (
		<AuthLayout>
			<Spinner />
		</AuthLayout>
	);
}
