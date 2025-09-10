import { BowtieDiagram } from "@/components/bowtie/bowtie-diagram";
import { bowtieData } from "@/lib/mock-data";

export default function BowtiePage() {
  return (
    <div className="w-full mx-auto">
      <BowtieDiagram data={bowtieData} />
    </div>
  );
}
