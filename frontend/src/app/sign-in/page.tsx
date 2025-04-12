"use client";

import AuthLayout from "@/components/layouts/auth";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";

export default function LoginPage() {
	const router = useRouter();
	const toaster = useToast();

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();

		const formData = new FormData(event.currentTarget);
		const email = formData.get("email");
		const password = formData.get("password");

		const response = await fetch(
			`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
			{
				method: "POST",
				credentials:
					process.env.NODE_ENV === "production" ? "same-origin" : "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			},
		);

		if (response.ok) {
			toaster.toast({
				description: "You have successfully signed in",
			});
			router.push("/");
		} else {
			toaster.toast({
				title: "Invalid credentials",
				description: "Wrong username or password",
				variant: "destructive",
			});
		}
	}

	return (
		<AuthLayout>
			<div className="flex flex-col gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-2xl mb-4">Sign in</CardTitle>
						<CardDescription>
							Enter your email below to login to Status Monitor
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleSubmit}>
							<div className="flex flex-col gap-6">
								<div className="grid gap-2">
									<Label htmlFor="email">Email</Label>
									<Input
										id="email"
										type="email"
										name="email"
										placeholder="m@example.com"
										required
									/>
								</div>
								<div className="grid gap-2">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										type="password"
										name="password"
										required
									/>
								</div>
								<Button type="submit" className="w-full">
									Login
								</Button>
							</div>
							<div className="mt-6 pb-2 text-center text-sm text-muted-foreground">
								Don&apos;t have an account?{" "}
								<a href="/signup" className="underline underline-offset-4">
									Sign up
								</a>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
		</AuthLayout>
	);
}
