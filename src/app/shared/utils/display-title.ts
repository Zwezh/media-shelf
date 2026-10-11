export function displayTitle(media: { title: string; originalTitle: string } | null | undefined, language: string): string {
  if (!media) return '';
  return language === 'ru' ? media.title || media.originalTitle : media.originalTitle || media.title;
}
