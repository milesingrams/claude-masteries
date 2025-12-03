import { MasteriesGrid } from "@/components/masteries/masteries-grid";

export default function MasteriesPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-border/40 shrink-0 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-xl font-semibold">Masteries</h1>
      </header>
      <main className="min-h-0 flex-1 overflow-auto p-6">
        <MasteriesGrid />
      </main>
    </div>
  );
}
