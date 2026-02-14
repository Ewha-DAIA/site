const cache = new Map();

export async function loadData(filename) {
  if (cache.has(filename)) {
    return cache.get(filename);
  }

  try {
    const response = await fetch(`/data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load data: ${filename}`);
    }
    const data = await response.json();
    cache.set(filename, data);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
