"use client";

export function EmptyState() {
  const greeting = getGreeting();

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Greeting */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">C</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-normal text-foreground">
            {greeting}, Miles
          </h1>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
