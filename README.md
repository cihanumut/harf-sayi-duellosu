# Bir Kelime Bir İşlem

Klasik TV yarışması formatında bir web oyunu. İki tur:

- **Kelime turu:** verilen 9 harften en uzun geçerli Türkçe kelimeyi bul (30 sn).
- **Sayı turu:** verilen 6 sayı ve dört işlemle hedef sayıya ulaş (45 sn).

**Offline** (bilgisayara karşı ya da aynı ekranda 2 kişi) ve **online** (oda kodu ile
uzaktan 2 oyuncu) oynanabilir.

## Kurulum

```bash
npm install
npm run wordlist   # Türkçe kelime listesini indirip shared/data/words.json üretir
```

> `words.json` depoya dahil edilmez; ilk kurulumda `npm run wordlist` ile üretilir.

## Çalıştırma

```bash
npm run dev        # client (http://localhost:5173) + server (http://localhost:3001) birlikte
```

Sadece biri:

```bash
npm run dev:client
npm run dev:server
```

## Test

```bash
npm test           # shared/ çekirdek mantığı (çözücü, puanlama, kelime doğrulama)
```

## Yapı

```
shared/   Ortak saf mantık: harf üretimi, sayı çözücü, kelime doğrulama, puanlama (+ testler)
client/   Vite + React arayüz (offline oyun mantığı + online socket istemcisi)
server/   Express + Socket.io — online oda yönetimi, tur senkronu, puanlama
scripts/  build-wordlist.mjs — kelime listesini indirir/normalize eder
```

## Puanlama

- **Kelime:** geçerli kelimenin harf sayısı kadar puan (geçersiz = 0).
- **Sayı:** hedefe tam isabet = 10, ±5 = 7, ±10 = 5, aksi halde 0.

## Online modu internete açmak

Geliştirmede sunucu `localhost`'ta çalışır (aynı makine/ağ). Farklı yerlerdeki iki oyuncunun
oynaması için `server/` bir buluta (Render, Railway, Fly.io vb.) deploy edilmeli ve client'ta
`VITE_SERVER_URL` ortam değişkeni o adrese ayarlanmalıdır.

## Kelime listesi kaynağı

[CanNuhlar/Turkce-Kelime-Listesi](https://github.com/CanNuhlar/Turkce-Kelime-Listesi)
(TDK imla kılavuzundan derlenmiş, ~59 bin kelime normalize edilir).
