import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Yeni sürüm önbelleklenir önbelleklenmez otomatik devreye alınıp sayfa
// yenilensin diye; ayrıca uygulama her ön plana geldiğinde yeni sürüm
// var mı diye kontrol edilsin (varsayılan tarayıcı kontrolü 24 saatte bir
// yapıldığı için, güncelleme kurulup açılsa bile eski tasarım günlerce
// önbellekten gösterilmeye devam edebiliyordu).
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateSW(true);
  },
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    registration.update();
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') registration.update();
    });
  },
});
