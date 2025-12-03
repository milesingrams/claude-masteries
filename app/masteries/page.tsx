import { MasteriesGrid } from "@/components/masteries/masteries-grid";

export default function MasteriesPage() {
  return (
    <div className="flex h-full flex-col overflow-auto">
      <header className="border-border/40 sticky top-0 z-10 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-xl font-semibold">Masteries</h1>
      </header>
      <main className="flex-1 overflow-x-auto p-6">
        <MasteriesGrid />
      </main>
    </div>
  );
}
