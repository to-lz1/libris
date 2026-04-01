export function deriveTitle(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const withSpaces = nameWithoutExt.replace(/[_\-.]+/g, ' ').trim();
  if (!withSpaces) return 'Untitled';
  return withSpaces
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
