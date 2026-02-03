"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wrench, Plus, Loader2, Trash2, Pencil, X } from "lucide-react";
import { toast } from "sonner";

import { GearItem, MaintenanceLog, maintenanceApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

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

  const startEdit = (log: MaintenanceLog) => {
    setEditingLogId(log.id);
    form.reset({
      logDate: format(new Date(log.logDate), "yyyy-MM-dd"),
      actionTaken: log.actionTaken,
      cost: log.cost.toString(),
    });
  };

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
          {/* Form */}
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

          {/* History List */}
          <div className="flex flex-col h-full min-h-0">
            <h3 className="font-semibold mb-4">History ({logs.length})</h3>
            <ScrollArea className="flex-1 pr-4">
              {loading ? <div className="flex justify-center"><Loader2 className="animate-spin" /></div> : logs.length === 0 ? <p className="text-sm text-muted-foreground">No records.</p> : (
                <div className="space-y-3 pb-4">
                  {logs.map(log => (
                    <div key={log.id} className={`bg-white border rounded-md p-3 transition-colors flex flex-col gap-2 ${editingLogId === log.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div>
                           <div className="flex items-center gap-2 mb-1">
                             <span className="text-xs font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded">{format(new Date(log.logDate), "yyyy-MM-dd")}</span>
                             {log.cost > 0 && <span className="text-xs font-semibold text-zinc-700">¥{log.cost.toLocaleString()}</span>}
                           </div>
                           <p className="text-sm text-zinc-800 break-words">{log.actionTaken}</p>
                        </div>
                      </div>
                      
                      {/* Actions: Always Visible */}
                      <div className="flex justify-end gap-2 mt-1 pt-2 border-t border-zinc-100">
                        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => startEdit(log)}>
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="h-7 text-xs hover:text-red-600 hover:bg-red-50 hover:border-red-200">
                              <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Log?</AlertDialogTitle>
                              <AlertDialogDescription>Are you sure you want to delete this maintenance record?</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-500 hover:bg-red-600" onClick={() => handleDelete(log.id)}>Delete</AlertDialogAction>
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