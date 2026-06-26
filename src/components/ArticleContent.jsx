import WordToken from "./WordToken";

function findSentence(paragraph, word) {
  const sentences = paragraph.split(/(?<=[.!?])\s+/);
  const found = sentences.find(s => 
    s.toLowerCase().includes(word.toLowerCase())
  );
  return found || paragraph;
}

function renderParagraph(text, activeWord, onWordClick) {
  const tokens = text.split(/(\s+)/);

  return tokens.map((token, index) => {
    if (!token.trim()) {
      return <span key={index}>{token}</span>;
    }

    const normalized = token.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
    const isWord = /^[a-zA-Z'-]+$/.test(token.replace(/[^a-zA-Z'-]/g, ""));

    if (!isWord) {
      return <span key={index}>{token}</span>;
    }

    return (
      <WordToken
        key={index}
        word={token}
        isActive={normalized === activeWord?.toLowerCase()}
        onClick={() => onWordClick?.(normalized, findSentence(text, normalized))}
      />
    );
  });
}

function extractContent(htmlContent) {
  if (!htmlContent) return [];
  const div = document.createElement('div');
  div.innerHTML = htmlContent;

  const items = [];

  function processNode(node) {
    if (node.nodeName === 'P') {
      const text = node.textContent.trim();
      if (text.length > 0) {
        items.push({ type: 'paragraph', text });
      }
    } else if (node.nodeName === 'IMG') {
      items.push({ type: 'image', src: node.src, alt: node.alt || '' });
    } else if (node.nodeName === 'H2' || node.nodeName === 'H3') {
      const text = node.textContent.trim();
      if (text.length > 0) {
        items.push({ type: 'heading', level: node.nodeName, text });
      }
    } else {
      node.childNodes.forEach(processNode);
    }
  }

  div.childNodes.forEach(processNode);
  return items;
}

function ArticleContent({
  source,
  readTime,
  title,
  content,
  paragraphs,
  activeWord,
  onWordClick,
}) {

  
  const items = paragraphs
    ? paragraphs.map(text => ({ type: 'paragraph', text }))
    : extractContent(content);

    return (
      <article>
        <p className="text-sm text-neutral-500">{source}</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight">{title}</h1>
        <div className="mt-8 space-y-6 text-base leading-relaxed text-neutral-200 text-left">
          {items.map((item, index) => {
            if (item.type === 'paragraph') {
              return (
                <p key={index}>
                  {item.text ? renderParagraph(item.text, activeWord, onWordClick) : null}
                </p>
              );
            }
            if (item.type === 'image') {
              return (
                <img
                  key={index}
                  src={item.src}
                  alt={item.alt}
                  className="w-full rounded-xl object-cover my-4"
                />
              );
            }
            if (item.type === 'heading') {
              return item.level === 'H2'
                ? <h2 key={index} className="text-2xl font-semibold text-white mt-8">{item.text}</h2>
                : <h3 key={index} className="text-xl font-semibold text-white mt-6">{item.text}</h3>;
            }
            return null;
          })}
        </div>
      </article>
    );
}

export default ArticleContent;
