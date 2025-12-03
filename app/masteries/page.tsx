import { MasteriesGrid } from "@/components/masteries/masteries-grid";

export default function MasteriesPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-border/40 bg-background/80 sticky top-0 z-10 flex h-12 shrink-0 items-center justify-center border-b backdrop-blur-sm">
        <h1 className="text-sm font-medium">Masteries</h1>
      </header>
      <main className="min-h-0 flex-1 overflow-auto p-6">
        <MasteriesGrid />
      </main>
    </div>
  );
}
