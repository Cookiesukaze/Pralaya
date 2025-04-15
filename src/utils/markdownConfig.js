import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 使用 GitHub 风格的代码高亮样式

// 自定义渲染器
const renderer = new marked.Renderer();

// 增强代码块渲染
renderer.code = function(code, language) {
  const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
  const highlightedCode = hljs.highlight(code, { language: validLanguage }).value;

  return `<pre class="hljs"><code class="language-${validLanguage}">${highlightedCode}</code></pre>`;
};

// 增强链接渲染
renderer.link = function(href, title, text) {
  const titleAttr = title ? `title="${title}"` : '';
  return `<a href="${href}" ${titleAttr} target="_blank" rel="noopener noreferrer" class="link">${text}</a>`;
};

// 增强表格渲染
renderer.table = function(header, body) {
  return `<div class="table-container"><table class="markdown-table">
    <thead>${header}</thead>
    <tbody>${body}</tbody>
  </table></div>`;
};

// 配置 marked 使用自定义渲染器和 highlight.js 进行代码高亮
marked.setOptions({
  renderer: renderer,
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-', // 添加到 <code> 块的 CSS 类前缀
  gfm: true, // 启用 GitHub 风格的 Markdown
  breaks: true, // 将换行符转换为 <br>
  headerIds: true, // 为标题生成 ID
  mangle: false, // 不转义标题中的内容
  pedantic: false, // 不纠结于 CommonMark 规范
  smartLists: true, // 使用更智能的列表行为
  smartypants: true // 使用更智能的标点符号
});

export default marked;
