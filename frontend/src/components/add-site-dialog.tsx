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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { siteDataKey } from "./site-list";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useState } from "react";

const AddSiteDialog = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { isPending, mutate: addSiteMutation } = useMutation({
    mutationFn: (payload: {
      address: string;
      name: string;
      interval: number;
      httpMethod?: string;
    }) => {
      return fetch(`http://localhost:5195/sites`, {
        method: "POST",
        body: JSON.stringify({
          address: payload.address,
          name: payload.name,
          interval: payload.interval,
          httpMethod: payload.httpMethod,
        }),
        headers: {
          accept: "application/json",
          "content-type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [siteDataKey] });
      setOpen(false);
    },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const payload = {
      address: formData.get("address")?.toString() ?? "",
      name: formData.get("name")?.toString() ?? "",
      httpMethod: formData.get("http_method")?.toString() ?? null,
      interval:
        formData.get("interval") !== null
          ? parseInt(formData.get("interval")!.toString())
          : 5,
    };

    addSiteMutation(payload);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Site</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-4">Add site</DialogTitle>
          <DialogDescription>
            Set the configurations for a monitorable system or website
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="form-field block mb-4">
            <Label htmlFor="name" className="block mb-2">
              Name
            </Label>
            <Input type="text" id="name" name="name" required />
          </div>
          <div className="form-field block mb-4">
            <Label htmlFor="address" className="block mb-2">
              Address
            </Label>
            <Input
              type="text"
              id="address"
              name="address"
              placeholder="https://"
              required
            />
          </div>
          <div className="form-field block mb-4">
            <Label htmlFor="http_method" className="block mb-2">
              HTTP Method
            </Label>
            <Select name="http_method" defaultValue="GET">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select used HTTP method" />
              </SelectTrigger>
              <SelectContent>
                {["GET", "POST", "HEAD", "PUT", "PATCH", "DELETE"].map(
                  (method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  )
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
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
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

export default AddSiteDialog;
