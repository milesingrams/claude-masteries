import { getMasteriesForDisplay } from "@/lib/masteries/loader";

export async function GET() {
  try {
    const masteries = getMasteriesForDisplay();
    return Response.json(masteries);
  } catch (error) {
    console.error("Error loading masteries:", error);
    return Response.json([], { status: 500 });
  }
}
