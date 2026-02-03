/**
 * GitHub API Helper - Base function for all GitHub API calls
 */

export async function gh(url) {
  // Ensure leading slash
  if (!url.startsWith('/')) {
    url = '/' + url;
  }

  const res = await fetch(`https://api.github.com${url}`, {
    headers: {
      Accept: 'application/vnd.github+json'
    }
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }

  return res.json();
}
