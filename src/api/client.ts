import type { ProductDetailItem, ProductSearchItem } from "../data/products";

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL =
  configuredApiBaseUrl || (import.meta.env.DEV ? "http://localhost:8080" : window.location.origin);
export { API_BASE_URL };

export type ApiEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
};

export type PageResponse<T> = {
  content: T[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
};

export type Gender = "MALE" | "FEMALE";
export type Role = "USER" | "ADMIN";

export type UserInfo = {
  userId: number;
  userName: string;
  email: string;
  birthDate: string;
  gender: Gender;
  role: Role;
  phoneNumber: string;
  nationality: string;
  isAuthLinked: boolean;
};

export type SignupPayload = {
  userName: string;
  email: string;
  password: string;
  birthDate: string;
  gender: Gender;
  phoneNumber: string;
  nationality: string;
};

export type OAuthSignupInfo = {
  email: string;
  userName: string;
  provider: string;
};

export type OAuthSignupPayload = {
  birthDate: string;
  gender: Gender;
  phoneNumber: string;
  nationality: string;
};

export type CategoryResponse = {
  id: number;
  name: string;
  thumbnail: string | null;
};

export type AddressResponse = {
  id: number;
  zipCode: string;
  oldAddress?: string;
  roadAddress: string;
  addressDetail: string;
  isMain: boolean;
};

export type AddressPayload = {
  zipCode: string;
  oldAddress?: string;
  roadAddress: string;
  addressDetail: string;
  isMain?: boolean;
};

export type OrderCreateFromProductPayload = {
  productId: number;
  amount: number;
  option: string;
  address: string;
  postalCode: string;
  receiverName: string;
  request?: string;
  receiverPhoneNumber: string;
};

export type OrderCreateFromCartPayload = {
  address: string;
  postalCode: string;
  receiverName: string;
  request?: string;
  receiverPhoneNumber: string;
};

export type OrderCreateResponse = {
  orderNumber: string;
  totalPrice: number;
  deliveryFee: number;
  address: string;
  postalCode: string;
  receiverName: string;
  receiverPhoneNumber: string;
  phoneNumber: string;
  ordererName: string;
  orderStatus: string;
  createdAt: string;
};

export type OrderSearchResponse = {
  orderNumber: string;
  totalPrice: number;
  orderStatus: string;
};

export type OrderProductDetailResponse = {
  name: string;
  amount: number;
  price: number;
  productId: number;
};

export type OrderDetailResponse = {
  orderNumber: string;
  totalPrice: number;
  orderStatus: string;
  deliveryFee: number;
  address: string;
  postalCode: string;
  receiverName: string;
  receiverPhoneNumber: string;
  orderProducts: OrderProductDetailResponse[];
};

export type PaymentRequestBody = {
  paymentKey: string | null;
  orderId: string | null;
  orderNumber: string | null;
  amount: number;
};

export type PaymentDetailResponse = {
  paymentId: number;
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
  pgReceiptUrl: string | null;
  requestedAt: string;
  approvedAt: string | null;
};

export type CartDetailResponse = {
  cartId: number;
  userId: number;
  products: {
    cartProductId: number;
    amount: number;
    productName: string;
    price: number;
    totalPrice: number;
  }[];
  totalPrice: number;
};

export type RecentOrderResponse = {
  orderNumber: string;
  ordererName: string;
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
};

export type TopProductResponse = {
  productId: number;
  name: string;
  totalQuantity: number;
  totalSales: number;
  thumbnail: string | null;
};

export type AdminDashboardResponse = {
  todaySales: number;
  totalSales: number;
  todayOrderCount: number;
  paidOrderCount: number;
  inDeliveryOrderCount: number;
  totalUserCount: number;
  todayUserCount: number;
  activeProductCount: number;
  soldOutProductCount: number;
  recentOrders: RecentOrderResponse[];
  topProducts: TopProductResponse[];
};

export type AdminOrderSearchResponse = {
  orderNumber: string;
  ordererName: string;
  phoneNumber: string;
  totalPrice: number;
  orderStatus: string;
  createdAt: string;
};

export type AdminOrderProductResponse = {
  productId: number;
  name: string;
  amount: number;
  price: number;
  option: string;
};

export type AdminOrderDetailResponse = AdminOrderSearchResponse & {
  deliveryFee: number;
  receiverName: string;
  receiverPhoneNumber: string;
  address: string;
  postalCode: string;
  request: string | null;
  products: AdminOrderProductResponse[];
};

export type AdminUserSearchResponse = {
  userId: number;
  userName: string;
  email: string;
  phoneNumber: string;
  role: string;
  gender: string;
  nationality: string;
  isAuthLinked: boolean;
  blacklisted: boolean;
  createdAt: string;
  deletedAt: string | null;
};

export type AdminUserDetailResponse = AdminUserSearchResponse & {
  birthDate: string;
  provider: string | null;
  updatedAt: string;
};

export type ProductStatus = "ACTIVATED" | "SOLD_OUT" | "DELETED";

export type AdminProductSearchResponse = {
  productId: number;
  name: string;
  price: number;
  thumbnail: string | null;
  status: ProductStatus;
  categoryName: string | null;
  isMain: boolean | null;
  viewCount: number | null;
  salesCount: number | null;
  createdAt: string;
};

export type AdminProductDetailResponse = AdminProductSearchResponse & {
  summary: string | null;
  description: string | null;
  lastErolledToMain: string | null;
  updatedAt: string;
  deletedAt: string | null;
};

export type ProductCreatePayload = {
  name: string;
  price: number;
  summary?: string;
  description?: string;
  categoryId: number;
  thumbnailFile?: File | null;
};

export type ProductUpdatePayload = Omit<ProductCreatePayload, "categoryId">;

export type ProductCreateResponse = {
  productName: string;
  price: number;
  productId: number;
};

export type ReservationStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELED" | "NO_SHOW";

export type LessonResponse = {
  id: number;
  name: string;
  price: number;
  duration: number;
};

export type LessonPayload = {
  name: string;
  price: number;
  duration: number;
};

export type LessonPolicyResponse = {
  reservationAvailableDays: number;
  reservationDeadlineDays: number;
  cancelDeadlineDays: number;
  depositAmount: number;
  startTime: string;
  endTime: string;
  regularDays: string[];
};

export type LessonPolicyPayload = LessonPolicyResponse;

export type ReservationCreatePayload = {
  date: string;
  startTime: string;
  endTime: string;
  deposit: number;
  price: number;
  request?: string;
  lessonId: number;
};

export type ExistReservationResponse = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
};

