import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Edit3,
  GraduationCap,
  Package,
  Plus,
  ReceiptText,
  Save,
  ShoppingBag,
  Tags,
  Trash2,
  TrendingUp,
  UserCheck,
  UsersRound,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  AdminDashboardResponse,
  AdminOrderSearchResponse,
  AdminReservationResponse,
  AdminUserSearchResponse,
  api,
  CategoryResponse,
  LessonPolicyResponse,
  LessonResponse,
  ProductCreatePayload
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatPrice, mapProductSummary, Product } from "../data/products";

type AdminSection =
  | "dashboard"
  | "orders"
  | "classes"
  | "products"
  | "members"
  | "categories";
type OrderStatus = "PURCHASED" | "IN_DELIVERY" | "DELIVERED" | "COMPLETE" | "CANCELED";
type ReservationStatus = "PENDING" | "APPROVED" | "COMPLETED" | "CANCELED" | "NO_SHOW";

type MetricCard = {
  label: string;
  value: string;
  delta: string;
  helper: string;
  icon: LucideIcon;
  tone: "sage" | "blue" | "clay" | "ink";
};

const adminSections: { id: AdminSection; label: string; icon: LucideIcon }[] = [
  { id: "dashboard", label: "대시보드", icon: BarChart3 },
  { id: "orders", label: "주문 관리", icon: ClipboardList },
  { id: "products", label: "상품 관리", icon: Package },
  { id: "members", label: "회원 관리", icon: UsersRound },
  { id: "classes", label: "클래스 관리", icon: GraduationCap },
  { id: "categories", label: "카테고리 관리", icon: Tags }
];

const statusOrder: OrderStatus[] = ["PURCHASED", "IN_DELIVERY", "DELIVERED", "COMPLETE", "CANCELED"];
const reservationStatusOrder: ReservationStatus[] = ["PENDING", "APPROVED", "COMPLETED", "CANCELED", "NO_SHOW"];
const editableReservationStatuses: ReservationStatus[] = ["COMPLETED", "NO_SHOW"];
const dayOptions = [
  { value: "MONDAY", label: "월" },
  { value: "TUESDAY", label: "화" },
  { value: "WEDNESDAY", label: "수" },
  { value: "THURSDAY", label: "목" },
  { value: "FRIDAY", label: "금" },
  { value: "SATURDAY", label: "토" },
  { value: "SUNDAY", label: "일" }
];
const numberFormatter = new Intl.NumberFormat("ko-KR");
const fallbackAdminImage = "/assets/hour-studio-hero.png";
const todayInputValue = () => {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
};
const emptyProductForm = {
  name: "",
  price: "",
  categoryId: "",
  summary: "",
  description: ""
};
const emptyLessonForm = {
  id: null as number | null,
  name: "",
  price: "",
  duration: ""
};
const emptyPolicyForm = {
  reservationAvailableDays: "",
  reservationDeadlineDays: "",
  cancelDeadlineDays: "",
  depositAmount: "",
  startTime: "10:00",
  endTime: "19:00",
  regularDays: [] as string[]
};

const statusLabels: Record<string, string> = {
  PURCHASED: "결제완료",
  IN_DELIVERY: "배송중",
  DELIVERED: "배송완료",
  COMPLETE: "구매확정",
  CANCELED: "취소",
  PENDING: "예약대기",
  APPROVED: "예약확정",
  COMPLETED: "방문완료",
  NO_SHOW: "노쇼"
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium"
  }).format(new Date(`${value}T00:00:00`));

const normalizeTime = (value: string) => value.slice(0, 5);

