import { useEffect } from 'react';

// Hides the document (html/body) vertical scrollbar while the component is mounted.
// Use locally in pages that should rely solely on the app layout <main> scrollbar.
export function useHideDocumentScrollbar() {
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const prevBodyOverflowY = body.style.overflowY;
    const prevHtmlOverflowY = html.style.overflowY;

    body.style.overflowY = 'hidden';
    html.style.overflowY = 'hidden';

    return () => {
      body.style.overflowY = prevBodyOverflowY;
      html.style.overflowY = prevHtmlOverflowY;
    };
  }, []);
}
