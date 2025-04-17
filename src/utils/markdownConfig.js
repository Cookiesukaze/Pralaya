import MarkdownIt from 'markdown-it';
import highlightjs from 'markdown-it-highlightjs';
import 'highlight.js/styles/github.css';

const md = new MarkdownIt({
  html: true,
  breaks: true,
  linkify: true,
  typographer: true
}).use(highlightjs, {
  inline: true
});

export default md;
