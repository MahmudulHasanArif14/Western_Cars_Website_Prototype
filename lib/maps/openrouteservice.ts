const ORS_BASE_URL = "https://api.openrouteservice.org";

function getApiKey() {
  const apiKey = process.env.ORS_API_KEY;

  if (!apiKey) {
    throw new Error("ORS_API_KEY is not configured.");
  }

  return apiKey;
}

export async function autocompleteAddress(text: string) {
  const apiKey = getApiKey();

  const params = new URLSearchParams({
    api_key: apiKey,
    text,
    size: "6",
    "boundary.country": "GBR",
  });

  const response = await fetch(
    `${ORS_BASE_URL}/geocode/autocomplete?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("ORS autocomplete failed.", { cause: response.status });
  }

  return response.json();
}
