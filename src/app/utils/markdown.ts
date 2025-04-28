import showdown from "showdown";

export function markdownToHtml(markdown: string | null): string {
  if (!markdown) {
    return "";
  }

  const converter = new showdown.Converter();
  return converter.makeHtml(markdown);
}
