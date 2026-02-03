"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 現在のURLパラメータを初期値としてセット
  const [tag, setTag] = useState(searchParams.get("tag") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [brand, setBrand] = useState(searchParams.get("brand") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);

    // URLを更新し、サーバーサイドでの再フェッチをトリガー
    router.push(`/?${params.toString()}`);
  };

  const handleClear = () => {
    setTag("");
    setCategory("");
    setBrand("");
    router.push("/");
  };

  const hasFilters = tag || category || brand;

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
      <div className="relative">
        <Input
          placeholder="Filter by Tag..."
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full md:w-[150px]"
        />
      </div>
      <div className="relative">
        <Input
          placeholder="Filter by Category..."
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full md:w-[150px]"
        />
      </div>
      <div className="relative">
        <Input
          placeholder="Filter by Brand..."
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="w-full md:w-[150px]"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" variant="secondary">
          <Search className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Search</span>
        </Button>
        {hasFilters && (
          <Button type="button" variant="ghost" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </form>
  );
}