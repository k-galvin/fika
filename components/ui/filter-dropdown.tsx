'use client';

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function FilterDropdown({ title, options, filterKey }: { title: string, options: string[], filterKey: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set(filterKey, value);

    if (value === searchParams.get(filterKey)) {
        current.delete(filterKey);
    }

    const query = current.toString();
    router.push(`${pathname}?${query}`);
  };

  const selectedValue = searchParams.get(filterKey) || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="uppercase">{title}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={selectedValue} onValueChange={handleFilterChange}>
            {options.map(option => (
            <DropdownMenuRadioItem key={option} value={option}>
                {option}
            </DropdownMenuRadioItem>
            ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}