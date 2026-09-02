import rawCatalog from "../data/tracks.json";
import type { Catalog, Track, TrackId } from "./types";

export const catalog = rawCatalog as Catalog;
export const tracks = catalog.tracks;

export function getTrack(id: string): Track | undefined {
  return tracks.find((track) => track.id === id);
}

export function isTrackId(value: string): value is TrackId {
  return tracks.some((track) => track.id === value);
}
