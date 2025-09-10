
'use client';

import { BowtieDiagram } from "@/components/bowtie/bowtie-diagram";
import { bowtieData as initialBowtieData } from "@/lib/mock-data";
import { useState } from "react";
import type { BowtieData } from "@/lib/types";

export default function BowtiePage() {
  const [bowtieData, setBowtieData] = useState<BowtieData>(initialBowtieData);

  const handleUpdate = (updatedData: BowtieData) => {
    setBowtieData(updatedData);
    // Here you would typically also save the data to a backend/database.
    console.log("Bowtie data updated:", updatedData);
  };

  return (
    <div className="w-full mx-auto">
      <BowtieDiagram data={bowtieData} onUpdate={handleUpdate} />
    </div>
  );
}
