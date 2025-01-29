"use client";

import Layout from "@/components/layouts/default";
import Spinner from "@/components/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";

interface Profile {
  email: string;
  displayName: string;
}

const Monitor = () => {
  const { isPending, data: profile } = useQuery<Profile>({
    queryKey: ["user-profile"],
    queryFn: () =>
      fetch("http://localhost:5195/user/profile", {
        credentials: "include",
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

  return (
    <Layout>
      <div className="flex sm:items-center mb-8">
        <div className="flex-auto text-left">
          <h1 className="text-xl font-semibold">Profile</h1>
        </div>
      </div>
      <div className="mb-4 max-w-[320px]">
        <Label className="mb-2 block text-muted-foreground">Email</Label>
        <Input
          name="email"
          id="email"
          placeholder="Email"
          readOnly
          defaultValue={profile?.email}
        />
      </div>
      <div className="mb-4 max-w-[320px]">
        <Label className="mb-2 block text-muted-foreground">Name</Label>
        <Input
          name="display_name"
          id="display_name"
          placeholder="Your name"
          readOnly
          defaultValue={profile?.displayName}
        />
      </div>
    </Layout>
  );
};

export default Monitor;
