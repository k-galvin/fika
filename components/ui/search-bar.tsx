"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "./input";

export function SearchBar({ 
  placeholder, 
  id = "search", 
  name = "search" 
}: { 
  placeholder: string;
  id?: string;
  name?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="w-full md:w-auto">
      <Input
        type="search"
        id={id}
        name={name}
        placeholder={placeholder}
        enterKeyHint="search"
        autoComplete="off"
        className="w-full md:w-64 h-11 md:h-9"
        defaultValue={searchParams.get("search") || ""}
        onChange={(e) => handleSearch(e.target.value)}
      />
    </div>
  );
}
