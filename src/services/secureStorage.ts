import * as SecureStore from 'expo-secure-store';

const CHUNK_SIZE = 1800;
const countKey = (key: string) => `${key}__chunks`;
const chunkKey = (key: string, index: number) => `${key}__${index}`;

async function getItem(key: string): Promise<string | null> {
  const rawCount = await SecureStore.getItemAsync(countKey(key));
  if (rawCount == null) return null;
  const count = Number.parseInt(rawCount, 10);
  let value = '';
  for (let i = 0; i < count; i += 1) {
    const chunk = await SecureStore.getItemAsync(chunkKey(key, i));
    if (chunk == null) return null; // corrupted/partial — treat as missing
    value += chunk;
  }
  return value;
}

async function setItem(key: string, value: string): Promise<void> {
  await removeItem(key); // clear any previous (possibly longer) value first
  const count = Math.max(1, Math.ceil(value.length / CHUNK_SIZE));
  for (let i = 0; i < count; i += 1) {
    await SecureStore.setItemAsync(
      chunkKey(key, i),
      value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE),
    );
  }
  await SecureStore.setItemAsync(countKey(key), String(count));
}

async function removeItem(key: string): Promise<void> {
  const rawCount = await SecureStore.getItemAsync(countKey(key));
  if (rawCount == null) return;
  const count = Number.parseInt(rawCount, 10);
  for (let i = 0; i < count; i += 1) {
    await SecureStore.deleteItemAsync(chunkKey(key, i));
  }
  await SecureStore.deleteItemAsync(countKey(key));
}

export const secureStorageAdapter = { getItem, setItem, removeItem };
