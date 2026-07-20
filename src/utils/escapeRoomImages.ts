const roomImageModules = import.meta.glob('../assets/images/escape-rooms/*.{jpg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const roomImageMap: Record<string, string> = {};
for (const [path, url] of Object.entries(roomImageModules)) {
  const name = path.split('/').pop()?.replace(/\.\w+$/, '');
  if (name) roomImageMap[name] = url;
}

export const getRoomImage = (id: string): string | undefined => roomImageMap[id];
