"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wrench, Plus, Loader2, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner"; // 追加: トースト通知

import { GearItem, MaintenanceLog, maintenanceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"; // 追加

const formSchema = z.object({
  logDate: z.string().min(1, "Date is required"),
  actionTaken: z.string().min(1, "Action taken is required"),
  cost: z.string().regex(/^\d*$/, "Cost must be a positive number"),
});

type FormValues = z.infer<typeof formSchema>;

export function MaintenanceDialog({ item }: { item: GearItem }) {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 編集モード用の状態
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await maintenanceApi.getLogsForItem(item.id);
      setLogs(data || []);
    } catch (error) { toast.error("Failed to load logs"); } 
    finally { setLoading(false); }
  }, [item.id]);

  useEffect(() => { if (open) fetchLogs(); }, [open, fetchLogs]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { logDate: format(new Date(), "yyyy-MM-dd"), actionTaken: "", cost: "" },
  });

  // 編集ボタンクリック時
  const startEdit = (log: MaintenanceLog) => {
    setEditingLogId(log.id);
    form.reset({
      logDate: format(new Date(log.logDate), "yyyy-MM-dd"),
      actionTaken: log.actionTaken,
      cost: log.cost.toString(),
    });
  };

  // 編集キャンセル時
  const cancelEdit = () => {
    setEditingLogId(null);
    form.reset({ logDate: format(new Date(), "yyyy-MM-dd"), actionTaken: "", cost: "" });
  };

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    try {
      const costNumber = data.cost ? Number(data.cost) : 0;
      const payload = { itemId: item.id, logDate: data.logDate, actionTaken: data.actionTaken, cost: costNumber };

      if (editingLogId) {
        await maintenanceApi.updateLog(editingLogId, payload);
        toast.success("Log updated successfully");
      } else {
        await maintenanceApi.addLog(payload);
        toast.success("New log added");
      }
      
      cancelEdit();
      fetchLogs();
    } catch (error) { toast.error("Failed to save log"); } 
    finally { setIsSubmitting(false); }
  }

  async function handleDelete(logId: string) {
    try {
      await maintenanceApi.deleteLog(logId);
      toast.success("Log deleted");
      if (editingLogId === logId) cancelEdit();
      fetchLogs();
    } catch (error) { toast.error("Failed to delete log"); }
  }

  const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Maintenance"><Wrench className="h-4 w-4" /></Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl h-[80vh] flex flex-col">
        <DialogHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-xl">{item.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Maintenance History</p>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">Total Cost: ¥{totalCost.toLocaleString()}</Badge>
          </div>
        </DialogHeader>

        <div className="flex-1 grid md:grid-cols-2 gap-6 overflow-hidden">
          {/* Form Section */}
          <div className="flex flex-col h-full bg-zinc-50 p-4 rounded-md border">
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              <span className="flex items-center">
                {editingLogId ? <Pencil className="w-4 h-4 mr-1 text-blue-500" /> : <Plus className="w-4 h-4 mr-1" />} 
                {editingLogId ? "Edit Log" : "Add New Log"}
              </span>
              {editingLogId && <Button variant="ghost" size="sm" onClick={cancelEdit}><X className="h-4 w-4" /></Button>}
            </h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="logDate" render={({ field }) => (
                  <FormItem><FormLabel>Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="actionTaken" render={({ field }) => (
                  <FormItem><FormLabel>Action / Description</FormLabel><FormControl><Input placeholder="e.g. Waxed base" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="cost" render={({ field }) => (
                  <FormItem><FormLabel>Cost (JPY)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : editingLogId ? "Update Log" : "Save Log"}
                </Button>
              </form>
            </Form>
          </div>

          <Separator className="md:hidden" />

          {/* History Section */}
          <div className="flex flex-col h-full min-h-0">
            <h3 className="font-semibold mb-4">History ({logs.length})</h3>
            <ScrollArea className="flex-1 pr-4">
              {loading ? <div className="flex justify-center"><Loader2 className="animate-spin" /></div> : logs.length === 0 ? <p className="text-sm text-muted-foreground">No records.</p> : (
                <div className="space-y-3 pb-4">
                  {logs.map(log => (
                    <div key={log.id} className={`bg-white border rounded-md p-3 group transition-colors ${editingLogId === log.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-mono font-medium text-zinc-500">{format(new Date(log.logDate), "yyyy-MM-dd")}</span>
                        {log.cost > 0 && <span className="text-xs font-semibold">¥{log.cost.toLocaleString()}</span>}
                      </div>
                      <p className="text-sm text-zinc-800 pr-12">{log.actionTaken}</p>
                      
                      {/* Hover Action Buttons */}
                      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEdit(log)}><Pencil className="h-3 w-3" /></Button>
                        
                        {/* AlertDialog for Delete Confirmation */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500"><Trash2 className="h-3 w-3" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Log?</AlertDialogTitle>
                              <AlertDialogDescription>This action cannot be undone. You will lose the cost history for this maintenance.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-500" onClick={() => handleDelete(log.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
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