import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type GeoPlace = { name: string; km: number };

const input = z.object({ lat: z.number().min(-90).max(90), lon: z.number().min(-180).max(180) });

async function reverseAt(lat: number, lon: number, zoom: number): Promise<string | null> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=${zoom}&accept-language=id,en`;
  const res = await fetch(url, { headers: { "User-Agent": "NOW-app/1.0 (location picker)" } });
  if (!res.ok) return null;
  const json = (await res.json()) as { address?: Record<string, string | undefined>; name?: string };
  const a = json.address ?? {};
  const name =
    a.suburb ??
    a.neighbourhood ??
    a.village ??
    a.town ??
    a.city ??
    a.municipality ??
    a.county ??
    a.state ??
    json.name ??
    null;
  return name && name.trim() ? name.trim() : null;
}

// Turn GPS coordinates into human place options near the user.
// Coordinates are only used for this lookup — never stored or posted.
export const placesNearMe = createServerFn({ method: "GET" })
  .inputValidator((data) => input.parse(data))
  .handler(async ({ data }): Promise<GeoPlace[]> => {
    const { lat, lon } = data;
    const zooms = [13, 10, 7, 5]; // neighbourhood → city → region → state
    const names = await Promise.all(zooms.map((z) => reverseAt(lat, lon, z)));
    const seen = new Set<string>();
    const places: GeoPlace[] = [];
    names.forEach((name, i) => {
      if (!name || seen.has(name.toLowerCase())) return;
      seen.add(name.toLowerCase());
      // Rough scale per zoom level so options show an indicative distance.
      const km = [2, 8, 40, 120][i] ?? 120;
      places.push({ name, km });
    });
    return places.slice(0, 4);
  });
