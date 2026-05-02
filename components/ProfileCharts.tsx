"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import VisitedCafesPieChart from "./VisitedCafesPieChart";
import ColumnSelectDropdown from "./ColumnSelectDropdown";
import { CoffeeShop, UserVisit } from "@/lib/types";

const COLUMNS_TO_ANALYZE = [
  "city",
  "busyness",
  "pricing",
  "vibe",
  "parking",
  "seating",
  "has_outlets",
  "has_wifi",
];

interface PieChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

function aggregateData(
  cafes: CoffeeShop[],
  key: keyof CoffeeShop
): PieChartData[] {
  const counts: { [key: string]: number } = {};

  cafes.forEach((cafe) => {
    const value = cafe[key];
    if (value !== null && value !== undefined) {
      const stringValue =
        typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
      counts[stringValue] = (counts[stringValue] || 0) + 1;
    }
  });

  return Object.entries(counts).map(([name, value]) => ({
    name,
    value,
  }));
}

function capitalizeWords(str: string): string {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

interface ProfileChartsProps {
  visitedCafes: UserVisit[];
  subtitle?: string;
}

const ProfileCharts: React.FC<ProfileChartsProps> = ({
  visitedCafes,
  subtitle,
}) => {
  const [selectedColumn, setSelectedColumn] =
    useState<keyof CoffeeShop>("city");

  const pieChartData = useMemo(() => {
    const visitedCoffeeShops = visitedCafes
      .map((visit) => visit.coffee_shops)
      .filter(Boolean) as CoffeeShop[];
    return aggregateData(visitedCoffeeShops, selectedColumn);
  }, [visitedCafes, selectedColumn]);

  const formattedTitle = useMemo(() => {
    return capitalizeWords(selectedColumn.replace(/_/g, " "));
  }, [selectedColumn]);

  const handleSelectColumn = (column: string) => {
    setSelectedColumn(column as keyof CoffeeShop);
  };

  return (
    <Card className="handwritten-border !border-primary/10 bg-secondary/10 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl text-primary/80">
          Preferences Breakdown
        </CardTitle>
        <CardDescription className="italic">
          {subtitle || "Analyze your visited cafe habits."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex justify-center">
          <ColumnSelectDropdown
            selectedColumn={selectedColumn}
            onSelectColumn={handleSelectColumn}
            columns={COLUMNS_TO_ANALYZE}
          />
        </div>
        <div className="bg-background/40 p-6 rounded-xl border border-primary/5">
          <VisitedCafesPieChart data={pieChartData} title={formattedTitle} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCharts;
