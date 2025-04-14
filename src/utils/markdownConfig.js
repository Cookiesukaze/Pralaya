import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css'; // 使用 GitHub 风格的代码高亮样式

// 配置 marked 使用 highlight.js 进行代码高亮
marked.setOptions({
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-', // 添加到 <code> 块的 CSS 类前缀
  gfm: true, // 启用 GitHub 风格的 Markdown
  breaks: true, // 将换行符转换为 <br>
  headerIds: true, // 为标题生成 ID
  mangle: false // 不转义标题中的内容
});

export default marked;
