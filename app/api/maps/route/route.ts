import { NextResponse } from "next/server";

interface Coordinates {
  lat: number;
  lng: number;
}

interface RouteRequest {
  coordinates: [number, number][];
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ORS_API_KEY;

    if (!apiKey) {
      console.error("ORS_API_KEY is not configured.");

      return NextResponse.json(
        {
          message: "Route service is temporarily unavailable.",
        },
        { status: 500 },
      );
    }

    const body = (await request.json()) as RouteRequest;

    const coordinates = body.coordinates;

    if (!Array.isArray(coordinates) || coordinates.length < 2) {
      return NextResponse.json(
        {
          message: "At least two route points are required.",
        },
        { status: 400 },
      );
    }

    const validCoordinates = coordinates.every(
      (point) =>
        Array.isArray(point) &&
        point.length === 2 &&
        Number.isFinite(point[0]) &&
        Number.isFinite(point[1]),
    );

    if (!validCoordinates) {
      return NextResponse.json(
        {
          message: "Invalid route coordinates.",
        },
        { status: 400 },
      );
    }

    const response = await fetch(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        method: "POST",

        headers: {
          Authorization: apiKey,
          "Content-Type": "application/json",
          Accept: "application/json, application/geo+json",
        },

        body: JSON.stringify({
          coordinates,
          instructions: false,
          preference: "recommended",
        }),

        /*
         * Don't cache live route calculations.
         */
        cache: "no-store",
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();

      console.error(`OpenRouteService error ${response.status}:`, errorBody);

      let message = "We couldn't calculate a route for those addresses.";

      try {
        const parsed = JSON.parse(errorBody);

        const code = parsed?.error?.code;

        if (code === 2004 || code === 2010) {
          message =
            "That destination looks to be outside our service area. Please check the pickup and destination addresses.";
        } else if (code === 2099 || response.status === 404) {
          message = "We couldn't find a drivable route between those points.";
        }
      } catch {
        // Keep generic message.
      }

      return NextResponse.json({ message }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Route handler error:", error);

    return NextResponse.json(
      {
        message: "We couldn't calculate a route right now. Please try again.",
      },
      { status: 500 },
    );
  }
}
