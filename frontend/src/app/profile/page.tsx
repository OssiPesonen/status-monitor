"use client";

import Layout from "@/components/layouts/default";
import Spinner from "@/components/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

interface Profile {
  email: string;
  displayName: string;
}

const Monitor = () => {
  const [formError, setFormError] = useState<string>();

  const { isPending, data: profile } = useQuery<Profile>({
    queryKey: ["user-profile"],
    queryFn: () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        credentials: process.env.NODE_ENV === 'production' ? 'same-origin' : 'include',
      }).then((res) => res.json()),
  });

  if (isPending) {
    return (
      <Layout>
        <div className="text-center flex items-center">
          <Spinner />
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password")?.toString();
    const displayName = formData.get("display_name")?.toString();

    if (!displayName) {
      setFormError("Name is required");
      return;
    }

    const payload: {
      displayName: string;
      password?: string;
      newPassword?: string;
    } = {
      displayName,
      password: undefined,
      newPassword: undefined,
    };

    if (password) {
      const newPassword = formData.get("new_password")?.toString();
      const repeatPassword = formData.get("repeat_password")?.toString();

      if (newPassword !== repeatPassword) {
        setFormError("Passwords do not match");
        return;
      }

      payload.password = password;
      payload.newPassword = newPassword;
    }

    // Todo: Write mutation
  };

  return (
    <Layout>
      <div className="flex sm:items-center mb-8">
        <div className="flex-auto text-left">
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="max-w-[480px]">
        <div className="mb-4">
          <Label className="mb-2 block text-muted-foreground">Email</Label>
          <Input
            name="email"
            id="email"
            disabled
            placeholder="Email"
            defaultValue={profile?.email}
          />
        </div>
        <div className="mb-4">
          <Label
            htmlFor="password"
            className="mb-2 block text-muted-foreground"
          >
            Name
          </Label>
          <Input
            name="display_name"
            id="display_name"
            placeholder="Your name"
            defaultValue={profile?.displayName}
            required
          />
        </div>
        <Separator className="mt-4 mb-4" />
        <h3 className="mt-2 mb-4">Password</h3>
        <p className="mt-2 mb-8 text-sm">
          If you want to change your password, please fill in all the fields
          below.
        </p>
        <div className="mb-4">
          <Label
            className="mb-2 block text-muted-foreground"
            htmlFor="password"
          >
            Current password
          </Label>
          <Input
            type="password"
            name="password"
            id="password"
            placeholder="Current password"
          />
        </div>
        <div className="mb-4">
          <Label className="mb-2 block text-muted-foreground">
            New password
          </Label>
          <Input
            type="password"
            name="new_password"
            id="new_password"
            placeholder="New password"
          />
        </div>
        <div className="mb-4">
          <Label className="mb-2 block text-muted-foreground">
            Repeat new password
          </Label>
          <Input
            type="password"
            name="repeat_password"
            id="repeat_password"
            placeholder="Confirm new password"
          />
        </div>
        {formError && (
          <Alert className="mb-4" variant="destructive">
            <HiOutlineExclamationCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        <Button type="submit">Submit</Button>
      </form>
    </Layout>
  );
};

export default Monitor;
