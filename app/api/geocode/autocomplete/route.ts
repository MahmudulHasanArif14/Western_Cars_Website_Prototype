import { NextRequest, NextResponse } from "next/server";
import { autocompleteAddress } from "../../../../lib/maps/openrouteservice";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const text = searchParams.get("text")?.trim() ?? "";

  if (text.length < 3) {
    return NextResponse.json(
      {
        features: [],
      },
      { status: 200 },
    );
  }

  try {
    const data = await autocompleteAddress(text);

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Unable to search locations.",
      },
      { status: 502 },
    );
  }
}