export type ReservationResponse = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  deposit: number;
  price: number;
  request: string | null;
  reservationNumber: string;
  status: ReservationStatus;
  lesson: LessonResponse;
};

export type CustomerSummaryResponse = {
  userId: number;
  userName: string;
  email: string;
  phoneNumber: string;
  nationality: string;
  reservationCount: number;
  visitCount: number;
  lastVisitDate: string | null;
};

export type AdminReservationResponse = {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  deposit: number;
  price: number;
  request: string | null;
  reservationNumber: string;
  state: ReservationStatus;
  customer: CustomerSummaryResponse;
  lesson: LessonResponse;
};

export type ShippingPolicyResponse = {
  shippingPolicyId: number;
  deliveryFee: number;
  extraFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ShippingPolicyPayload = {
  deliveryFee: number;
  extraFee: number;
  isActive: boolean;
};

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!headers.has("Content-Type") && options.body && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get("content-type");
  const payload = contentType?.includes("application/json")
    ? ((await response.json()) as ApiEnvelope<T>)
    : null;

  if (!response.ok || (payload && payload.success === false)) {
    throw new Error(payload?.message || `Request failed with ${response.status}`);
  }

  return payload ? payload.data : (undefined as T);
}

function createCategoryFormData(payload: { name: string; thumbnailFile?: File | null }) {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify({ name: payload.name })], {
      type: "application/json"
    })
  );
  if (payload.thumbnailFile) {
    formData.append("file", payload.thumbnailFile);
  }
  return formData;
}

function createProductFormData(payload: ProductCreatePayload | ProductUpdatePayload) {
  const formData = new FormData();
  const { thumbnailFile, ...request } = payload;
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], {
      type: "application/json"
    })
  );
  if (thumbnailFile) {
    formData.append("file", thumbnailFile);
  }
  return formData;
}