const addHoursToTime = (value: string, hours: number) => {
  const [rawHour, rawMinute] = value.split(":").map(Number);
  const date = new Date(2000, 0, 1, rawHour, rawMinute || 0);
  date.setHours(date.getHours() + hours);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const policyToForm = (policy: LessonPolicyResponse) => ({
  reservationAvailableDays: String(policy.reservationAvailableDays),
  reservationDeadlineDays: String(policy.reservationDeadlineDays),
  cancelDeadlineDays: String(policy.cancelDeadlineDays),
  depositAmount: String(policy.depositAmount),
  startTime: normalizeTime(policy.startTime),
  endTime: normalizeTime(policy.endTime),
  regularDays: policy.regularDays ?? []
});

export default function AdminPage() {
  const { accessToken } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminDashboard, setAdminDashboard] = useState<AdminDashboardResponse | null>(null);
  const [orders, setOrders] = useState<AdminOrderSearchResponse[]>([]);
  const [members, setMembers] = useState<AdminUserSearchResponse[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", thumbnail: "" });
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productForm, setProductForm] = useState(emptyProductForm);
  const [productThumbnailFile, setProductThumbnailFile] = useState<File | null>(null);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", thumbnail: "" });
  const [lessons, setLessons] = useState<LessonResponse[]>([]);
  const [lessonPolicy, setLessonPolicy] = useState<LessonPolicyResponse | null>(null);
  const [reservations, setReservations] = useState<AdminReservationResponse[]>([]);
  const [reservationDateFilter, setReservationDateFilter] = useState(todayInputValue());
  const [reservationStatusFilter, setReservationStatusFilter] = useState("ALL");
  const [reservationForm, setReservationForm] = useState({
    date: todayInputValue(),
    startTime: "10:00",
    lessonId: "",
    request: ""
  });
  const [isReservationFormOpen, setIsReservationFormOpen] = useState(false);
  const [reservationStatusDrafts, setReservationStatusDrafts] = useState<Record<number, ReservationStatus>>({});
  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [policyForm, setPolicyForm] = useState(emptyPolicyForm);

  const loadCategories = () => {
    api
      .categories()
      .then(setCategories)
      .catch(() => setCategories([]));
  };

  const loadProducts = () => {
    api
      .products(0, 100)
      .then((page) => setProducts(page.content.map(mapProductSummary)))
      .catch(() => setProducts([]));
  };

  const loadLessons = () => {
    api
      .lessons()
      .then(setLessons)
      .catch(() => setLessons([]));
  };

  const loadLessonPolicy = () => {
    api
      .lessonPolicy()
      .then((policy) => {
        setLessonPolicy(policy);
        setPolicyForm(policyToForm(policy));
      })
      .catch(() => {
        setLessonPolicy(null);
        setPolicyForm(emptyPolicyForm);
      });
  };

  const loadReservations = () => {
    if (!accessToken) {
      setReservations([]);
      return;
    }

    api
      .adminReservations(accessToken, {
        date: reservationDateFilter,
        status: reservationStatusFilter,
        page: 1
      })
      .then((page) => {
        setReservations(page.content);
        setReservationStatusDrafts(
          Object.fromEntries(
            page.content.map((reservation) => [
              reservation.id,
              editableReservationStatuses.includes(reservation.state) ? reservation.state : "COMPLETED"
            ])
          )
        );
      })
      .catch(() => setReservations([]));
  };

  const loadAdminData = () => {
    if (!accessToken) {
      setAdminDashboard(null);
      setOrders([]);
      setMembers([]);
      return;
    }

    api
      .adminDashboard(accessToken)
      .then(setAdminDashboard)
      .catch(() => setAdminDashboard(null));
    api
      .adminOrders(accessToken, 0, 20)
      .then((page) => setOrders(page.content))
      .catch(() => setOrders([]));
    api
      .adminUsers(accessToken, 0, 20)
      .then((page) => setMembers(page.content))
      .catch(() => setMembers([]));
  };

  useEffect(loadCategories, []);
  useEffect(loadProducts, []);
  useEffect(loadLessons, []);
  useEffect(loadLessonPolicy, []);
  useEffect(loadAdminData, [accessToken]);
  useEffect(loadReservations, [accessToken, reservationDateFilter, reservationStatusFilter]);

  const productThumbnailPreview = useMemo(
    () => (productThumbnailFile ? URL.createObjectURL(productThumbnailFile) : ""),
    [productThumbnailFile]
  );

  useEffect(() => {
    if (!productThumbnailPreview) return;
    return () => URL.revokeObjectURL(productThumbnailPreview);
  }, [productThumbnailPreview]);

  const selectedReservationLesson = lessons.find((lesson) => lesson.id === Number(reservationForm.lessonId));
  const reservationEndTime = selectedReservationLesson
    ? addHoursToTime(reservationForm.startTime, selectedReservationLesson.duration)
    : "";

  const dashboard = useMemo(() => {
    const totalSales = adminDashboard?.totalSales ?? 0;
    const pendingOrders = (adminDashboard?.paidOrderCount ?? 0) + (adminDashboard?.inDeliveryOrderCount ?? 0);
    const soldOutProducts = products.filter((product) => product.status === "SOLD_OUT").length;
    const adminMembers = members.filter((member) => member.role === "ADMIN").length;
    const averageOrderValue = orders.length ? totalSales / orders.length : 0;

    const popularProducts = adminDashboard?.topProducts ?? [];

    return {
      totalSales,
      pendingOrders,
      soldOutProducts,
      adminMembers,
      averageOrderValue,
      popularProducts
    };
  }, [adminDashboard, members, orders.length, products]);

  const metrics: MetricCard[] = [
    {
      label: "매출 지표",
      value: formatPrice(dashboard.totalSales),
      delta: "+12.8%",
      helper: `객단가 ${formatPrice(Math.round(dashboard.averageOrderValue))}`,
      icon: TrendingUp,
      tone: "sage"
    },
    {
      label: "주문 지표",
      value: `${numberFormatter.format(adminDashboard?.todayOrderCount ?? orders.length)}건`,
      delta: `${dashboard.pendingOrders}건 처리 필요`,
      helper: "결제완료, 배송중 기준",
      icon: ReceiptText,
      tone: "blue"
    },
    {
      label: "회원 지표",
      value: `${numberFormatter.format(adminDashboard?.totalUserCount ?? members.length)}명`,
      delta: `오늘 가입 ${numberFormatter.format(adminDashboard?.todayUserCount ?? 0)}명`,
      helper: `관리자 ${dashboard.adminMembers}명`,
      icon: UserCheck,
      tone: "clay"
    },
    {
      label: "상품 지표",
      value: `${numberFormatter.format(adminDashboard?.activeProductCount ?? products.length)}개`,
      delta: `품절 ${adminDashboard?.soldOutProductCount ?? dashboard.soldOutProducts}개`,
      helper: "DB 상품 목록 기준",
      icon: ShoppingBag,
      tone: "ink"
    }
  ];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setMessage("");
    setError("");
    try {
      await api.createCategory(accessToken, form);
      setForm({ name: "", thumbnail: "" });
      setMessage("카테고리가 등록되었습니다.");
      loadCategories();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "카테고리 등록에 실패했습니다.");
    }
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || isCreatingProduct) return;

    const price = Number(productForm.price);
    const categoryId = Number(productForm.categoryId);

    if (!Number.isFinite(price) || price <= 0) {
      setError("상품 가격은 0보다 큰 숫자로 입력해주세요.");
      return;
    }

    if (!Number.isFinite(categoryId) || categoryId <= 0) {
      setError("상품 카테고리를 선택해주세요.");
      return;
    }

    const payload: ProductCreatePayload = {
      name: productForm.name.trim(),
      price,
      categoryId,
      summary: productForm.summary.trim() || undefined,
      description: productForm.description.trim() || undefined,
      thumbnailFile: productThumbnailFile
    };

    setMessage("");
    setError("");
    setIsCreatingProduct(true);
    try {
      const createdProduct = await api.createProduct(accessToken, payload);
      setProductForm(emptyProductForm);
      setProductThumbnailFile(null);
      setIsProductFormOpen(false);
      setMessage(`${createdProduct.productName} 상품이 등록되었습니다.`);
      loadProducts();
      loadAdminData();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "상품 등록에 실패했습니다.");
    } finally {
      setIsCreatingProduct(false);
    }
  };

  const submitReservation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || !selectedReservationLesson || !lessonPolicy) return;

    setMessage("");
    setError("");
    try {
      await api.createReservation(accessToken, {
        date: reservationForm.date,
        startTime: reservationForm.startTime,
        endTime: reservationEndTime,
        deposit: lessonPolicy.depositAmount,
        price: selectedReservationLesson.price,
        request: reservationForm.request.trim() || undefined,
        lessonId: selectedReservationLesson.id
      });
      setReservationForm({
        date: reservationForm.date,
        startTime: lessonPolicy.startTime ? normalizeTime(lessonPolicy.startTime) : "10:00",
        lessonId: "",
        request: ""
      });
      setReservationDateFilter(reservationForm.date);
      setIsReservationFormOpen(false);
      setMessage("예약이 등록되었습니다.");
      loadReservations();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "예약 등록에 실패했습니다.");
    }
  };

  const updateReservationStatus = async (reservationId: number) => {
    if (!accessToken) return;
    const nextStatus = reservationStatusDrafts[reservationId] ?? "COMPLETED";
    setMessage("");
    setError("");
    try {
      await api.updateAdminReservationStatus(accessToken, reservationId, nextStatus);
      setMessage("예약 상태가 수정되었습니다.");
      loadReservations();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "예약 상태 수정에 실패했습니다.");
    }
  };

  const submitLesson = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;

    const price = Number(lessonForm.price);
    const duration = Number(lessonForm.duration);
    if (!Number.isFinite(price) || price < 0 || !Number.isFinite(duration) || duration <= 0) {
      setError("클래스 가격과 수업 시간을 확인해주세요.");
      return;
    }

    setMessage("");
    setError("");
    try {
      const payload = {
        name: lessonForm.name.trim(),
        price,
        duration
      };
      if (lessonForm.id === null) {
        await api.createLesson(accessToken, payload);
        setMessage("클래스가 등록되었습니다.");
      } else {
        await api.updateLesson(accessToken, lessonForm.id, payload);
        setMessage("클래스가 수정되었습니다.");
      }
      setLessonForm(emptyLessonForm);
      loadLessons();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "클래스 저장에 실패했습니다.");
    }
  };

  const startEditLesson = (lesson: LessonResponse) => {
    setLessonForm({
      id: lesson.id,
      name: lesson.name,
      price: String(lesson.price),
      duration: String(lesson.duration)
    });
    setMessage("");
    setError("");
  };

  const removeLesson = async (lessonId: number) => {
    if (!accessToken) return;
    setMessage("");
    setError("");
    try {
      await api.deleteLesson(accessToken, lessonId);
      setMessage("클래스가 삭제되었습니다.");
      if (lessonForm.id === lessonId) setLessonForm(emptyLessonForm);
      loadLessons();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "클래스 삭제에 실패했습니다.");
    }
  };

  const submitLessonPolicy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;

    setMessage("");
    setError("");
    try {
      await api.updateLessonPolicy(accessToken, {
        reservationAvailableDays: Number(policyForm.reservationAvailableDays),
        reservationDeadlineDays: Number(policyForm.reservationDeadlineDays),
        cancelDeadlineDays: Number(policyForm.cancelDeadlineDays),
        depositAmount: Number(policyForm.depositAmount),
        startTime: policyForm.startTime,
        endTime: policyForm.endTime,
        regularDays: policyForm.regularDays
      });
      setMessage("예약 정책이 수정되었습니다.");
      loadLessonPolicy();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "예약 정책 수정에 실패했습니다.");
    }
  };

  const toggleRegularDay = (day: string) => {
    setPolicyForm((current) => ({
      ...current,
      regularDays: current.regularDays.includes(day)
        ? current.regularDays.filter((currentDay) => currentDay !== day)
        : [...current.regularDays, day]
    }));
  };

  const startEditCategory = (category: CategoryResponse) => {
    setEditingCategoryId(category.id);
    setEditForm({ name: category.name, thumbnail: category.thumbnail ?? "" });
    setMessage("");
    setError("");
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditForm({ name: "", thumbnail: "" });
  };

  const submitEditCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken || editingCategoryId === null) return;
    setMessage("");
    setError("");
    try {
      await api.updateCategory(accessToken, editingCategoryId, editForm);
      setMessage("카테고리가 수정되었습니다.");
      cancelEditCategory();
      loadCategories();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "카테고리 수정에 실패했습니다.");
    }
  };

  const removeCategory = async (categoryId: number) => {
    if (!accessToken) return;
    try {
      await api.deleteCategory(accessToken, categoryId);
      setCategories((current) => current.filter((category) => category.id !== categoryId));
      setMessage("카테고리가 삭제되었습니다.");
      if (editingCategoryId === categoryId) cancelEditCategory();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "카테고리 삭제에 실패했습니다.");
    }
  };

  const handleNavClick = (section: AdminSection) => {
    setActiveSection(section);
    setMessage("");
    setError("");
  };

  return (
    <div className="page admin-page">
      <header className="admin-hero" id="admin-dashboard">
        <div>
          <span>Admin Console</span>
          <h1>관리자 대시보드</h1>
          <p>매출, 주문, 회원, 상품 운영 상태를 한 화면에서 확인하고 주요 관리 작업으로 바로 이동합니다.</p>
        </div>
        <div className="admin-hero-summary" aria-label="운영 요약">
          <strong>{formatPrice(dashboard.totalSales)}</strong>
          <small>최근 운영 매출</small>
        </div>
      </header>

      <nav className="admin-nav" aria-label="관리자 메뉴">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.id}
              className={activeSection === section.id ? "active" : ""}
              onClick={() => handleNavClick(section.id)}
              type="button"
            >
              <Icon size={18} />
              {section.label}
            </button>
          );
        })}
      </nav>

      {activeSection === "dashboard" && (
      <section className="admin-section" aria-labelledby="dashboard-title">
        <div className="admin-section-heading">
          <span>Dashboard</span>
          <h2 id="dashboard-title">핵심 지표</h2>
        </div>
        <div className="admin-metric-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article className={`admin-metric-card ${metric.tone}`} key={metric.label}>
                <div>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
                <Icon size={24} />
                <p>{metric.delta}</p>
                <small>{metric.helper}</small>
              </article>
            );
          })}
        </div>

        <div className="admin-dashboard-grid">
          <section className="plain-panel admin-panel" aria-labelledby="recent-orders-title">
            <div className="admin-panel-title">
              <h2 id="recent-orders-title">최근 주문</h2>
              <span>{adminDashboard?.recentOrders.length ?? orders.length}건</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>고객</th>
                    <th>금액</th>
                    <th>상태</th>
                    <th>주문일</th>
                  </tr>
                </thead>
                <tbody>
                  {(adminDashboard?.recentOrders ?? orders.slice(0, 5)).map((order) => (
                    <tr key={order.orderNumber}>
                      <td>{order.orderNumber}</td>
                      <td>{order.ordererName}</td>
                      <td>{formatPrice(order.totalPrice)}</td>
                      <td>
                        <span className={`status-badge ${order.orderStatus === "CANCELED" ? "danger" : ""}`}>
                          {statusLabels[order.orderStatus] ?? order.orderStatus}
                        </span>
                      </td>
                      <td>{formatDateTime(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="plain-panel admin-panel" aria-labelledby="popular-products-title">
            <div className="admin-panel-title">
              <h2 id="popular-products-title">인기 상품</h2>
              <span>판매수 기준</span>
            </div>
            <div className="popular-product-list">
              {dashboard.popularProducts.map((product, index) => (
                <article key={product.productId}>
                  <strong>{index + 1}</strong>
                  <img src={product.thumbnail || "/assets/hour-studio-hero.png"} alt={product.name} />
                  <div>
                    <b>{product.name}</b>
                    <small>
                      {numberFormatter.format(product.totalQuantity)}개 판매 · {formatPrice(product.totalSales)}
                    </small>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
      )}

      {activeSection === "orders" && (
      <section className="admin-section" id="admin-orders" aria-labelledby="orders-title">
        <div className="admin-section-heading">
          <span>Orders</span>
          <h2 id="orders-title">주문 관리</h2>
        </div>
        <div className="order-status-grid">
          {statusOrder.map((status) => {
            const count = orders.filter((order) => order.orderStatus === status).length;
            return (
              <article key={status}>
                <span>{statusLabels[status]}</span>
                <strong>{count}</strong>
              </article>
            );
          })}
        </div>
        <section className="plain-panel admin-panel">
          <div className="admin-panel-title">
            <h2>주문 처리 큐</h2>
            <button className="outline-button" type="button">
              <CheckCircle2 size={18} />
              선택 처리
            </button>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>주문일</th>
                  <th>주문번호</th>
                  <th>고객</th>
                  <th>연락처</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderNumber}>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>{order.orderNumber}</td>
                    <td>{order.ordererName}</td>
                    <td>{order.phoneNumber}</td>
                    <td>{formatPrice(order.totalPrice)}</td>
                    <td>
                      <span className={`status-badge ${order.orderStatus === "CANCELED" ? "danger" : ""}`}>
                        {statusLabels[order.orderStatus] ?? order.orderStatus}
                      </span>
                    </td>
                    <td>
                      <button className="text-button" type="button">
                        상세
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
      )}

      {activeSection === "classes" && (
      <div className="admin-section-stack">
      <section className="admin-section" id="admin-reservations" aria-labelledby="reservations-title">
        <div className="admin-section-heading">
          <span>Reservations</span>
          <h2 id="reservations-title">예약 관리</h2>
        </div>
        <section className="plain-panel admin-panel">
          <div className="admin-panel-title">
            <h2>예약 일정</h2>
            <div className="admin-panel-actions">
              <button
                className={isReservationFormOpen ? "outline-button" : "primary-button"}
                onClick={() => {
                  setIsReservationFormOpen((current) => !current);
                  setMessage("");
                  setError("");
                }}
                type="button"
              >
                {isReservationFormOpen ? <X size={18} /> : <Plus size={18} />}
                {isReservationFormOpen ? "닫기" : "예약 등록"}
              </button>
              <button className="outline-button" onClick={loadReservations} type="button">
                새로고침
              </button>
            </div>
          </div>

          {isReservationFormOpen && (
            <form className="admin-inline-form" onSubmit={submitReservation}>
              <div className="product-form-grid">
                <label>
                  날짜
                  <input
                    type="date"
                    value={reservationForm.date}
                    onChange={(event) => setReservationForm({ ...reservationForm, date: event.target.value })}
                    required
                  />
                </label>
                <label>
                  클래스
                  <select
                    value={reservationForm.lessonId}
                    onChange={(event) => setReservationForm({ ...reservationForm, lessonId: event.target.value })}
                    required
                  >
                    <option value="">선택</option>
                    {lessons.map((lesson) => (
                      <option key={lesson.id} value={lesson.id}>
                        {lesson.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  시작 시간
                  <input
                    type="time"
                    value={reservationForm.startTime}
                    onChange={(event) => setReservationForm({ ...reservationForm, startTime: event.target.value })}
                    required
                  />
                </label>
                <label>
                  종료 시간
                  <input type="time" value={reservationEndTime} disabled readOnly />
                </label>
                <label>
                  수업료
                  <input value={selectedReservationLesson ? formatPrice(selectedReservationLesson.price) : ""} disabled readOnly />
                </label>
                <label>
                  예약금
                  <input value={lessonPolicy ? formatPrice(lessonPolicy.depositAmount) : ""} disabled readOnly />
                </label>
                <label className="wide-field">
                  요청사항
                  <textarea
                    value={reservationForm.request}
                    onChange={(event) => setReservationForm({ ...reservationForm, request: event.target.value })}
                    rows={3}
                  />
                </label>
              </div>
              <div className="product-form-actions">
                <button className="primary-button" type="submit" disabled={!selectedReservationLesson || !lessonPolicy}>
                  <Save size={18} />
                  예약 저장
                </button>
              </div>
            </form>
          )}

          <div className="admin-filter-bar">
            <label>
              <CalendarDays size={18} />
              <input
                type="date"
                value={reservationDateFilter}
                onChange={(event) => setReservationDateFilter(event.target.value)}
              />
            </label>
            <label>
              <CheckCircle2 size={18} />
              <select value={reservationStatusFilter} onChange={(event) => setReservationStatusFilter(event.target.value)}>
                <option value="ALL">전체</option>
                {reservationStatusOrder.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table reservation-admin-table">
              <thead>
                <tr>
                  <th>날짜</th>
                  <th>시간</th>
                  <th>클래스</th>
                  <th>고객</th>
                  <th>연락처</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {reservations.length ? (
                  reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td>{formatDate(reservation.date)}</td>
                      <td>{`${normalizeTime(reservation.startTime)} ~ ${normalizeTime(reservation.endTime)}`}</td>
                      <td>{reservation.lesson.name}</td>
                      <td>
                        <div className="reservation-customer-cell">
                          <strong>{reservation.customer.userName}</strong>
                          <small>{reservation.customer.email}</small>
                        </div>
                      </td>
                      <td>{reservation.customer.phoneNumber}</td>
                      <td>
                        <div className="reservation-price-cell">
                          <strong>{formatPrice(reservation.price)}</strong>
                          <small>예약금 {formatPrice(reservation.deposit)}</small>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            reservation.state === "CANCELED" || reservation.state === "NO_SHOW" ? "danger" : ""
                          }`}
                        >
                          {statusLabels[reservation.state]}
                        </span>
                      </td>
                      <td>
                        <div className="reservation-status-actions">
                          <select
                            value={reservationStatusDrafts[reservation.id] ?? "COMPLETED"}
                            onChange={(event) =>
                              setReservationStatusDrafts({
                                ...reservationStatusDrafts,
                                [reservation.id]: event.target.value as ReservationStatus
                              })
                            }
                            disabled={reservation.state !== "APPROVED"}
                          >
                            {editableReservationStatuses.map((status) => (
                              <option key={status} value={status}>
                                {statusLabels[status]}
                              </option>
                            ))}
                          </select>
                          <button
                            className="text-button"
                            type="button"
                            disabled={reservation.state !== "APPROVED"}
                            onClick={() => void updateReservationStatus(reservation.id)}
                          >
                            수정
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8}>조회된 예약이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      <section className="admin-section" id="admin-lessons" aria-labelledby="lessons-title">
        <div className="admin-section-heading">
          <span>Classes</span>
          <h2 id="lessons-title">클래스 관리</h2>
        </div>
        <div className="admin-lesson-layout">
          <section className="plain-panel admin-panel">
            <div className="admin-panel-title">
              <h2>{lessonForm.id === null ? "클래스 등록" : "클래스 수정"}</h2>
              {lessonForm.id !== null && (
                <button className="outline-button" onClick={() => setLessonForm(emptyLessonForm)} type="button">
                  <X size={18} />
                  취소
                </button>
              )}
            </div>
            <form className="admin-inline-form compact" onSubmit={submitLesson}>
              <label>
                클래스명
                <input
                  value={lessonForm.name}
                  onChange={(event) => setLessonForm({ ...lessonForm, name: event.target.value })}
                  required
                />
              </label>
              <label>
                가격
                <input
                  type="number"
                  min="0"
                  max="1000000"
                  value={lessonForm.price}
                  onChange={(event) => setLessonForm({ ...lessonForm, price: event.target.value })}
                  required
                />
              </label>
              <label>
                수업 시간
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={lessonForm.duration}
                  onChange={(event) => setLessonForm({ ...lessonForm, duration: event.target.value })}
                  required
                />
              </label>
              <button className="primary-button" type="submit">
                <Save size={18} />
                저장
              </button>
            </form>
          </section>

          <section className="plain-panel admin-panel">
            <div className="admin-panel-title">
              <h2>클래스 목록</h2>
              <span>{lessons.length}개 운영중</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table lesson-admin-table">
                <thead>
                  <tr>
                    <th>클래스</th>
                    <th>수업료</th>
                    <th>시간</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {lessons.length ? (
                    lessons.map((lesson) => (
                      <tr key={lesson.id}>
                        <td>{lesson.name}</td>
                        <td>{formatPrice(lesson.price)}</td>
                        <td>{lesson.duration}시간</td>
                        <td>
                          <div className="table-actions">
                            <button className="icon-button bordered" onClick={() => startEditLesson(lesson)} type="button">
                              <Edit3 size={18} />
                            </button>
                            <button
                              className="icon-button bordered danger"
                              onClick={() => void removeLesson(lesson.id)}
                              type="button"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4}>등록된 클래스가 없습니다.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </section>

      <section className="admin-section" id="admin-lessonPolicy" aria-labelledby="lesson-policy-title">
        <div className="admin-section-heading">
          <span>Policy</span>
          <h2 id="lesson-policy-title">예약 정책</h2>
        </div>
        <section className="plain-panel admin-panel">
          <div className="admin-panel-title">
            <h2>예약 정책 수정</h2>
            <span>{lessonPolicy ? `${normalizeTime(lessonPolicy.startTime)} ~ ${normalizeTime(lessonPolicy.endTime)}` : "미설정"}</span>
          </div>
          <form className="admin-inline-form policy-form" onSubmit={submitLessonPolicy}>
            <div className="product-form-grid">
              <label>
                예약 가능 기간
                <input
                  type="number"
                  min="0"
                  value={policyForm.reservationAvailableDays}
                  onChange={(event) => setPolicyForm({ ...policyForm, reservationAvailableDays: event.target.value })}
                  required
                />
              </label>
              <label>
                예약 마감일
                <input
                  type="number"
                  min="0"
                  value={policyForm.reservationDeadlineDays}
                  onChange={(event) => setPolicyForm({ ...policyForm, reservationDeadlineDays: event.target.value })}
                  required
                />
              </label>
              <label>
                취소 마감일
                <input
                  type="number"
                  min="0"
                  value={policyForm.cancelDeadlineDays}
                  onChange={(event) => setPolicyForm({ ...policyForm, cancelDeadlineDays: event.target.value })}
                  required
                />
              </label>
              <label>
                예약금
                <input
                  type="number"
                  min="0"
                  value={policyForm.depositAmount}
                  onChange={(event) => setPolicyForm({ ...policyForm, depositAmount: event.target.value })}
                  required
                />
              </label>
              <label>
                오픈 시간
                <input
                  type="time"
                  value={policyForm.startTime}
                  onChange={(event) => setPolicyForm({ ...policyForm, startTime: event.target.value })}
                  required
                />
              </label>
              <label>
                마감 시간
                <input
                  type="time"
                  value={policyForm.endTime}
                  onChange={(event) => setPolicyForm({ ...policyForm, endTime: event.target.value })}
                  required
                />
              </label>
            </div>
            <fieldset className="weekday-fieldset">
              <legend>정기 휴무일</legend>
              <div className="weekday-check-grid">
                {dayOptions.map((day) => (
                  <label key={day.value}>
                    <input
                      type="checkbox"
                      checked={policyForm.regularDays.includes(day.value)}
                      onChange={() => toggleRegularDay(day.value)}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <button className="primary-button" type="submit">
              <Save size={18} />
              정책 저장
            </button>
          </form>
        </section>
      </section>
      </div>
      )}

      {activeSection === "products" && (
      <section className="admin-section" id="admin-products" aria-labelledby="products-title">
        <div className="admin-section-heading">
          <span>Products</span>
          <h2 id="products-title">상품 관리</h2>
        </div>
        <section className="plain-panel admin-panel">
          <div className="admin-panel-title">
            <h2>상품 판매 및 노출</h2>
            <div className="admin-panel-actions">
              <button
                className={isProductFormOpen ? "outline-button" : "primary-button"}
                onClick={() => {
                  setIsProductFormOpen((current) => !current);
                  setMessage("");
                  setError("");
                }}
                type="button"
              >
                {isProductFormOpen ? <X size={18} /> : <Plus size={18} />}
                {isProductFormOpen ? "닫기" : "상품 등록"}
              </button>
            </div>
          </div>
          {isProductFormOpen && (
            <form className="product-create-form" onSubmit={submitProduct}>
              <div className="product-form-grid">
                <label>
                  상품명
                  <input
                    value={productForm.name}
                    maxLength={50}
                    onChange={(event) => setProductForm({ ...productForm, name: event.target.value })}
                    required
                  />
                </label>
                <label>
                  가격
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={productForm.price}
                    onChange={(event) => setProductForm({ ...productForm, price: event.target.value })}
                    required
                  />
                </label>
                <label>
                  카테고리
                  <select
                    value={productForm.categoryId}
                    onChange={(event) => setProductForm({ ...productForm, categoryId: event.target.value })}
                    required
                    disabled={!categories.length}
                  >
                    <option value="">선택</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  요약
                  <input
                    value={productForm.summary}
                    onChange={(event) => setProductForm({ ...productForm, summary: event.target.value })}
                    placeholder="목록에 표시될 짧은 설명"
                  />
                </label>
                <label>
                  상품 사진
                  <input
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(event) => setProductThumbnailFile(event.target.files?.[0] ?? null)}
                  />
                </label>
                <label className="wide-field">
                  상세 설명
                  <textarea
                    value={productForm.description}
                    onChange={(event) => setProductForm({ ...productForm, description: event.target.value })}
                    rows={4}
                  />
                </label>
              </div>
              {productThumbnailFile && productThumbnailPreview && (
                <div className="product-file-summary">
                  <img src={productThumbnailPreview} alt="선택한 상품 사진 미리보기" />
                  <span>{productThumbnailFile.name}</span>
                </div>
              )}
              {!categories.length && <p className="empty-admin-copy">상품 등록 전에 카테고리를 먼저 등록해주세요.</p>}
              <div className="product-form-actions">
                <button className="primary-button" type="submit" disabled={isCreatingProduct || !categories.length}>
                  <Save size={18} />
                  {isCreatingProduct ? "등록 중" : "DB에 상품 등록"}
                </button>
                <button
                  className="outline-button"
                  onClick={() => {
                    setProductForm(emptyProductForm);
                    setProductThumbnailFile(null);
                    setIsProductFormOpen(false);
                  }}
                  type="button"
                >
                  취소
                </button>
              </div>
            </form>
          )}
          <div className="admin-table-wrap">
            <table className="admin-table product-admin-table">
              <thead>
                <tr>
                  <th>상품</th>
                  <th>카테고리</th>
                  <th>가격</th>
                  <th>판매수</th>
                  <th>조회수</th>
                  <th>상태</th>
                  <th>메인</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="table-product-cell">
                        <img src={product.thumbnail} alt={product.name} />
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>{formatPrice(product.price)}</td>
                    <td>{numberFormatter.format(product.salesCount ?? 0)}</td>
                    <td>{numberFormatter.format(product.viewCount ?? 0)}</td>
                    <td>
                      <span className={`status-badge ${product.status === "SOLD_OUT" ? "danger" : ""}`}>
                        {product.status === "SOLD_OUT" ? "품절" : "판매중"}
                      </span>
                    </td>
                    <td>{product.isMain ? "노출" : "미노출"}</td>
                    <td>
                      <button className="text-button" type="button">
                        수정
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
      )}

      {activeSection === "members" && (
      <section className="admin-section" id="admin-members" aria-labelledby="members-title">
        <div className="admin-section-heading">
          <span>Members</span>
          <h2 id="members-title">회원 관리</h2>
        </div>
        <section className="plain-panel admin-panel">
          <div className="admin-panel-title">
            <h2>회원 계정 요약</h2>
            <span>블랙리스트 {members.filter((member) => member.blacklisted).length}명</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>회원</th>
                  <th>이메일</th>
                  <th>권한</th>
                  <th>성별</th>
                  <th>국적</th>
                  <th>가입일</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.userId}>
                    <td>{member.userName}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`status-badge ${member.blacklisted ? "muted" : ""}`}>
                        {member.blacklisted ? "BLACKLIST" : member.role}
                      </span>
                    </td>
                    <td>{member.gender}</td>
                    <td>{member.nationality}</td>
                    <td>{formatDateTime(member.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </section>
      )}

      {activeSection === "categories" && (
      <section className="admin-section" id="admin-categories" aria-labelledby="categories-title">
        <div className="admin-section-heading">
          <span>Categories</span>
          <h2 id="categories-title">카테고리 관리</h2>
        </div>
        <div className="admin-category-layout">
          <section className="plain-panel admin-panel">
            <div className="admin-panel-title">
              <h2>카테고리 등록</h2>
              <span>{categories.length}개 운영중</span>
            </div>
            <form onSubmit={submit}>
              <label>
                이름
                <input
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  required
                />
              </label>
              <label>
                썸네일 URL
                <input
                  value={form.thumbnail}
                  onChange={(event) => setForm({ ...form, thumbnail: event.target.value })}
                  placeholder="선택 입력"
                />
              </label>
              <button className="primary-button" type="submit">
                <Plus size={18} />
                등록
              </button>
            </form>
          </section>

          <section className="plain-panel admin-panel">
            <div className="admin-panel-title">
              <h2>카테고리 목록</h2>
              <button className="outline-button" onClick={loadCategories} type="button">
                새로고침
              </button>
            </div>
            <div className="admin-list category-admin-list">
              {categories.length ? (
                categories.map((category) => (
                  <article key={category.id}>
                    {editingCategoryId === category.id ? (
                      <form className="category-edit-form" onSubmit={submitEditCategory}>
                        <img src={editForm.thumbnail || fallbackAdminImage} alt="" />
                        <label>
                          이름
                          <input
                            value={editForm.name}
                            onChange={(event) => setEditForm({ ...editForm, name: event.target.value })}
                            required
                          />
                        </label>
                        <label>
                          썸네일 URL
                          <input
                            value={editForm.thumbnail}
                            onChange={(event) => setEditForm({ ...editForm, thumbnail: event.target.value })}
                            placeholder="선택 입력"
                          />
                        </label>
                        <div className="category-actions">
                          <button className="icon-button bordered" type="submit" aria-label="카테고리 저장">
                            <Save size={18} />
                          </button>
                          <button
                            className="icon-button bordered"
                            onClick={cancelEditCategory}
                            type="button"
                            aria-label="수정 취소"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <img src={category.thumbnail || fallbackAdminImage} alt={category.name} />
                        <strong>{category.name}</strong>
                        <div className="category-actions">
                          <button
                            className="icon-button bordered"
                            onClick={() => startEditCategory(category)}
                            type="button"
                            aria-label={`${category.name} 수정`}
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            className="icon-button bordered danger"
                            onClick={() => void removeCategory(category.id)}
                            type="button"
                            aria-label={`${category.name} 삭제`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </>
                    )}
                  </article>
                ))
              ) : (
                <p className="empty-admin-copy">등록된 카테고리가 없습니다.</p>
              )}
            </div>
          </section>
        </div>
      </section>
      )}

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
