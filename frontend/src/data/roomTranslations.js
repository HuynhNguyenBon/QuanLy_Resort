export const ROOM_TRANSLATIONS = {
  en: {
    Bali: {
      roomType: "Bali Room",
      roomDescription:
        "A modern Bali-style retreat featuring a private pool area, luxury wooden furniture and a balcony overlooking the resort.",
    },
    Queen: {
      roomType: "Queen Room",
      roomDescription:
        "A stylish Boutique Queen room with warm ambient lighting, premium velvet seating and sophisticated décor perfect for couples.",
    },
    King: {
      roomType: "King Room",
      roomDescription:
        "A tropical Luxury King Room featuring an exotic jungle-themed décor, premium king-size bed and a spacious open layout.",
    },
    Standrad: {
      roomType: "Standard Room",
      roomDescription:
        "A cozy Standard Double Queen Room featuring vibrant orange bedding, full amenities and a comfortable design for every guest.",
    },
    Studio: {
      roomType: "Studio Room",
      roomDescription:
        "An ultra-chic Luxury Studio Suite featuring rose gold metallic accents, open-plan living and top-tier modern amenities.",
    },
    Suit: {
      roomType: "Suite Room",
      roomDescription:
        "A contemporary Executive Suite featuring a low-profile platform bed, sleek furnishings and a dedicated living area.",
    },
    Family: {
      roomType: "Family Room",
      roomDescription:
        "A playful Kid-Friendly Family Suite featuring multiple large beds, shared living space and child-friendly amenities.",
    },
    Executive: {
      roomType: "Executive Room",
      roomDescription:
        "An Executive room tailored for business travelers with a dedicated workspace, high-speed internet and priority room service.",
    },
    Precidential: {
      roomType: "Presidential Room",
      roomDescription:
        "A top-tier Presidential Room with panoramic views, designer furnishings, a private pool and 24/7 personal butler service.",
    },
  },
  vi: {
    Bali: {
      roomType: "Phòng Bali",
      roomDescription:
        "Phòng nghỉ phong cách Bali hiện đại với khu vực hồ bơi riêng, nội thất gỗ sang trọng và ban công nhìn ra khu resort.",
    },
    Queen: {
      roomType: "Phòng Queen",
      roomDescription:
        "Phòng Boutique Queen phong cách với ánh đèn ấm áp, ghế nhung cao cấp và thiết kế tinh tế phù hợp cho các cặp đôi.",
    },
    King: {
      roomType: "Phòng King",
      roomDescription:
        "Phòng King Studio hiện đại với giường đầu bảng bọc da sang trọng, décor tối giản cao cấp và không gian rộng rãi.",
    },
    Standrad: {
      roomType: "Phòng Standard",
      roomDescription:
        "Phòng tiêu chuẩn tiện nghi đầy đủ, thiết kế gọn gàng và thoải mái, phù hợp cho mọi đối tượng khách hàng.",
    },
    Studio: {
      roomType: "Phòng Studio",
      roomDescription:
        "Phòng Studio đa năng với không gian mở, nội thất linh hoạt và tiện nghi hiện đại, lý tưởng cho lưu trú ngắn hạn.",
    },
    Suit: {
      roomType: "Phòng Suite",
      roomDescription:
        "Phòng Suite cao cấp với phòng khách riêng, nội thất hạng sang và dịch vụ butler cá nhân.",
    },
    Family: {
      roomType: "Phòng Gia Đình",
      roomDescription:
        "Phòng gia đình rộng rãi thiết kế cho 4-6 người, với khu vực sinh hoạt chung thoải mái và tiện ích dành riêng cho trẻ em.",
    },
    Executive: {
      roomType: "Phòng Executive",
      roomDescription:
        "Phòng Executive dành cho doanh nhân với góc làm việc riêng, đường truyền internet tốc độ cao và dịch vụ phòng ưu tiên.",
    },
    Precidential: {
      roomType: "Phòng Presidential",
      roomDescription:
        "Phòng Presidential đẳng cấp với tầm nhìn toàn cảnh, nội thất hàng hiệu, hồ bơi riêng và đội ngũ butler phục vụ 24/7.",
    },
  },
  ja: {
    Bali: {
      roomType: "バリスタイルルーム",
      roomDescription:
        "プライベートプールアクセス付きのモダンなバリスタイルの客室。高級木製家具と美しいリゾートの景色をお楽しみいただけます。",
    },
    Queen: {
      roomType: "クイーンルーム",
      roomDescription:
        "温かみのある照明と高級ベルベットのシーティングを備えたシックなブティッククイーンルーム。カップルに最適です。",
    },
    King: {
      roomType: "キングルーム",
      roomDescription:
        "フルハイトのタフテッドヘッドボードとダークウッドのフローリングを備えたスタイリッシュなモダンキングスタジオ。",
    },
    Standrad: {
      roomType: "スタンダードルーム",
      roomDescription:
        "必要な設備が揃ったスタンダードルーム。コンパクトで快適な空間をご提供します。",
    },
    Studio: {
      roomType: "スタジオルーム",
      roomDescription:
        "オープンスペースと柔軟な家具を備えた多目的スタジオルーム。短期滞在に最適です。",
    },
    Suit: {
      roomType: "スイートルーム",
      roomDescription:
        "独立したリビングルームと高級家具を備えた豪華なスイート。バトラーサービス付き。",
    },
    Family: {
      roomType: "ファミリールーム",
      roomDescription:
        "4〜6名様向けの広々としたファミリールーム。共有リビングエリアとお子様向けアメニティを完備。",
    },
    Executive: {
      roomType: "エグゼクティブルーム",
      roomDescription:
        "ビジネスマン向けのエグゼクティブルーム。専用ワークスペース、高速インターネット、優先ルームサービス付き。",
    },
    Precidential: {
      roomType: "プレジデンシャルルーム",
      roomDescription:
        "パノラマビューとプライベートプールを備えた最高級プレジデンシャルルーム。24時間バトラーサービス付き。",
    },
  },
};

export const getRoomTranslation = (roomType, lang) => {
  return ROOM_TRANSLATIONS[lang]?.[roomType] || null;
};
