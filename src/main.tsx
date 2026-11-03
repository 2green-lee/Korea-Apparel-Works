import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {lazy, Suspense} from 'react';
import App from './App.tsx';

// 협력 업체 답변 링크(/reply/:token)는 사이트 본체 없이 답변 폼만 띄운다
const SupplierReplyPage = lazy(() => import('./components/SupplierReplyPage.tsx'));
const replyToken = window.location.pathname.match(/^\/reply\/([A-Za-z0-9_-]+)\/?$/)?.[1];
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/300.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/raleway/200.css';
import '@fontsource/raleway/300.css';
import '@fontsource/raleway/400.css';
import '@fontsource/raleway/700.css';
import '@fontsource/plus-jakarta-sans/300.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/700.css';
import '@fontsource/plus-jakarta-sans/800.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {replyToken ? (
      <Suspense fallback={null}>
        <SupplierReplyPage token={replyToken} />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
);
