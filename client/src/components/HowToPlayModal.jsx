import { useState } from 'react';

export default function HowToPlayModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('word'); // 'word' | 'number' | 'scoring' | 'jokers'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card how-to-play-modal" onClick={(e) => e.stopPropagation()}>
        <div className="how-to-play-modal__header">
          <div className="how-to-play-modal__title-group">
            <h2 className="how-to-play-modal__title">📖 Nasıl Oynanır &amp; Puanlama</h2>
            <p className="how-to-play-modal__sub">Oyun kuralları, puanlama algoritması ve ipuçları</p>
          </div>
          <button className="btn-close" onClick={onClose} title="Kapat">✕</button>
        </div>

        <div className="how-to-play-tabs">
          <button
            className={`how-to-play-tab ${activeTab === 'word' ? 'how-to-play-tab--active' : ''}`}
            onClick={() => setActiveTab('word')}
          >
            🔤 Bir Kelime
          </button>
          <button
            className={`how-to-play-tab ${activeTab === 'number' ? 'how-to-play-tab--active' : ''}`}
            onClick={() => setActiveTab('number')}
          >
            🔢 Bir İşlem
          </button>
          <button
            className={`how-to-play-tab ${activeTab === 'scoring' ? 'how-to-play-tab--active' : ''}`}
            onClick={() => setActiveTab('scoring')}
          >
            🏆 Puanlama
          </button>
          <button
            className={`how-to-play-tab ${activeTab === 'jokers' ? 'how-to-play-tab--active' : ''}`}
            onClick={() => setActiveTab('jokers')}
          >
            🛒 Jokerler
          </button>
        </div>

        <div className="how-to-play-content">
          {activeTab === 'word' && (
            <div className="guide-card stack">
              <h3>🔤 Bir Kelime Turu Kuralları</h3>
              <p>Rastgele seçilen <strong>9 harf</strong> (sesli ve sessiz harfler) kullanılarak oluşturulabilecek en uzun Türkçe kelimeyi türetmeye çalışırsınız.</p>
              
              <ul className="guide-list">
                <li><strong>Harf Seçimi:</strong> 8 sesli/sessiz harf ve 1 adet joker harf (istediğiniz harf yerine kullanılabilen yıldız harf) seçilebilir.</li>
                <li><strong>Kelime Boyutu:</strong> Türetilen kelime en az 2 harfli olmalıdır.</li>
                <li><strong>Sözlük Uyumu:</strong> Kelimenizin puan kazanabilmesi için Türkçe sözlükte geçerli bir kelime olması gerekir.</li>
                <li><strong>Puan Kazanımı:</strong> Geçerli kelimenin puanı harf sayısına eşittir (Örn: 7 harfli kelime = 7 puan).</li>
              </ul>
            </div>
          )}

          {activeTab === 'number' && (
            <div className="guide-card stack">
              <h3>🔢 Bir İşlem Turu Kuralları</h3>
              <p>Rastgele çekilen <strong>6 sayı</strong> ve temel matematiksel işlemler (<code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>) kullanılarak 3 haneli hedef sayıya ulaşılmaya çalışılır.</p>
              
              <ul className="guide-list">
                <li><strong>Sayılar:</strong> 1-3 adet büyük sayı (10, 25, 50, 75, 100) ve küçük sayılar (1-9 arası) çekilir.</li>
                <li><strong>Kullanım:</strong> Çekilen sayılardan her biri en fazla 1 kez kullanılabilir. Bütün sayıları kullanmak zorunlu değildir.</li>
                <li><strong>Tam Sonuç veya En Yakın:</strong> Amaç hedefe tam (fark = 0) ulaşmaktır. Ulaşılamazsa hedefe en yakın sayıyı bulmak puan getirir.</li>
              </ul>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div className="guide-card stack">
              <h3>🏆 Rekabetçi Puanlama Algoritması</h3>
              <p>Bir Kelime Bir İşlem oyununda puanlar turların sonunda şu kurallara göre verilir:</p>

              <div className="scoring-box">
                <h4>🔤 Kelime Turu Puanlama</h4>
                <p>Tur sonunda oyuncular arasında <strong>en uzun geçerli kelimeyi</strong> bulan oyuncu/oyuncular kelimesinin harf sayısı kadar puan kazanır. Daha kısa yazanlar 0 puan alır.</p>
              </div>

              <div className="scoring-box">
                <h4>🔢 Sayı Turu Puanlama Tablosu</h4>
                <p>Hedefe en yakın geçerli sonucu bulan oyuncu/oyuncular aşağıdaki tabloya göre puan kazanır:</p>

                <table className="scoring-table">
                  <thead>
                    <tr>
                      <th>Hedefe Uzaklık (Fark)</th>
                      <th>Kazanılan Puan</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>🎯 Tam Hedef (Fark: 0)</td>
                      <td><strong className="badge-pts">10 Puan</strong></td>
                    </tr>
                    <tr>
                      <td>⚡ 1 - 5 Uzaklık (Fark &le; 5)</td>
                      <td><strong className="badge-pts">7 Puan</strong></td>
                    </tr>
                    <tr>
                      <td>📐 6 - 10 Uzaklık (Fark &le; 10)</td>
                      <td><strong className="badge-pts">5 Puan</strong></td>
                    </tr>
                    <tr>
                      <td>❌ 10'dan fazla uzaklık / Geçersiz</td>
                      <td><strong>0 Puan</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'jokers' && (
            <div className="guide-card stack">
              <h3>🛒 Jokerler &amp; Yardımcı Araçlar</h3>
              <p>Kazanılan 🪙 Coin'ler ile Joker Mağazası'ndan zorlu turlarda size avantaj sağlayacak jokerler satın alabilirsiniz:</p>

              <div className="joker-item-guide">
                <div className="joker-item-guide__icon">💡</div>
                <div className="joker-item-guide__info">
                  <strong>Kelime İpucu (30 🪙)</strong>
                  <p>Mevcut harflerle türetilebilecek en uzun kelimenin harf sayısını ve ilk harfini ipucu olarak gösterir.</p>
                </div>
              </div>

              <div className="joker-item-guide">
                <div className="joker-item-guide__icon">⏱️</div>
                <div className="joker-item-guide__info">
                  <strong>Ek Süre +15sn (20 🪙)</strong>
                  <p>Süreniz tükenirken anında tur sürenize +15 saniye ekler.</p>
                </div>
              </div>

              <div className="joker-item-guide">
                <div className="joker-item-guide__icon">🎯</div>
                <div className="joker-item-guide__info">
                  <strong>İşlem İpucu (25 🪙)</strong>
                  <p>Sayı turunda hedefe ulaşmak için atılması gereken ilk işlem adımını tavsiye eder.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="how-to-play-modal__footer">
          <button className="btn btn--big btn--primary" onClick={onClose}>
            Anladım, Oyuna Dön! 🚀
          </button>
        </div>
      </div>
    </div>
  );
}
