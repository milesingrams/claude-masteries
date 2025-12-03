import { MasteriesGrid } from "@/components/masteries/masteries-grid";

export default function MasteriesPage() {
  return (
    <div className="relative h-full flex-1">
      <div className="absolute inset-0 flex flex-col">
        <header className="border-border/40 bg-background/80 z-10 flex h-12 shrink-0 items-center justify-center border-b backdrop-blur-sm">
          <h1 className="text-sm font-medium">Masteries</h1>
        </header>
        <main className="min-h-0 min-w-0 flex-1 overflow-auto">
          <div className="inline-block min-w-full p-6">
            <MasteriesGrid />
          </div>
        </main>
      </div>
    </div>
  );
}
