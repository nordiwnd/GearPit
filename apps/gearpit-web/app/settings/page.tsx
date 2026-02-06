"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { profileApi, UserProfile } from "@/lib/api";

// 修正: z.coerce.number() を使用し、default値を指定しないことで undefined 問題を回避
const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  heightCm: z.coerce.number().min(0),
  weightKg: z.coerce.number().min(0),
  age: z.coerce.number().min(0),
  gender: z.string().min(1, "Select gender"),
});

// 型推論を使用
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function SettingsPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // フォーム初期化
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      heightCm: 170,
      weightKg: 65,
      age: 30,
      gender: "male",
    },
  });

  const fetchProfiles = async () => {
    try {
      const data = await profileApi.list();
      setProfiles(data || []);
    } catch (error) {
      toast.error("Failed to load profiles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfiles(); }, []);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await profileApi.create(values);
      toast.success("Profile created");
      setIsDialogOpen(false);
      form.reset({
        name: "",
        heightCm: 170,
        weightKg: 65,
        age: 30,
        gender: "male",
      });
      fetchProfiles();
    } catch (error) {
      toast.error("Failed to create profile");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this profile?")) return;
    try {
      await profileApi.delete(id);
      toast.success("Profile deleted");
      fetchProfiles();
    } catch (error) {
      toast.error("Failed to delete profile");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-50">Settings</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Manage user profiles and application preferences.</p>
        </div>

        <Card className="dark:bg-zinc-900 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="dark:text-zinc-200">User Profiles</CardTitle>
              <CardDescription>Manage profiles to link with trip plans.</CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Profile</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Profile</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="heightCm" render={({ field }) => (
                        <FormItem><FormLabel>Height (cm)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="weightKg" render={({ field }) => (
                        <FormItem><FormLabel>Weight (kg)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="age" render={({ field }) => (
                        <FormItem><FormLabel>Age</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="gender" render={({ field }) => (
                        <FormItem><FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger></FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        <FormMessage /></FormItem>
                      )} />
                    </div>
                    <Button type="submit" className="w-full">Create Profile</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-center py-4"><Loader2 className="animate-spin inline" /></div> : 
             profiles.length === 0 ? <div className="text-center py-8 text-muted-foreground">No profiles found.</div> :
            <Table>
              <TableHeader>
                <TableRow className="dark:border-zinc-800">
                  <TableHead>Name</TableHead>
                  <TableHead>Height</TableHead>
                  <TableHead>Weight</TableHead>
                  <TableHead>Info</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map(profile => (
                  <TableRow key={profile.id} className="dark:border-zinc-800">
                    <TableCell className="font-medium dark:text-zinc-200 flex items-center gap-2">
                        <User className="h-4 w-4 text-zinc-400" /> {profile.name}
                    </TableCell>
                    <TableCell>{profile.heightCm} cm</TableCell>
                    <TableCell>{profile.weightKg} kg</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{profile.age} yrs, {profile.gender}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)} className="text-zinc-400 hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}