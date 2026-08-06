# GERÇEKLİK OYUNU (RRP - Reality Circulation Game)

> **"Masaya yalnızca nesnel gerçeklikte karşılığı olan şeyler konur."**

Gerçeklik Oyunu (RRP), bireylerin ve kolektiflerin gerçek dünyada karşılığı olan işlerini, projelerini, ilişkilerini ve enerji dağılımlarını masa üzerinde ve dijital ortamda görünür hale getiren modüler bir düzenleme ve okuma sistemidir.

Bu bir strateji veya rol yapma oyunu değildir; gerçekliğin masaya zorlandığı nesnel bir düzenleme yüzeyidir.

---

## 📌 İçindekiler
1. [Manifesto & Temel İlke](#-manifesto--temel-i̇lke)
2. [Sistem Kuralları & Mekanikler](#-sistem-kuralları--mekanikler)
   - [Kart Sistemi (Kümeler)](#1-kart-sistemi-kümeler)
   - [Coin ve Ring Sistemi](#2-coin-ve-ring-sistemi)
   - [Ok Kartları ve Durum Çerçeveleri](#3-ok-kartları-ve-durum-çerçeveleri)
   - [Masa Okuma ve Sessizleşme](#4-masa-okuma-ve-sessizleşme)
3. [AI Ajan & Dijital Uygulama Mimarisi](#-ai-ajan--dijital-uygulama-mimarisi)
4. [Mikro Metinler & Ontolojik İlkeler](#-mikro-metinler--ontolojik-i̇lkeler)
5. [Geliştirme & Güncelleme Notları](#-geliştirme--güncelleme-notları)

---

## 📜 Manifesto & Temel İlke

- **Para, Söz ve Gerçeklik:** RRP, paranın tarihsel olarak üstlendiği ancak zamanla kaybettiği gerçeklik bağını yeniden kurmayı hedefler. Emeği ve sözü yalnızca parasal karşılık üzerinden değil, gerçek dünyada bıraktığı somut iz üzerinden görünür kılar.
- **Kooperatif Yapı:** Tarım, sanat, zanaat, yazılım, ekoloji, bakım emeği ve gündelik yaşam pratikleri bu ağa dahil olabilir. Katılımcılar soyut vaatlerle değil, ellerindeki somut varlıklar ve emekle sisteme katılır.
- **Heykel Düşüncesi ve Yaşamsal Koşullar:** Sistem; hava, su, gıda, barınma, enerji ve bakım gibi yaşamsal koşulları odağına alır.

---

## ⚙️ Sistem Kuralları & Mekanikler

### 1. Kart Sistemi (Kümeler)

Kartlar nesnel gerçeklikteki yapıları ve boyutları temsil eder:

| Kart Türü | Boyut & Renk | Temsil Ettiği Yapı | Örnekler |
| :--- | :--- | :--- | :--- |
| **Siyah Kartlar** | **XL** (En Büyük) | Zemin, Çerçeve, Pano, Takvim, Kural | Olanaklar, Hedefler, Oyun Kuralları |
| **Kırmızı Kartlar** | **L** (Büyük) | Ana Yapılar, Organizasyonlar | Ekip Yapıları, Ana Projeler, Atölye Kompleksleri |
| **Mavi / Yeşil Kartlar** | **M** (Orta) | Alanlar, Atölyeler, Ağlar, Sistemler | Dijital Atölye, Bahçecilik, Otomasyon |
| **Yeşil Kartlar** | **S** (Küçük) | Somut Çıktılar, Ürünler, Tekil Üretimler | Yazılım, Merhem, 3D Baskı Obje, Şarap |

*Yazım Kuralı: ANAHTAR KELİME büyük harfle, alt açıklamalar küçük harfle yazılır.*

---

### 2. Coin ve Ring Sistemi

* **Özne Coini (30mm):** Bir kişiyi temsil eder. Öznenin aynı anda kaç farklı karta enerji ayırdığını gösterir.
* **Mekân Coini (60mm):** Bir mekânı, altyapıyı veya sabit yaşam alanını temsil eder.

#### Ring Sistemi (Uğraş Türleri):
* 🔴 **Kırmızı Ring (Mutfak / Üretim):** 
  * *Açık Ton:* İşi bizzat yapmak.
  * *Koyu Ton:* Üretimi yönetmek / organize etmek.
* 🟣 **Mor Ring (Servis / Sunum / Dolaşım):** 
  * *Açık Ton:* Servis/sunum yapmak.
  * *Koyu Ton:* Dolaşım sürecini yönetmek.

---

### 3. Ok Kartları ve Durum Çerçeveleri

* **Ok Kartları (İlişkiler):** Öğeler arasındaki yönlü bağları tanımlar (*Görev, Yol, Yöntem, Amaç, Fikir, Sonuç*).
* **Durum Çerçeveleri:**
  * 🟢 **Hazır:** İşlevsel ve kullanıma uygun.
  * 🔵 **Süreçte:** Üretimi veya çalışması aktif olarak devam ediyor.
  * ⚪ **Kapalı:** Şu an odakta değil / askıda.
  * 🔴 **Gerçeklik Sınırında:** Somutlaşma aşamasında olan sınır öğe.

---

### 4. Masa Okuma ve Sessizleşme

* Coin varsa ➔ **Aktif Uğraş**
* Ring varsa ➔ **Net Rol/Yönetim**
* Ok varsa ➔ **İşlevsel Akış**
* Çerçeve varsa ➔ **Güncel Durum**
* Uzun süre etkileşim almayan kartlar **Sessiz Kart** kabul edilir ve masadan kaldırılabilir veya askıya alınabilir.

---

## 🤖 AI Ajan & Dijital Uygulama Mimarisi

Dijital uygulamada Gemini altyapısıyla entegre çalışan iki temel AI ajan bulunur:

1. **Senaryo Birleştirici Ajan (Data Merging):** İki farklı oyuncu veya ekibin RRP JSON verilerini çapraz analiz ederek ortak kullanılabilecek atölyeleri, atıl kapasiteleri ve ortak üretim alanlarını tespit eder.
2. **Hamle Standartlaştırıcı Ajan (Moderasyon):** Canlı oturumlarda verileri kart hiyerarşisine dönüştürür, soyut niyetleri ayıklar ve yerleşimi standart JSON/PNG çıktılarına dönüştürür.

---

## 💬 Mikro Metinler & Ontolojik İlkeler

* **Sistem Tanımı:** Bu bir oyun değil, bir yüzeydir. Yapı sabit, içerik senin. Aç–bak–anla.
* **Ontolojik İlke:** Masada olan şey, orada olandır. Bu masa, olanın kendisini talep eder.
* **Özne:** Özne, ilgilendiği yerde belirir.
* **Sınır:** Sınır, yasak değil; tanımdır.

---

## 📝 Geliştirme & Güncelleme Notları

Proje geliştirildikçe sürüm notları ve değişiklikler bu bölümde güncellenmektedir.

### v1.0.0
* Bütünleşik Sistem Dokümantasyonu (Manifesto ve Kullanım Kılavuzu) entegre edildi.
* A4-A7 kart hiyerarşisi, coin/ring mekanikleri ve durum çerçeveleri tanımlandı.
* Web arayüzü ve JSON veri formatı şablonu oluşturuldu.
