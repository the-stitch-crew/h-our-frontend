const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
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

export type CategoryResponse = {
  id: number;
  name: string;
  thumbnail: string;
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

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
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
  createCategory: (token: string, payload: { name: string; thumbnail: string }) =>
    request<void>("/api/admin/categories", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
    }),
  updateCategory: (token: string, categoryId: number, payload: { name: string; thumbnail: string }) =>
    request<void>(`/api/admin/categories/${categoryId}`, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload)
    }),
  deleteCategory: (token: string, categoryId: number) =>
    request<void>(`/api/admin/categories/${categoryId}`, {
      method: "DELETE",
      token
    })
};
