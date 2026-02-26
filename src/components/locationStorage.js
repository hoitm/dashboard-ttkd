import { openDB } from 'idb';

export async function saveLocationOffline(location) {
  const db = await openDB('location-db', 1, {
    upgrade(db) {
      db.createObjectStore('locations', { autoIncrement: true });
    },
  });
  await db.add('locations', location);
}

export async function getAllOfflineLocations() {
  const db = await openDB('location-db', 1);
  return await db.getAll('locations');
}

export async function clearAllOfflineLocations() {
  const db = await openDB('location-db', 1);
  const tx = db.transaction('locations', 'readwrite');
  await tx.store.clear();
  await tx.done;
}
