import { NextRequest, NextResponse } from "next/server";

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json(
      {
        error: "Latitude and longitude are required.",
      },
      { status: 400 },
    );
  }

  const latitude = Number(lat);
  const longitude = Number(lng);



    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        {
          error: "Invalid coordinates.",
        },
        { status: 400 },
      );
    }


  try {
    const params = new URLSearchParams({
      format: "json",
      lat,
      lon: lng,
      zoom: "18",
      addressdetails: "1",
    });

    const response = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "User-Agent": "Western Cars Booking Website",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Unable to identify this location.",
        },
        { status: 502 },
      );
    }

    const data = await response.json();

    return NextResponse.json({
      address: data.display_name || "New Build Area",
    });
  } catch (error) {
    console.error("Reverse geocode proxy error:", error);

    return NextResponse.json(
      {
        error: "Unable to identify this location.",
      },
      { status: 500 },
    );
  }
}
