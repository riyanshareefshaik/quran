'use client';

import React, { useMemo } from 'react';

// Renders HTML from a trusted-but-external source (Quran.com tafsir) without
// dangerouslySetInnerHTML: the markup is parsed, only simple formatting tags
// are kept, and every attribute (links, styles, event handlers) is dropped.
const ALLOWED: Record<string, string> = {
    h1: 'h3', h2: 'h3', h3: 'h4', h4: 'h4', h5: 'h4', h6: 'h4',
    p: 'p', br: 'br', b: 'strong', strong: 'strong', i: 'em', em: 'em',
    ul: 'ul', ol: 'ol', li: 'li', blockquote: 'blockquote', sup: 'sup', sub: 'sub', span: 'span', div: 'div',
};

function toReact(node: Node, key: number): React.ReactNode {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent;
    if (node.nodeType !== Node.ELEMENT_NODE) return null;
    const el = node as Element;
    const tag = ALLOWED[el.tagName.toLowerCase()];
    if (['script', 'style', 'iframe', 'object', 'embed', 'template'].includes(el.tagName.toLowerCase())) return null;
    const children = Array.from(el.childNodes).map((c, i) => toReact(c, i));
    if (!tag) return <React.Fragment key={key}>{children}</React.Fragment>;
    if (tag === 'br') return <br key={key} />;
    // dir="auto" lets Arabic quotations inside English tafsir read right-to-left.
    return React.createElement(tag, { key, dir: 'auto' }, children);
}

const SafeHtml: React.FC<{ html: string; className?: string }> = ({ html, className }) => {
    const content = useMemo(() => {
        if (typeof DOMParser === 'undefined') return null;
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return Array.from(doc.body.childNodes).map((n, i) => toReact(n, i));
    }, [html]);
    return <div className={className}>{content}</div>;
};

export default SafeHtml;
