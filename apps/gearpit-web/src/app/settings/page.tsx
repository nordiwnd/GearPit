"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const USER_ID = "00000000-0000-0000-0000-000000000001";

export default function SettingsPage() {
    const [heightCm, setHeightCm] = useState<number | "">("");
    const [weightKg, setWeightKg] = useState<number | "">("");
    const [waterRatio, setWaterRatio] = useState<number>(0.75);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        async function fetchProfile() {
            setLoading(true);
            try {
                const res = await fetch(`/api/user_profiles/${USER_ID}`);
                if (res.ok) {
                    const text = await res.text();
                    if (text) {
                        try {
                            const data = JSON.parse(text);
                            if (data) {
                                if (data.height_cm) setHeightCm(data.height_cm);
                                if (data.weight_g) setWeightKg(data.weight_g / 1000); // grams to kg
                                if (data.water_ratio) setWaterRatio(data.water_ratio);
                            }
                        } catch (e) {
                            console.error("Failed to parse JSON", e);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load profile", err);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                user_id: USER_ID,
                height_cm: heightCm === "" ? null : heightCm,
                weight_g: weightKg === "" ? null : weightKg * 1000,
                water_ratio: waterRatio,
            };
            const res = await fetch("/api/user_profiles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            if (!res.ok) {
                throw new Error("Failed to save profile");
            }
            alert("Profile saved successfully");
        } catch (err) {
            console.error(err);
            alert("Error saving profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8">Loading profile...</div>;

    return (
        <div className="flex flex-col h-full overflow-auto bg-[#18181B] text-zinc-200 p-6 md:p-8">
            <div className="max-w-4xl mx-auto w-full space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">User Profile</h1>
                        <p className="text-sm text-zinc-400">
                            Your physical attributes are used to calculate physiological metrics like estimated water loss and calories burned during trips.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6 bg-[#27272A] p-6 rounded-lg border border-zinc-800 shadow-sm max-w-xl">
                    <div className="space-y-2">
                        <Label htmlFor="heightCm" className="text-zinc-300 font-medium">Height (cm)</Label>
                        <Input
                            id="heightCm"
                            type="number"
                            value={heightCm}
                            onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 175"
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="weightKg" className="text-zinc-300 font-medium">Weight (kg)</Label>
                        <Input
                            id="weightKg"
                            type="number"
                            step="0.1"
                            value={weightKg}
                            onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : "")}
                            placeholder="e.g. 70"
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 focus-visible:ring-emerald-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="waterRatio" className="text-zinc-300 font-medium">Water Replenishment Ratio</Label>
                        <Input
                            id="waterRatio"
                            type="number"
                            step="0.05"
                            min="0"
                            max="2"
                            value={waterRatio}
                            onChange={(e) => setWaterRatio(Number(e.target.value))}
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 focus-visible:ring-emerald-500 font-mono"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            Default: 0.75. Multiplies estimated sweat loss by this factor to yield recommended intake.
                        </p>
                    </div>

                    <Button type="submit" disabled={saving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_15px_rgba(5,150,105,0.2)] transition-all">
                        {saving ? "Saving..." : "Save Profile Configuration"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
