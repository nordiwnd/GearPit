'use client';

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
// import axios from 'axios'; // 削除
import { Plus, Trash2, Loader2 } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
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
import { api } from "@/lib/api"; // 追加

// バリデーションスキーマ
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  brand: z.string().optional(),
  // coerceを使って文字列入力("123")を数値(123)に変換
  weightGram: z.coerce.number().min(0, "Weight must be 0 or more"),
  tags: z.string().optional(),
  properties: z.array(z.object({
    key: z.string().min(1, "Key required"),
    value: z.string().min(1, "Value required")
  }))
});

// スキーマから型を生成
type FormValues = z.infer<typeof formSchema>;

interface Props {
  onSuccess: () => void;
}

export function AddGearDialog({ onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ジェネリクス <FormValues> を削除して型推論に任せる
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      brand: "",
      weightGram: 0,
      tags: "",
      properties: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "properties",
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const tagsArray = values.tags 
        ? values.tags.split(',').map(t => t.trim()).filter(t => t !== "") 
        : [];

      const propertiesMap = values.properties.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
      }, {} as Record<string, any>);

      // 修正: apiクライアントを使用し、URLを相対パスに
      await api.post('/api/v1/gears', {
        name: values.name,
        brand: values.brand,
        weightGram: values.weightGram,
        tags: tagsArray,
        properties: propertiesMap,
      });

      form.reset();
      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      alert("Failed to create gear");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Gear
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Gear</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="Ex: Alpha SV" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <FormControl><Input placeholder="Ex: Arc'teryx" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weightGram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (g)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0"
                        {...field}
                        value={field.value as number} 
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (comma separated)</FormLabel>
                    <FormControl><Input placeholder="climbing, winter" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Properties Section */}
            <div className="space-y-2 border-t pt-4">
              <div className="flex justify-between items-center">
                <FormLabel>Properties (JSONB)</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={() => append({ key: "", value: "" })}>
                  <Plus className="h-3 w-3 mr-1" /> Add Property
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`properties.${index}.key`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl><Input placeholder="Key (e.g. Size)" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`properties.${index}.value`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl><Input placeholder="Value (e.g. M)" {...field} /></FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Item
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}