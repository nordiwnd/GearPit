import { tripApi } from "@/lib/api";
import { TripDetailsView } from "@/components/trip/trip-details-view";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params;
  let trip;

  try {
    trip = await tripApi.get(id);
  } catch (error) {
    console.error("Failed to fetch trip:", error);
    // In a real app, handle error more gracefully
  }

  if (!trip) {
    notFound();
  }

  return <TripDetailsView initialTrip={trip} />;
}