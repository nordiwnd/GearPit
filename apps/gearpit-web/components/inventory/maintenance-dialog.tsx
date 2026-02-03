"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wrench, Plus, Loader2, Trash2 } from "lucide-react";

import { GearItem, MaintenanceLog, maintenanceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// 修正: cost を文字列として受け取り、数字のみ許可する
const formSchema = z.object({
  logDate: z.string().min(1, "Date is required"),
  actionTaken: z.string().min(1, "Action taken is required"),
  cost: z.string().regex(/^\d*$/, "Cost must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

interface MaintenanceDialogProps {
  item: GearItem;
}

export function MaintenanceDialog({ item }: MaintenanceDialogProps) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await maintenanceApi.getLogsForItem(item.id);
      setLogs(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [item.id]);

  useEffect(() => {
    if (open) fetchLogs();
  }, [open, fetchLogs]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logDate: format(new Date(), "yyyy-MM-dd"),
      actionTaken: "",
      cost: "", // 修正: 初期値を空文字に
    },
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      // 修正: API送信時に cost を数値にキャスト
      const costNumber = data.cost ? Number(data.cost) : 0;

      await maintenanceApi.addLog({
        itemId: item.id,
        logDate: data.logDate,
        actionTaken: data.actionTaken,
        cost: costNumber,
      });
      form.reset({ logDate: format(new Date(), "yyyy-MM-dd"), actionTaken: "", cost: "" });
      fetchLogs();
    } catch (error) {
      console.error(error);
      alert("Failed to add log.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(logId: string) {
    if (!confirm("Delete this log?")) return;
    try {
      await maintenanceApi.deleteLog(logId);
      fetchLogs();
    } catch (error) {
      console.error(error);
      alert("Failed to delete log.");
    }
  }

  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Maintenance Logs">
          <Wrench className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{item.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Maintenance History</p>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1 flex items-center">
              Total Cost: ¥{totalCost.toLocaleString()}
            </Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 grid md:grid-cols-2 gap-6 overflow-hidden">
          <div className="flex flex-col h-full pr-2">
            <h3 className="font-semibold mb-4 flex items-center"><Plus className="w-4 h-4 mr-1" /> Add New Log</h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="logDate" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="actionTaken" render={({ field }) => (
                  <FormItem><FormLabel>Action / Description</FormLabel><FormControl><Input placeholder="e.g. Waxed base, sharpened edges" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cost" render={({ field }) => (
                  <FormItem><FormLabel>Cost (JPY)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Log"}
                </Button>
              </form>
            </Form>
          </div>

          <Separator className="md:hidden" />

          <div className="flex flex-col h-full min-h-0">
            <h3 className="font-semibold mb-4">History ({logs.length})</h3>
            <ScrollArea className="flex-1 -mx-4 px-4">
              {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="animate-spin text-muted-foreground" /></div>
              ) : logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No maintenance recorded yet.</p>
              ) : (
                <div className="space-y-3 pb-4">
                  {logs.map(log => (
                    <div key={log.id} className="bg-zinc-50 border rounded-md p-3 relative group">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-mono font-medium text-zinc-500">
                          {format(new Date(log.logDate), "yyyy-MM-dd")}
                        </span>
                        {log.cost > 0 && (
                          <span className="text-xs font-semibold text-zinc-700">¥{log.cost.toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-zinc-800">{log.actionTaken}</p>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute bottom-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDelete(log.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-500" />
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