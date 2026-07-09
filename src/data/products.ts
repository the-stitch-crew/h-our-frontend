export type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  thumbnail: string;
  images: string[];
  summary: string;
  description: string;
  status: string;
  isMain: boolean;
  stock: number;
  option: string;
  viewCount?: number;
  salesCount?: number;
};

export type ProductSearchItem = {
  productId: number;
  name: string;
  price: number;
  thumbnail: string | null;
  productStatus: string;
  summary: string | null;
  categoryName: string | null;
  isMain: boolean | null;
  viewCount: number | null;
  salesCount: number | null;
};

export type ProductDetailItem = ProductSearchItem & {
  description: string | null;
};

export const categoryImages = {
  Bag: "https://hourleather.com/cdn/shop/files/Bag-GourdBag_M_12.jpg?v=1779697535&width=900",
  Wallet: "https://hourleather.com/cdn/shop/files/2026-05-23165001.png?v=1779522741&width=900",
  Belt: "https://hourleather.com/cdn/shop/files/Black2025-1_e14e335d-2a9e-4f96-9e9d-fdd2162fcb13.jpg?v=1779538483&width=900",
  Accessory: "https://hourleather.com/cdn/shop/files/2025-1.jpg?v=1779538084&width=900"
};

const placeholderThumbnail = "/assets/hour-studio-hero.png";

export const mapProductSummary = (item: ProductSearchItem): Product => ({
  id: item.productId,
  name: item.name,
  category: item.categoryName ?? "Uncategorized",
  price: item.price,
  thumbnail: item.thumbnail || placeholderThumbnail,
  images: [item.thumbnail || placeholderThumbnail],
  summary: item.summary ?? "",
  description: item.summary ?? "",
  status: item.productStatus,
  isMain: Boolean(item.isMain),
  stock: item.productStatus === "SOLD_OUT" ? 0 : 99,
  option: "기본 옵션",
  viewCount: item.viewCount ?? 0,
  salesCount: item.salesCount ?? 0
});

export const mapProductDetail = (item: ProductDetailItem): Product => ({
  ...mapProductSummary(item),
  description: item.description ?? item.summary ?? ""
});

export const formatPrice = (value: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0
  }).format(value);
