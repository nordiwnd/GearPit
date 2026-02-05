"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2, CalendarIcon } from 'lucide-react';
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { tripApi } from "@/lib/api"; 

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess?: () => void;
}

export function TripFormDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      description: "",
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await tripApi.create({
        name: values.name,
        description: values.description || "",
        location: values.location || "",
        startDate: values.startDate,
        endDate: values.endDate,
      });
      
      toast.success("Trip plan created successfully");
      setOpen(false);
      form.reset();
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error("Failed to create trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Trip Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Trip Plan</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Trip Name</FormLabel><FormControl><Input placeholder="Hokkaido Ski Trip" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }) => (
              <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="Niseko" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Details..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Plan
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}