export const processHtml = (html?: string | null) => {
  if (!html) return '';
  return html
    .replace(
      /<pre class="ql-syntax" spellcheck="false">(.*?)<\/pre>/gs,
      (content) => {
        const decoded = content
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&")
          .replace(/&nbsp;/g, " ");
        return decoded;
      }
    )
    .replace(/<code>&lt;br \/&gt;<\/code>/g, "<br />")
    .replace(/&lt;br \/&gt;/g, "<br />")
    .replace(/\r\n/g, "<br />")
    .replace(/\n/g, "<br />")
    .replace(/\/n/g, "<br />")
    .replace(/\\n/g, "<br />");
};
