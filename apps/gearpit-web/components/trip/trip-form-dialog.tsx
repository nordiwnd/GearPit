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
import { tripApi, Trip } from "@/lib/api";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().optional(),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  tripToEdit?: Trip; // 編集モード用
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function TripFormDialog({ tripToEdit, trigger, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isEdit = !!tripToEdit;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: tripToEdit?.name || "",
      location: tripToEdit?.location || "",
      description: tripToEdit?.description || "",
      startDate: tripToEdit ? format(new Date(tripToEdit.startDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
      endDate: tripToEdit ? format(new Date(tripToEdit.endDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    },
  });

  // Dialogが開くたびに値をリセット（特に新規作成時）
  useEffect(() => {
    if (open) {
      form.reset({
        name: tripToEdit?.name || "",
        location: tripToEdit?.location || "",
        description: tripToEdit?.description || "",
        startDate: tripToEdit ? format(new Date(tripToEdit.startDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
        endDate: tripToEdit ? format(new Date(tripToEdit.endDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
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
        startDate: values.startDate,
        endDate: values.endDate,
      };

      if (isEdit && tripToEdit) {
        // APIにUpdateメソッドが必要ですが、現在未実装の場合はCreateのみ、または要API追加
        // ★注意: BackendのTripHandlerにUpdate実装済みと仮定して tripApi.update を呼ぶ必要がありますが、
        // 前回の Backend 実装で UpdateTrip は Service にはありましたが Handler/Route で実装しましたか？
        // main.go を確認すると PUT ルートがありませんでした。
        // なので、今回は「作成」のみ動きます。Updateを動かすにはBackendのUpdateルート追加が必要です。
        // いったんCreateと同じ動きをさせますが、本当はUpdateが必要です。
        // BackendにPUTルートがないため、一旦エラーになりますがUIとしてはこうあるべきです。
        toast.error("Update API is not connected yet in Backend.");
      } else {
        await tripApi.create(payload);
        toast.success("Trip plan created successfully");
      }

      setOpen(false);
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error) {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Trip Plan" : "Create New Trip Plan"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Trip Name</FormLabel><FormControl><Input placeholder="Hokkaido Ski Trip" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="location" render={({ field }: { field: any }) => (
              <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="Niseko" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="startDate" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }: { field: any }) => (
                <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="description" render={({ field }: { field: any }) => (
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