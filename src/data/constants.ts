import { CardSize, CoinSize, FrameStatus, RingType, ProjectData } from '../types';

export const CARD_CONFIGS: Record<CardSize, { width: number; height: number; defaultTitle: string; defaultColor: string; defaultBg: string; borderAccent: string; label: string; desc: string }> = {
  XL: {
    width: 220,
    height: 140,
    defaultTitle: 'PANO',
    defaultColor: '#111827',
    defaultBg: '#080a0f',
    borderAccent: '#4b5563',
    label: 'XL Siyah Kart',
    desc: 'Zemin, Çerçeve, Pano, Takvim, Kural (220x140)'
  },
  L: {
    width: 180,
    height: 120,
    defaultTitle: 'ANA YAPI',
    defaultColor: '#dc2626',
    defaultBg: '#180808',
    borderAccent: '#ef4444',
    label: 'L Kırmızı Kart',
    desc: 'Ana Yapılar, Organizasyonlar, Ekip Yapıları (180x120)'
  },
  M: {
    width: 160,
    height: 100,
    defaultTitle: 'ATÖLYE & ALAN',
    defaultColor: '#1d4ed8',
    defaultBg: '#081022',
    borderAccent: '#3b82f6',
    label: 'M Mavi Kart',
    desc: 'Alanlar, Atölyeler, Ağlar, Sistemler (160x100)'
  },
  S: {
    width: 130,
    height: 80,
    defaultTitle: 'SOMUT ÜRÜN',
    defaultColor: '#16a34a',
    defaultBg: '#052210',
    borderAccent: '#22c55e',
    label: 'S Yeşil Kart',
    desc: 'Somut Çıktılar, Ürünler, Tekil Üretimler (130x80)'
  }
};

export const COIN_CONFIGS: Record<CoinSize, { size: number; defaultTitle: string; defaultBg: string; label: string; desc: string }> = {
  SMALL: {
    size: 54,
    defaultTitle: 'ÖZNE COİNİ',
    defaultBg: '#0f172a',
    label: 'Özne Coini (30mm)',
    desc: 'Aktör, insan, çalışan veya sorumlu kişi'
  },
  BIG: {
    size: 84,
    defaultTitle: 'MEKÂN COİNİ',
    defaultBg: '#030712',
    label: 'Mekân Coini (60mm)',
    desc: 'Fiziksel mekân, ortam, altyapı veya konum'
  }
};

export const FRAME_STATUS_CONFIGS: Record<FrameStatus, { label: string; color: string; desc: string; badgeBg: string }> = {
  NONE: { label: 'Standart', color: '#4b5563', desc: 'Standart çerçeve', badgeBg: '#1f2937' },
  READY: { label: '🟢 Hazır', color: '#22c55e', desc: 'İşlevsel ve kullanıma uygun durumda', badgeBg: '#052e16' },
  IN_PROGRESS: { label: '🔵 Süreçte', color: '#3b82f6', desc: 'Aktif olarak üretimi veya çalışması devam ediyor', badgeBg: '#172554' },
  CLOSED: { label: '⚪ Kapalı', color: '#9ca3af', desc: 'Şu an odakta değil veya askıda', badgeBg: '#111827' },
  REALITY_LIMITS: { label: '🔴 Gerçeklik Sınırında', color: '#ef4444', desc: 'Somutlaşma aşamasında olan sınır öğe', badgeBg: '#450a0a' }
};

export const RING_CONFIGS: Record<
  RingType,
  {
    label: string;
    lightColor: string;
    darkColor: string;
    lightLabel: string;
    darkLabel: string;
    desc: string;
  }
> = {
  NONE: {
    label: 'Halka Yok',
    lightColor: 'transparent',
    darkColor: 'transparent',
    lightLabel: 'Yok',
    darkLabel: 'Yok',
    desc: 'Halka takılmamış'
  },
  KITCHEN: {
    label: '🔴 Mutfak (Üretim) – Açık Kırmızı',
    lightColor: '#ef4444',
    darkColor: '#b91c1c',
    lightLabel: 'Mutfak / Bizzat Üretmek',
    darkLabel: 'Açık Kırmızı Ton',
    desc: 'Bizzat mutfakta üretmek, imalat yapmak'
  },
  LOGISTICS: {
    label: '🍷 Mutfak Yönetimi (Tedarik) – Koyu Kırmızı',
    lightColor: '#b91c1c',
    darkColor: '#7f1d1d',
    lightLabel: 'Mutfak Yönetimi / Tedarik',
    darkLabel: 'Koyu Kırmızı / Bordo Ton',
    desc: 'Mutfak yönetimini üstlenmek, tedarik ve nakliye'
  },
  SERVICE: {
    label: '🟣 Servis (Dolaşım) – Açık Mor',
    lightColor: '#c084fc',
    darkColor: '#7e22ce',
    lightLabel: 'Servis / Dolaşım Yapmak',
    darkLabel: 'Açık Mor / Leylak Ton',
    desc: 'Müşteri teması, servis, sunum ve dolaşım'
  },
  MANAGEMENT: {
    label: '🟪 Servis Yönetimi (Strateji) – Koyu Mor',
    lightColor: '#7e22ce',
    darkColor: '#581c87',
    lightLabel: 'Servis Yönetimi / Strateji',
    darkLabel: 'Koyu Mor / Mürdüm Ton',
    desc: 'Servis sürecini yönetmek, strateji ve denetim'
  }
};

