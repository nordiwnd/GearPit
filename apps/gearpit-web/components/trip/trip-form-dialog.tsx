"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { tripApi, profileApi, Trip, UserProfile } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  plannedHikingHours: z.coerce.number().min(0).default(0),
  userProfileId: z.string().optional(),
});

// Explicitly define FormValues to avoid inference issues
interface FormValues {
  name: string;
  location?: string;
  description?: string;
  startDate: string;
  endDate: string;
  plannedHikingHours: number;
  userProfileId?: string;
}

interface Props {
  tripToEdit?: Trip; // 編集モード用
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function TripFormDialog({ tripToEdit, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const router = useRouter();

  const isEdit = !!tripToEdit;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any, // Cast to any to bypass strict compatibility check
    defaultValues: {
      name: tripToEdit?.name || "",
      location: tripToEdit?.location || "",
      description: tripToEdit?.description || "",
      startDate: tripToEdit ? format(new Date(tripToEdit.startDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      endDate: tripToEdit ? format(new Date(tripToEdit.endDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      plannedHikingHours: tripToEdit?.plannedHikingHours || 0,
      userProfileId: tripToEdit?.userProfileId || undefined,
    },
  });

  // Dialogが開くたびに値をリセット
  useEffect(() => {
    if (open) {
      // Load user profiles
      profileApi.list().then(setProfiles).catch(() => toast.error("Failed to load profiles"));

      form.reset({
        name: tripToEdit?.name || "",
        location: tripToEdit?.location || "",
        description: tripToEdit?.description || "",
        startDate: tripToEdit ? format(new Date(tripToEdit.startDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        endDate: tripToEdit ? format(new Date(tripToEdit.endDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        plannedHikingHours: tripToEdit?.plannedHikingHours || 0,
        userProfileId: tripToEdit?.userProfileId || undefined,
      });
    }
  }, [open, tripToEdit, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const payload = {
        name: values.name,
        description: values.description || "",
        location: values.location || "",
        startDate: `${values.startDate}T00:00:00Z`,
        endDate: `${values.endDate}T00:00:00Z`,
        plannedHikingHours: values.plannedHikingHours,
        userProfileId: values.userProfileId,
      };

      if (isEdit && tripToEdit) {
        await tripApi.update(tripToEdit.id, payload);
        toast.success("Trip plan updated successfully");
      } else {
        await tripApi.create(payload);
        toast.success("Trip plan created successfully");
      }

      setOpen(false);
      router.refresh();
      if (onSuccess) onSuccess();
    } catch {
      toast.error("Failed to save trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? trigger : (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Trip Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Trip Plan" : "Create New Trip Plan"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Trip Name</FormLabel><FormControl><Input placeholder="Hokkaido Ski Trip" {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="userProfileId" render={({ field }) => (
              <FormItem>
                <FormLabel>Hiker Profile</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a hiker" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {profiles.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.heightCm}cm/{p.weightKg}kg)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="Niseko" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="plannedHikingHours" render={({ field }) => (
                <FormItem>
                  <FormLabel>Hiking Hours</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.5" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

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
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {isEdit ? "Save Changes" : "Create Plan"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}