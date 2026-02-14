"use client";

import { useState, useEffect } from 'react';
import { Loader2, Plus, Search } from 'lucide-react';
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { gearApi, tripApi, GearItem } from "@/lib/api";

interface Props {
  tripId: string;
  currentItems: GearItem[];
  onSuccess: () => void;
}

export function AddGearToTripDialog({ tripId, currentItems, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gears, setGears] = useState<GearItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      gearApi.listItems()
        .then(res => setGears(res || []))
        .catch(() => toast.error("Failed to load inventory"))
        .finally(() => setLoading(false));
      setSelectedIds([]);
    }
  }, [open]);

  const currentIds = new Set(currentItems.map(i => i.id));

  const filteredGears = gears.filter(gear =>
    !currentIds.has(gear.id) &&
    (gear.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gear.properties?.brand?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAdd = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    try {
      await tripApi.addItems(tripId, selectedIds);
      toast.success(`Added ${selectedIds.length} items to trip`);
      setOpen(false);
      onSuccess();
    } catch {
      toast.error("Failed to add items");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Gear
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Gear from Inventory</DialogTitle>
        </DialogHeader>

        <div className="relative mb-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <ScrollArea className="flex-1 border rounded-md bg-muted/50 p-2">
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div>
          ) : filteredGears.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">No matching gears found.</div>
          ) : (
            <div className="space-y-1">
              {filteredGears.map(gear => (
                <div
                  key={gear.id}
                  className="flex items-center space-x-3 p-3 bg-card border rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => toggleSelection(gear.id)}
                >
                  <Checkbox checked={selectedIds.includes(gear.id)} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{gear.name}</div>
                    <div className="text-xs text-muted-foreground">{gear.properties?.brand}</div>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">{gear.weightGram}g</Badge>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-muted-foreground">
            {selectedIds.length} items selected
          </span>
          <Button onClick={handleAdd} disabled={selectedIds.length === 0 || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add to Trip
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}