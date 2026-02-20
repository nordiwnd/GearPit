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
                            if (data.height_cm) setHeightCm(data.height_cm);
                            if (data.weight_g) setWeightKg(data.weight_g / 1000); // grams to kg
                            if (data.water_ratio) setWaterRatio(data.water_ratio);
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
        <div className="container mx-auto py-8 px-4 max-w-xl text-zinc-100">
            <h1 className="text-3xl font-semibold mb-6 tracking-tight">User Profile</h1>
            <p className="text-sm text-zinc-400 mb-8">
                Your physical attributes are used to calculate physiological metrics like estimated water loss and calories burned during trips.
            </p>

            <form onSubmit={handleSave} className="space-y-6 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
                <div className="space-y-2">
                    <Label htmlFor="heightCm">Height (cm)</Label>
                    <Input
                        id="heightCm"
                        type="number"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value ? Number(e.target.value) : "")}
                        placeholder="e.g. 175"
                        className="bg-zinc-950 border-zinc-800"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="weightKg">Weight (kg)</Label>
                    <Input
                        id="weightKg"
                        type="number"
                        step="0.1"
                        value={weightKg}
                        onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : "")}
                        placeholder="e.g. 70"
                        className="bg-zinc-950 border-zinc-800"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="waterRatio">Water Replenishment Ratio</Label>
                    <Input
                        id="waterRatio"
                        type="number"
                        step="0.05"
                        min="0"
                        max="2"
                        value={waterRatio}
                        onChange={(e) => setWaterRatio(Number(e.target.value))}
                        className="bg-zinc-950 border-zinc-800"
                    />
                    <p className="text-xs text-zinc-500">
                        Default 0.75. Multiplying sweat loss by this factor gets recommended water intake.
                    </p>
                </div>

                <Button type="submit" disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save Profile"}
                </Button>
            </form>
        </div>
    );
}
