"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api, Loadout } from "@/lib/api";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

interface EditLoadoutDialogProps {
  loadout: Loadout;
  onSuccess: () => void;
}

export function EditLoadoutDialog({ loadout, onSuccess }: EditLoadoutDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: loadout.name,
    },
  });

  // ダイアログが開いたとき、または対象が変わったときにフォームをリセット
  useEffect(() => {
    if (open) {
      form.reset({ name: loadout.name });
    }
  }, [open, loadout, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // 既存のitemsやtotalWeightは維持しつつ、名前だけ更新
      // (将来的にアイテム編集もここで行うなら payload を拡張する)
      await api.updateLoadout(loadout.id, {
        ...loadout,
        name: values.name,
      });
      
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error("Failed to update loadout", error);
      alert("更新に失敗しました");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Loadout</DialogTitle>
          <DialogDescription>
            Change the name of your loadout.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}