export const SAMPLE_PROJECT: ProjectData = {
  id: 'rrp-full-sample-map',
  name: 'RRP Gerçeklik Oyunu – Tam Senaryo Haritası',
  description: 'Gerçeklik Oyunu (RRP) Kullanma Kılavuzundaki tam adımlı zemin, yapı, alan, ürün ve coin yerleşim örneği.',
  updatedAt: new Date().toISOString(),
  items: [
    /* 1. ZEMİN KARTLARI (Siyah XL) */
    {
      id: 'card-pano',
      type: 'CARD',
      size: 'XL',
      x: 60,
      y: 60,
      width: 220,
      height: 140,
      title: 'PANO',
      description: 'Olanaklar, portfolyolar ve zemin panosu',
      categoryTag: 'ZEMİN',
      frameStatus: 'READY',
      colorHex: '#4b5563',
      bgHex: '#080a0f',
      zIndex: 1
    },
    {
      id: 'card-takvim',
      type: 'CARD',
      size: 'XL',
      x: 310,
      y: 60,
      width: 220,
      height: 140,
      title: 'TAKVİM',
      description: 'Projeler, takvimsel etkinlikler ve zaman',
      categoryTag: 'SÜREÇ',
      frameStatus: 'IN_PROGRESS',
      colorHex: '#4b5563',
      bgHex: '#080a0f',
      zIndex: 2
    },
    {
      id: 'card-kural',
      type: 'CARD',
      size: 'XL',
      x: 560,
      y: 60,
      width: 220,
      height: 140,
      title: 'KURAL',
      description: 'Gerçeklik sınırları ve oyun kuralları',
      categoryTag: 'İLKELER',
      frameStatus: 'READY',
      colorHex: '#4b5563',
      bgHex: '#080a0f',
      zIndex: 3
    },

    /* 2. ANA YAPILAR (Kırmızı L) */
    {
      id: 'card-omanacrew',
      type: 'CARD',
      size: 'L',
      x: 60,
      y: 240,
      width: 180,
      height: 120,
      title: 'OMANACREW',
      description: 'Ekip yapısı ve ortak yetiler',
      categoryTag: 'EKİP',
      frameStatus: 'READY',
      colorHex: '#dc2626',
      bgHex: '#180808',
      zIndex: 4
    },
    {
      id: 'card-hamleci',
      type: 'CARD',
      size: 'L',
      x: 270,
      y: 240,
      width: 180,
      height: 120,
      title: 'HAMLECİ KONAĞI',
      description: 'Atölye kompleksi ve konak restorasyonu',
      categoryTag: 'MERKEZ',
      frameStatus: 'IN_PROGRESS',
      colorHex: '#dc2626',
      bgHex: '#180808',
      zIndex: 5
    },
    {
      id: 'card-kiwina',
      type: 'CARD',
      size: 'L',
      x: 480,
      y: 240,
      width: 180,
      height: 120,
      title: 'KIWINA PRODUCTION',
      description: 'Hizmetler ve etkinlik organizasyonu',
      categoryTag: 'ORGANİZASYON',
      frameStatus: 'READY',
      colorHex: '#dc2626',
      bgHex: '#180808',
      zIndex: 6
    },

    /* 3. ALANLAR VE SİSTEMLER (Mavi M) */
    {
      id: 'card-atelier-dijital',
      type: 'CARD',
      size: 'M',
      x: 60,
      y: 400,
      width: 160,
      height: 100,
      title: 'ATELIER OF DİJİTAL',
      description: 'Dijital tasarım ve yazılım atölyesi',
      categoryTag: 'ATÖLYE',
      frameStatus: 'IN_PROGRESS',
      colorHex: '#1d4ed8',
      bgHex: '#081022',
      zIndex: 7
    },
    {
      id: 'card-king-extract',
      type: 'CARD',
      size: 'M',
      x: 240,
      y: 400,
      width: 160,
      height: 100,
      title: 'KING OF EXTRACT',
      description: 'Doğal özütleme ve ekstraksiyon alanı',
      categoryTag: 'SİSTEM',
      frameStatus: 'READY',
      colorHex: '#1d4ed8',
      bgHex: '#081022',
      zIndex: 8
    },
    {
      id: 'card-bahceculuk',
      type: 'CARD',
      size: 'M',
      x: 420,
      y: 400,
      width: 160,
      height: 100,
      title: 'BAHÇECİLİK',
      description: 'Permakültür ve yerel tarım bahçesi',
      categoryTag: 'ÜRETİM',
      frameStatus: 'IN_PROGRESS',
      colorHex: '#1d4ed8',
      bgHex: '#081022',
      zIndex: 9
    },

    /* 4. SOMUT ÜRÜNLER (Yeşil S) */
    {
      id: 'card-mapping',
      type: 'CARD',
      size: 'S',
      x: 60,
      y: 530,
      width: 130,
      height: 80,
      title: 'MAPPING',
      description: 'Görsel projeksiyon gösterisi',
      categoryTag: 'ÇIKTI',
      frameStatus: 'READY',
      colorHex: '#16a34a',
      bgHex: '#052210',
      zIndex: 10
    },
    {
      id: 'card-tentur',
      type: 'CARD',
      size: 'S',
      x: 210,
      y: 530,
      width: 130,
      height: 80,
      title: 'TENTÜR',
      description: 'Konsantre bitkisel sıvı',
      categoryTag: 'ÜRÜN',
      frameStatus: 'READY',
      colorHex: '#16a34a',
      bgHex: '#052210',
      zIndex: 11
    },
    {
      id: 'card-sarap',
      type: 'CARD',
      size: 'S',
      x: 360,
      y: 530,
      width: 130,
      height: 80,
      title: 'ŞARAP',
      description: 'Yerel fermantasyon üretimi',
      categoryTag: 'ÜRÜN',
      frameStatus: 'REALITY_LIMITS',
      colorHex: '#16a34a',
      bgHex: '#052210',
      zIndex: 12
    },

    /* 5. COİNLER (Özne 30mm, Mekân 60mm) */
    {
      id: 'coin-ozne-1',
      type: 'COIN',
      size: 'SMALL',
      x: 610,
      y: 410,
      width: 54,
      height: 54,
      title: 'ÖZNE (Ahmet)',
      description: 'Aktör bizzat mutfakta üretir',
      frameStatus: 'NONE',
      ringType: 'KITCHEN',
      bgHex: '#0f172a',
      zIndex: 13
    },
    {
      id: 'coin-mekan-konak',
      type: 'COIN',
      size: 'BIG',
      x: 610,
      y: 500,
      width: 84,
      height: 84,
      title: 'HAMLECİ KONAĞI MEKÂN',
      description: 'Fiziksel atölye alanı',
      frameStatus: 'NONE',
      ringType: 'SERVICE',
      bgHex: '#030712',
      zIndex: 14
    }
  ],
  edges: [
    {
      id: 'edge-1',
      fromId: 'card-pano',
      toId: 'card-omanacrew',
      label: 'GÖREV',
      color: '#3b82f6',
      isDashed: false
    },
    {
      id: 'edge-2',
      fromId: 'card-omanacrew',
      toId: 'card-atelier-dijital',
      label: 'YOL',
      color: '#3b82f6',
      isDashed: false
    },
    {
      id: 'edge-3',
      fromId: 'card-atelier-dijital',
      toId: 'card-mapping',
      label: 'YÖNTEM',
      color: '#3b82f6',
      isDashed: false
    },
    {
      id: 'edge-4',
      fromId: 'card-king-extract',
      toId: 'card-tentur',
      label: 'SONUÇ',
      color: '#3b82f6',
      isDashed: false
    },
    {
      id: 'edge-5',
      fromId: 'coin-ozne-1',
      toId: 'card-hamleci',
      label: 'SORUMLU',
      color: '#3b82f6',
      isDashed: false
    },
    {
      id: 'edge-6',
      fromId: 'card-hamleci',
      toId: 'coin-mekan-konak',
      label: 'ORTAM',
      color: '#3b82f6',
      isDashed: true
    }
  ]
};

