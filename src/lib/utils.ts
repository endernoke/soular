export const getFileExtension = (uri: string) => {
  const match = uri.match(/\.(\w+)$/);
  return match ? match[1] : null;
};

export const guessMimeType = (extension: string | null) => {
  if (!extension) return 'application/octet-stream'; // Default
  const lowerExt = extension.toLowerCase();
  if (lowerExt === 'jpg' || lowerExt === 'jpeg') return 'image/jpeg';
  if (lowerExt === 'png') return 'image/png';
  if (lowerExt === 'gif') return 'image/gif';
  // Add more types as needed
  return `image/${lowerExt}`;
};
