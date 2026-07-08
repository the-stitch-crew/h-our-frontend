const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

export type ApiEnvelope<T> = {
  success: boolean;
  code: string;
  message: string;
  data: T;
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

export type OrderProductPayload = {
  productName: string;
  price: number;
  productId: number;
  amount: number;
  option: string;
};

export type OrderCreatePayload = {
  requests: OrderProductPayload[];
  address: string;
  postalCode: string;
  receiverName: string;
  phoneNumber: string;
  request?: string;
  ordererName: string;
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
  createOrder: (token: string, payload: OrderCreatePayload) =>
    request<OrderCreateResponse>("/api/orders", {
      method: "POST",
      token,
      body: JSON.stringify(payload)
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
