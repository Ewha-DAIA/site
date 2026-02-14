const cache = new Map();

// Auto-detect base URL from the script's location
function getBaseUrl() {
  // Get the directory of the current HTML page
  const path = window.location.pathname;
  // Remove trailing filename (like index.html) and keep the directory
  const dir = path.substring(0, path.lastIndexOf('/') + 1);
  return dir;
}

const BASE_URL = getBaseUrl();

export function resolveUrl(path) {
  // Convert "/assets/foo" or "assets/foo" to proper URL
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${BASE_URL}${cleanPath}`;
}

export async function loadData(filename) {
  if (cache.has(filename)) {
    return cache.get(filename);
  }

  try {
    const response = await fetch(resolveUrl(`data/${filename}`));
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