export const api = {
  login: (email: string, password: string) =>
    request<LoginResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),
  logout: (refreshToken: string) =>
    request<void>("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken })
    }),
  signup: (payload: SignupPayload) =>
    request<{ userId: number; email: string }>("/api/users/signup", {
      method: "POST",
      body: JSON.stringify(payload)
    }),
  oauthSignupInfo: () => request<OAuthSignupInfo>("/api/auth/oauth/signup", { credentials: "include" }),
  oauthSignup: (payload: OAuthSignupPayload) =>
    request<LoginResponse>("/api/auth/oauth/signup", {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(payload)
    }),
  me: (token: string) => request<UserInfo>("/api/users/me", { token }),
  updateMe: (token: string, payload: Partial<SignupPayload>) =>
    request<UserInfo>("/api/users/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    }),
  deleteMe: (token: string) =>
    request<void>("/api/users/me", {
      method: "DELETE",
      token
    }),
  categories: () => request<CategoryResponse[]>("/api/categories"),
  products: (page = 0, size = 100, categoryName = "") => {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });
    if (categoryName) params.set("categoryName", categoryName);

    return request<PageResponse<ProductSearchItem>>(`/api/products?${params.toString()}`);
  },
  product: (productId: number) => request<ProductDetailItem>(`/api/products/${productId}`),
  addresses: (token: string) => request<AddressResponse[]>("/api/addresses", { token }),
  createAddress: (token: string, payload: AddressPayload) =>
    request<AddressResponse>("/api/addresses", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  setMainAddress: (token: string, addressId: number) =>
    request<AddressResponse>(`/api/addresses/${addressId}/main`, {
      method: "PATCH",
      token
    }),
  deleteAddress: (token: string, addressId: number) =>
    request<void>(`/api/addresses/${addressId}`, {
      method: "DELETE",
      token
    }),
  createOrderFromProduct: (token: string, payload: OrderCreateFromProductPayload) =>
    request<OrderCreateResponse>("/api/orders/product", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  createOrderFromCart: (token: string, payload: OrderCreateFromCartPayload) =>
    request<OrderCreateResponse>("/api/orders/cart", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  getCart: (token: string) => request<CartDetailResponse>("/api/carts", { token }),
  createCart: (token: string) =>
    request<CartDetailResponse>("/api/carts", {
      method: "POST",
      token
    }),
  deleteCart: (token: string, cartId: number) =>
    request<void>(`/api/carts/${cartId}`, {
      method: "DELETE",
      token
    }),
  addCartProduct: (token: string, cartId: number, payload: { productId: number; amount: number }) =>
    request<CartDetailResponse>(`/api/carts/${cartId}`, {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  orderDetail: (token: string, orderNumber: string) =>
    request<OrderDetailResponse>(`/api/orders/${orderNumber}`, { token }),
  confirmPayment: async (token: string, payload: PaymentRequestBody) => {
    const response = await fetch(`${API_BASE_URL}/api/payments/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    if (!response.ok) {
      throw new Error(text || `Request failed with ${response.status}`);
    }

    return text;
  },
  paymentDetail: (token: string, paymentId: number) =>
    request<PaymentDetailResponse>(`/api/payments/${paymentId}`, { token }),
  paymentDetailByOrderNumber: (token: string, orderNumber: string) =>
    request<PaymentDetailResponse>(`/api/payments/orders/${orderNumber}/detail`, { token }),
  orders: (token: string, page = 0, size = 20) =>
    request<PageResponse<OrderSearchResponse>>(`/api/orders/search?page=${page}&size=${size}`, { token }),
  payments: (token: string, page = 0, size = 20) =>
    request<PageResponse<PaymentDetailResponse>>(`/api/payments?page=${page}&size=${size}`, { token }),
  refundPayment: (token: string, paymentId: number) =>
    request<void>(`/api/payments/${paymentId}`, {
      method: "DELETE",
      token
    }),
  createCategory: (token: string, payload: { name: string; thumbnailFile?: File | null }) =>
    request<void>("/api/admin/categories", {
      method: "POST",
      token,
      body: createCategoryFormData(payload)
    }),
  updateCategory: (token: string, categoryId: number, payload: { name: string; thumbnailFile?: File | null }) =>
    request<void>(`/api/admin/categories/${categoryId}`, {
      method: "PUT",
      token,
      body: createCategoryFormData(payload)
    }),
  deleteCategory: (token: string, categoryId: number) =>
    request<void>(`/api/admin/categories/${categoryId}`, {
      method: "DELETE",
      token
    }),
  createProduct: (token: string, payload: ProductCreatePayload) =>
    request<ProductCreateResponse>("/api/admin/products", {
      method: "POST",
      token,
      body: createProductFormData(payload)
    }),
  adminProducts: (token: string, page = 0, size = 100) =>
    request<PageResponse<AdminProductSearchResponse>>(`/api/admin/products?page=${page}&size=${size}`, { token }),
  adminProduct: (token: string, productId: number) =>
    request<AdminProductDetailResponse>(`/api/admin/products/${productId}`, { token }),
  updateProduct: (token: string, productId: number, payload: ProductUpdatePayload) =>
    request<void>(`/api/admin/products/${productId}`, {
      method: "PUT",
      token,
      body: createProductFormData(payload)
    }),
  deleteProduct: (token: string, productId: number) =>
    request<void>(`/api/admin/products/${productId}`, {
      method: "DELETE",
      token
    }),
  updateProductStatus: (token: string, productId: number, status: ProductStatus) =>
    request<void>(`/api/admin/products/${productId}/status`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ status })
    }),
  setMainProduct: (token: string, productId: number) =>
    request<void>(`/api/admin/products/${productId}/main`, {
      method: "PATCH",
      token
    }),
  lessons: () => request<LessonResponse[]>("/api/lessons"),
  lessonPolicy: () => request<LessonPolicyResponse>("/api/lessons/policy"),
  existingReservations: (fromDate: string, toDate: string) =>
    request<ExistReservationResponse[]>(`/api/reservations?fromDate=${fromDate}&toDate=${toDate}`),
  createReservation: (token: string, payload: ReservationCreatePayload) =>
    request<ReservationResponse>("/api/reservations", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  myReservation: (token: string, reservationId: number) =>
    request<ReservationResponse>(`/api/reservations/my/reservations/${reservationId}`, { token }),
  adminReservations: (
    token: string,
    params: { date?: string; year?: number; month?: number; week?: number; status?: string; page?: number }
  ) => {
    const searchParams = new URLSearchParams({
      status: params.status ?? "ALL",
      page: String(params.page ?? 1)
    });
    if (params.date) searchParams.set("date", params.date);
    if (params.year) searchParams.set("year", String(params.year));
    if (params.month) searchParams.set("month", String(params.month));
    if (params.week) searchParams.set("week", String(params.week));

    return request<PageResponse<AdminReservationResponse>>(`/api/admin/reservations?${searchParams.toString()}`, {
      token
    });
  },
  updateAdminReservationStatus: (token: string, reservationId: number, status: ReservationStatus) =>
    request<void>(`/api/admin/reservations/status/${reservationId}?status=${status}`, {
      method: "PATCH",
      token
    }),
  createLesson: (token: string, payload: LessonPayload) =>
    request<void>("/api/admin/lessons", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  updateLesson: (token: string, lessonId: number, payload: LessonPayload) =>
    request<void>(`/api/admin/lessons/${lessonId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    }),
  deleteLesson: (token: string, lessonId: number) =>
    request<void>(`/api/admin/lessons/${lessonId}`, {
      method: "DELETE",
      token
    }),
  updateLessonPolicy: (token: string, payload: LessonPolicyPayload) =>
    request<void>("/api/admin/lessons/policy", {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    }),
  adminDashboard: (token: string) => request<AdminDashboardResponse>("/api/admin/dashboard", { token }),
  adminOrders: (token: string, page = 0, size = 20) =>
    request<PageResponse<AdminOrderSearchResponse>>(`/api/admin/orders?page=${page}&size=${size}`, { token }),
  adminOrder: (token: string, orderNumber: string) =>
    request<AdminOrderDetailResponse>(`/api/admin/orders/${orderNumber}`, { token }),
  updateAdminOrderStatus: (token: string, orderNumber: string, action: "indelivery" | "delivered" | "complete" | "cancel") =>
    request<void>(`/api/admin/orders/${orderNumber}/${action}`, {
      method: "PATCH",
      token
    }),
  adminUsers: (token: string, page = 0, size = 20) =>
    request<PageResponse<AdminUserSearchResponse>>(`/api/admin/users?page=${page}&size=${size}`, { token }),
  updateAdminUserRole: (token: string, userId: number, role: Role) =>
    request<AdminUserDetailResponse>(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ role })
    }),
  updateAdminUserBlacklist: (token: string, userId: number, blacklisted: boolean) =>
    request<AdminUserDetailResponse>(`/api/admin/users/${userId}/blacklist`, {
      method: "PATCH",
      token,
      body: JSON.stringify({ blacklisted })
    }),
  shippingPolicies: (token: string) => request<ShippingPolicyResponse[]>("/api/admin/shipping-policies", { token }),
  createShippingPolicy: (token: string, payload: ShippingPolicyPayload) =>
    request<ShippingPolicyResponse>("/api/admin/shipping-policies", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  updateShippingPolicy: (token: string, shippingPolicyId: number, payload: ShippingPolicyPayload) =>
    request<ShippingPolicyResponse>(`/api/admin/shipping-policies/${shippingPolicyId}`, {
      method: "PUT",
      token,
      body: JSON.stringify(payload)
    }),
  activateShippingPolicy: (token: string, shippingPolicyId: number) =>
    request<ShippingPolicyResponse>(`/api/admin/shipping-policies/${shippingPolicyId}/active`, {
      method: "PATCH",
      token
    }),
  deleteShippingPolicy: (token: string, shippingPolicyId: number) =>
    request<void>(`/api/admin/shipping-policies/${shippingPolicyId}`, {
      method: "DELETE",
      token
    })
};
