import React from 'react';

// A lightweight renderer to avoid heavy dependencies for this demo
// Handles Headers, Bold, and Lists
export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];

  lines.forEach((line, index) => {
    const key = `line-${index}`;
    
    // H2
    if (line.startsWith('## ')) {
      if (inList) {
        elements.push(<ul key={`${key}-list`} className="list-disc pl-5 mb-4 space-y-2 text-slate-300">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      elements.push(<h2 key={key} className="text-xl font-bold text-emerald-400 mt-6 mb-3">{line.replace('## ', '')}</h2>);
      return;
    }
    
    // H3
    if (line.startsWith('### ')) {
      if (inList) {
        elements.push(<ul key={`${key}-list`} className="list-disc pl-5 mb-4 space-y-2 text-slate-300">{listItems}</ul>);
        listItems = [];
        inList = false;
      }
      elements.push(<h3 key={key} className="text-lg font-semibold text-emerald-200 mt-4 mb-2">{line.replace('### ', '')}</h3>);
      return;
    }

    // Bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      inList = true;
      const cleanLine = line.trim().replace(/^[-*]\s+/, '');
      listItems.push(
        <li key={key}>
          <span dangerouslySetInnerHTML={{ __html: formatBold(cleanLine) }} />
        </li>
      );
      return;
    }

    // Paragraphs / Normal text
    if (line.trim().length > 0) {
      if (inList) {
         elements.push(<ul key={`${key}-list`} className="list-disc pl-5 mb-4 space-y-2 text-slate-300">{listItems}</ul>);
         listItems = [];
         inList = false;
      }
      elements.push(
        <p key={key} className="mb-3 leading-relaxed text-slate-300" dangerouslySetInnerHTML={{ __html: formatBold(line) }} />
      );
    }
  });

  if (inList) {
    elements.push(<ul key="final-list" className="list-disc pl-5 mb-4 space-y-2 text-slate-300">{listItems}</ul>);
  }

  return <div className="markdown-content">{elements}</div>;
};

const formatBold = (text: string) => {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>');
};