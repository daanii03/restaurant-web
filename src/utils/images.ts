const images = import.meta.glob('../assets/**/*.{webp,jpg,png}', { eager: true }) as Record<string, { default: any }>;

export function getDishImage(imagePath: string): any {
  const filename = imagePath.split('/').pop();
  if (!filename) return null;

  for (const [path, module] of Object.entries(images)) {
    if (path.endsWith(`/${filename}`)) {
      return module.default;
    }
  }

  return null;
}
