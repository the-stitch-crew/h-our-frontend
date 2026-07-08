export type Product = {
  id: number;
  name: string;
  category: "Bag" | "Wallet" | "Belt" | "Accessory";
  price: number;
  thumbnail: string;
  images: string[];
  summary: string;
  description: string;
  status: "ACTIVATED" | "SOLD_OUT";
  isMain: boolean;
  stock: number;
  option: string;
};

export const categoryImages = {
  Bag: "https://hourleather.com/cdn/shop/files/Bag-GourdBag_M_12.jpg?v=1779697535&width=900",
  Wallet: "https://hourleather.com/cdn/shop/files/2026-05-23165001.png?v=1779522741&width=900",
  Belt: "https://hourleather.com/cdn/shop/files/Black2025-1_e14e335d-2a9e-4f96-9e9d-fdd2162fcb13.jpg?v=1779538483&width=900",
  Accessory: "https://hourleather.com/cdn/shop/files/2025-1.jpg?v=1779538084&width=900"
};

export const products: Product[] = [
  {
    id: 1,
    name: "Gourd Bag (M)",
    category: "Bag",
    price: 368000,
    thumbnail: "https://hourleather.com/cdn/shop/files/Bag-GourdBag_M_12.jpg?v=1779697535&width=900",
    images: [
      "https://hourleather.com/cdn/shop/files/Bag-GourdBag_M_12.jpg?v=1779697535&width=1200",
      "https://hourleather.com/cdn/shop/files/1_Brown_2025_-5_2d661775-58c0-4d65-9fdf-6e343d1755a1.jpg?v=1779702808&width=1200"
    ],
    summary: "둥근 실루엣과 단단한 손맛이 살아 있는 h'our의 대표 백입니다.",
    description:
      "천천히 길들어가는 브라운 레더와 절제된 금속 장식이 일상에 오래 남는 형태를 만듭니다.",
    status: "ACTIVATED",
    isMain: true,
    stock: 8,
    option: "Brown / M"
  },
  {
    id: 2,
    name: "Gourd Bag (S)",
    category: "Bag",
    price: 219000,
    thumbnail:
      "https://hourleather.com/cdn/shop/files/Bag-GourdBag_S_1_b1b106d4-51e1-47fd-a0ab-45b01904e243.jpg?v=1779592820&width=900",
    images: [
      "https://hourleather.com/cdn/shop/files/Bag-GourdBag_S_1_b1b106d4-51e1-47fd-a0ab-45b01904e243.jpg?v=1779592820&width=1200"
    ],
    summary: "작지만 충분한 수납감의 고어드백 스몰 사이즈.",
    description: "가벼운 외출과 클래스 데이에 잘 어울리는 컴팩트한 크기의 핸드메이드 백입니다.",
    status: "ACTIVATED",
    isMain: true,
    stock: 10,
    option: "Brown / S"
  },
  {
    id: 3,
    name: "Bucket Bag - Brown",
    category: "Bag",
    price: 219000,
    thumbnail: "https://hourleather.com/cdn/shop/files/1Brown2025-1.jpg?v=1779528950&width=900",
    images: ["https://hourleather.com/cdn/shop/files/1Brown2025-1.jpg?v=1779528950&width=1200"],
    summary: "매일 들기 좋은 버킷 형태의 브라운 백.",
    description: "부드러운 입구와 안정적인 바닥감으로 데일리 수납에 집중한 제품입니다.",
    status: "ACTIVATED",
    isMain: true,
    stock: 6,
    option: "Brown"
  },
  {
    id: 4,
    name: "Folding Card Wallet",
    category: "Wallet",
    price: 130000,
    thumbnail: "https://hourleather.com/cdn/shop/files/2026-05-23165001.png?v=1779522741&width=900",
    images: ["https://hourleather.com/cdn/shop/files/2026-05-23165001.png?v=1779522741&width=1200"],
    summary: "손 안에 차분히 접히는 카드 지갑.",
    description: "카드와 지폐를 단정하게 담을 수 있는 h'our의 스테디 월렛 라인입니다.",
    status: "ACTIVATED",
    isMain: true,
    stock: 12,
    option: "Brown"
  },
  {
    id: 5,
    name: "Flat Card Case (M)",
    category: "Wallet",
    price: 68000,
    thumbnail:
      "https://hourleather.com/cdn/shop/files/2Brown2025-1_c5f093de-2a35-4e18-8e68-b47a9e439db9.jpg?v=1779536149&width=900",
    images: [
      "https://hourleather.com/cdn/shop/files/2Brown2025-1_c5f093de-2a35-4e18-8e68-b47a9e439db9.jpg?v=1779536149&width=1200"
    ],
    summary: "가장 얇게 필요한 것만 챙기는 카드 케이스.",
    description: "얇은 두께와 깨끗한 엣지 마감으로 재킷 포켓에도 편하게 들어갑니다.",
    status: "ACTIVATED",
    isMain: false,
    stock: 18,
    option: "Brown / M"
  },
  {
    id: 6,
    name: "Bando Key Ring",
    category: "Accessory",
    price: 15000,
    thumbnail: "https://hourleather.com/cdn/shop/files/2025-1.jpg?v=1779538084&width=900",
    images: ["https://hourleather.com/cdn/shop/files/2025-1.jpg?v=1779538084&width=1200"],
    summary: "가볍게 선물하기 좋은 레더 키링.",
    description: "남는 조각까지 허투루 쓰지 않는 공방의 태도를 담은 작은 액세서리입니다.",
    status: "ACTIVATED",
    isMain: false,
    stock: 30,
    option: "Light brown"
  },
  {
    id: 7,
    name: "Door Bell",
    category: "Accessory",
    price: 45000,
    thumbnail: "https://hourleather.com/cdn/shop/files/LightBrown2025-1.jpg?v=1779538281&width=900",
    images: ["https://hourleather.com/cdn/shop/files/LightBrown2025-1.jpg?v=1779538281&width=1200"],
    summary: "공간의 입구에 작은 소리를 더하는 도어벨.",
    description: "금속과 가죽의 조합으로 공방의 분위기를 집 안으로 옮겨옵니다.",
    status: "SOLD_OUT",
    isMain: false,
    stock: 0,
    option: "Light brown"
  }
];

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
