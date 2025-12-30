import logger from './logger';

// Define the core data structures
interface Location {
  lat: number;
  lng: number;
}

interface GeocodeResult {
  address_components: Array<{
    short_name: string;
    types: string[];
  }>;
  geometry: {
    location: Location;
    location_type: string; // e.g., "APPROXIMATE"
  };
}

interface GeocodeResponse {
  results: GeocodeResult[];
  status: string;
}

export async function findUsZipCentroid(
  zipCode: string,
): Promise<{ lat: number; lng: number } | null> {
  const apiUrl = process.env.GOOGLE_MAPS_GEOCODE_URL;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiUrl || !apiKey) {
    logger.error(
      `Missing Google Maps configuration: URL=${Boolean(apiUrl)}, KEY=${Boolean(apiKey)}`,
    );
    return null;
  }

  const params = new URLSearchParams({
    address: zipCode,
    region: 'us',
    key: apiKey,
  });

  const url = `${apiUrl}?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      logger.error(`Geocode HTTP error for ${zipCode}: ${response.status}`);
      return null;
    }

    const data: GeocodeResponse = await response.json();

    if (data.status !== 'OK') {
      logger.warn(
        `Geocoding returned non-OK status for ${zipCode}: ${data.status}`,
      );
      return null;
    }

    const usResult = data.results.find((result) =>
      result.address_components.some(
        (c) =>
          c.types.includes('country') && c.short_name?.toUpperCase() === 'US',
      ),
    );

    if (!usResult) {
      logger.warn(`No US result found for ZIP code: ${zipCode}`);
      return null;
    }

    const { lat, lng } = usResult.geometry.location;

    return { lat, lng };
  } catch (error) {
    logger.error(`${new Date().toLocaleString('es-CL')} ${error.message}`);
  }
}
