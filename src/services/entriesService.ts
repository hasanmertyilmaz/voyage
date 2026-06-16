import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';

import { PHOTO_BUCKET } from '@/constants/config';
import type { Entry, EntryDraft } from '@/types/entry';

import { supabase } from './supabase';

/** Raw row shape as stored in Postgres (snake_case). */
interface EntryRow {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  place_name: string | null;
  photo_url: string | null;
  photo_path: string | null;
  weather: Entry['weather'];
  trip_date: string;
  created_at: string;
  updated_at: string;
}

function mapRowToEntry(row: EntryRow): Entry {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    notes: row.notes ?? '',
    latitude: row.latitude,
    longitude: row.longitude,
    placeName: row.place_name,
    photoUrl: row.photo_url,
    photoPath: row.photo_path,
    weather: row.weather ?? null,
    tripDate: row.trip_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Read a local image file and upload it to Storage, returning its public url. */
async function uploadPhoto(userId: string, localUri: string): Promise<{ url: string; path: string }> {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const arrayBuffer = decode(base64);
  const path = `${userId}/${Date.now()}-${Math.round(Math.random() * 1_000_000)}.jpg`;

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, arrayBuffer, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

async function removePhoto(path: string): Promise<void> {
  await supabase.storage.from(PHOTO_BUCKET).remove([path]);
}

export async function fetchEntries(userId: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', userId)
    .order('trip_date', { ascending: false })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as EntryRow[]).map(mapRowToEntry);
}

export async function createEntry(userId: string, draft: EntryDraft): Promise<Entry> {
  let photoUrl = draft.photoUrl;
  let photoPath = draft.photoPath;
  if (draft.photoLocalUri) {
    const uploaded = await uploadPhoto(userId, draft.photoLocalUri);
    photoUrl = uploaded.url;
    photoPath = uploaded.path;
  }

  const { data, error } = await supabase
    .from('entries')
    .insert({
      user_id: userId,
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      latitude: draft.latitude,
      longitude: draft.longitude,
      place_name: draft.placeName,
      photo_url: photoUrl,
      photo_path: photoPath,
      weather: draft.weather,
      trip_date: draft.tripDate,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRowToEntry(data as EntryRow);
}

export async function updateEntry(userId: string, id: string, draft: EntryDraft): Promise<Entry> {
  let photoUrl = draft.photoUrl;
  let photoPath = draft.photoPath;
  if (draft.photoLocalUri) {
    const uploaded = await uploadPhoto(userId, draft.photoLocalUri);
    if (photoPath) await removePhoto(photoPath).catch(() => undefined);
    photoUrl = uploaded.url;
    photoPath = uploaded.path;
  }

  const { data, error } = await supabase
    .from('entries')
    .update({
      title: draft.title.trim(),
      notes: draft.notes.trim(),
      latitude: draft.latitude,
      longitude: draft.longitude,
      place_name: draft.placeName,
      photo_url: photoUrl,
      photo_path: photoPath,
      weather: draft.weather,
      trip_date: draft.tripDate,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapRowToEntry(data as EntryRow);
}

export async function deleteEntry(entry: Pick<Entry, 'id' | 'photoPath'>): Promise<void> {
  const { error } = await supabase.from('entries').delete().eq('id', entry.id);
  if (error) throw new Error(error.message);
  if (entry.photoPath) await removePhoto(entry.photoPath).catch(() => undefined);
}
