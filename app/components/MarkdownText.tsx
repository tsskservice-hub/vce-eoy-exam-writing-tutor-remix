import { marked } from "marked";

// propsの型定義を追加
interface MarkdownTextProps {
  content: string;
}

// 改行を保持しつつ、マークダウンをHTMLに変換する関数
export function MarkdownText({ content }: MarkdownTextProps) {
  // marked.parse を使ってマークダウンを HTML 文字列に変換
  // (breaks: true を設定すると、JSON内の改行もそのまま <br> に反映されます)
  const htmlContent = marked.parse(content, { breaks: true });

  return (
    <div
      // Remix / React で安全にHTMLを描画するためのプロパティ
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}