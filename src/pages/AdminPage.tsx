import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Edit3,
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
  AdminUserSearchResponse,
  api,
  CategoryResponse
} from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatPrice, mapProductSummary, Product } from "../data/products";

type AdminSection = "dashboard" | "orders" | "products" | "members" | "categories";
type OrderStatus = "PURCHASED" | "IN_DELIVERY" | "DELIVERED" | "COMPLETE" | "CANCELED";

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
  { id: "categories", label: "카테고리 관리", icon: Tags }
];

const statusOrder: OrderStatus[] = ["PURCHASED", "IN_DELIVERY", "DELIVERED", "COMPLETE", "CANCELED"];
const numberFormatter = new Intl.NumberFormat("ko-KR");

const statusLabels: Record<string, string> = {
  PURCHASED: "결제완료",
  IN_DELIVERY: "배송중",
  DELIVERED: "배송완료",
  COMPLETE: "구매확정",
  CANCELED: "취소"
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

const scrollToSection = (section: AdminSection) => {
  document.getElementById(`admin-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

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
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ name: "", thumbnail: "" });

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
  useEffect(loadAdminData, [accessToken]);

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

  const startEditCategory = (category: CategoryResponse) => {
    setEditingCategoryId(category.id);
    setEditForm({ name: category.name, thumbnail: category.thumbnail });
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
    scrollToSection(section);
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

      <section className="admin-section" id="admin-orders" aria-labelledby="orders-title">
        <div className="admin-section-heading">
          <span>Orders</span>
          <h2 id="orders-title">주문 관리 보강</h2>
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

      <section className="admin-section" id="admin-products" aria-labelledby="products-title">
        <div className="admin-section-heading">
          <span>Products</span>
          <h2 id="products-title">상품 관리 보강</h2>
        </div>
        <section className="plain-panel admin-panel">
          <div className="admin-panel-title">
            <h2>상품 판매 및 노출</h2>
            <button className="primary-button" type="button">
              <Plus size={18} />
              상품 등록
            </button>
          </div>
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

      <section className="admin-section" id="admin-members" aria-labelledby="members-title">
        <div className="admin-section-heading">
          <span>Members</span>
          <h2 id="members-title">회원 관리 보강</h2>
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

      <section className="admin-section" id="admin-categories" aria-labelledby="categories-title">
        <div className="admin-section-heading">
          <span>Categories</span>
          <h2 id="categories-title">카테고리 관리 유지</h2>
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
                  required
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
                        <img src={editForm.thumbnail} alt="" />
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
                            required
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
                        <img src={category.thumbnail} alt={category.name} />
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

      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
