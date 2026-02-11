"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Wrench, Calendar, DollarSign, Trash2 } from "lucide-react";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { maintenanceApi, MaintenanceLog, GearItem } from "@/lib/api";

const formSchema = z.object({
  performedAt: z.string().min(1, "Date is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  cost: z.coerce.number().min(0),
});

interface Props {
  item: GearItem;
}

export function MaintenanceDialog({ item }: Props) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      performedAt: format(new Date(), "yyyy-MM-dd"),
      type: "cleaning",
      description: "",
      cost: 0,
    },
  });

  const fetchLogs = async () => {
    try {
      const data = await maintenanceApi.getItemLogs(item.id);
      setLogs(data || []);
    } catch (error) {
      toast.error("Failed to load maintenance logs");
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open, item.id]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await maintenanceApi.addLog({
        itemId: item.id,
        ...values,
      });
      toast.success("Log added");
      form.reset({
        performedAt: format(new Date(), "yyyy-MM-dd"),
        type: "cleaning",
        description: "",
        cost: 0,
      });
      fetchLogs();
    } catch (error) {
      toast.error("Failed to add log");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await maintenanceApi.deleteLog(id);
      toast.success("Log deleted");
      fetchLogs();
    } catch (error) {
      toast.error("Failed to delete log");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-blue-500">
          <Wrench className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Maintenance Log: {item.name}</DialogTitle>
          <DialogDescription>
            Track maintenance, repairs, and inspections for this item.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6 h-full overflow-hidden">
          {/* Left: Form */}
          <div className="w-1/3 border-r pr-6">
            <h3 className="font-semibold mb-4 text-sm">Add New Log</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <FormField
                  control={form.control}
                  name="performedAt"
                  // 修正: 型を明示的に指定
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  // 修正: 型を明示的に指定
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cleaning">Cleaning</SelectItem>
                          <SelectItem value="repair">Repair</SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                          <SelectItem value="modification">Modification</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="cost"
                  // 修正: 型を明示的に指定
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Cost</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  // 修正: 型を明示的に指定
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea className="resize-none h-20" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Log
                </Button>
              </form>
            </Form>
          </div>

          {/* Right: List */}
          <div className="w-2/3 pl-2 flex flex-col">
            <h3 className="font-semibold mb-4 text-sm">History</h3>
            <ScrollArea className="flex-1 pr-4">
              {logs.length === 0 ? (
                <div className="text-center text-muted-foreground py-10 text-sm">
                  No maintenance records found.
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="bg-muted/50 p-3 rounded-md text-sm border relative group">
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="capitalize px-2 py-0.5 bg-white dark:bg-zinc-800 rounded border text-xs">
                            {log.type}
                          </span>
                          <span className="text-muted-foreground text-xs flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {format(parseISO(log.performedAt), "MMM d, yyyy")}
                          </span>
                        </div>
                        {log.cost > 0 && (
                          <span className="font-mono text-xs flex items-center text-zinc-600 dark:text-zinc-400">
                            <DollarSign className="h-3 w-3" />
                            {log.cost}
                          </span>
                        )}
                      </div>
                      <p className="text-zinc-700 dark:text-zinc-300 pl-1">{log.description}</p>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                        onClick={() => handleDelete(log.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}