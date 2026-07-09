import {
  AlertTriangle,
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
import { api, CategoryResponse } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { formatPrice, products } from "../data/products";

type AdminSection = "dashboard" | "orders" | "products" | "members" | "categories";
type OrderStatus = "결제완료" | "제작중" | "배송준비" | "배송완료" | "취소요청";
type MemberGrade = "VIP" | "일반" | "휴면관리";

type AdminOrder = {
  id: string;
  customer: string;
  productId: number;
  productName: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  orderedAt: string;
};

type AdminMember = {
  id: number;
  name: string;
  email: string;
  grade: MemberGrade;
  orderCount: number;
  totalSpent: number;
  joinedAt: string;
};

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

const mockOrders: AdminOrder[] = [
  {
    id: "H20260709014",
    customer: "김하린",
    productId: 1,
    productName: "Gourd Bag (M)",
    quantity: 1,
    total: 368000,
    status: "제작중",
    orderedAt: "2026-07-09 10:24"
  },
  {
    id: "H20260709013",
    customer: "이서윤",
    productId: 4,
    productName: "Folding Card Wallet",
    quantity: 2,
    total: 260000,
    status: "배송준비",
    orderedAt: "2026-07-09 09:41"
  },
  {
    id: "H20260708027",
    customer: "박민재",
    productId: 2,
    productName: "Gourd Bag (S)",
    quantity: 1,
    total: 219000,
    status: "결제완료",
    orderedAt: "2026-07-08 18:05"
  },
  {
    id: "H20260708019",
    customer: "최유진",
    productId: 6,
    productName: "Bando Key Ring",
    quantity: 4,
    total: 60000,
    status: "배송완료",
    orderedAt: "2026-07-08 13:22"
  },
  {
    id: "H20260707031",
    customer: "정도현",
    productId: 3,
    productName: "Bucket Bag - Brown",
    quantity: 1,
    total: 219000,
    status: "취소요청",
    orderedAt: "2026-07-07 16:37"
  },
  {
    id: "H20260707018",
    customer: "오지안",
    productId: 5,
    productName: "Flat Card Case (M)",
    quantity: 3,
    total: 204000,
    status: "배송완료",
    orderedAt: "2026-07-07 11:12"
  }
];

const mockMembers: AdminMember[] = [
  {
    id: 101,
    name: "김하린",
    email: "harin@example.com",
    grade: "VIP",
    orderCount: 8,
    totalSpent: 1286000,
    joinedAt: "2026-03-18"
  },
  {
    id: 102,
    name: "이서윤",
    email: "seoyoon@example.com",
    grade: "일반",
    orderCount: 3,
    totalSpent: 421000,
    joinedAt: "2026-04-02"
  },
  {
    id: 103,
    name: "박민재",
    email: "minjae@example.com",
    grade: "일반",
    orderCount: 2,
    totalSpent: 287000,
    joinedAt: "2026-05-21"
  },
  {
    id: 104,
    name: "최유진",
    email: "yujin@example.com",
    grade: "휴면관리",
    orderCount: 1,
    totalSpent: 60000,
    joinedAt: "2026-01-12"
  }
];

const statusOrder: OrderStatus[] = ["결제완료", "제작중", "배송준비", "배송완료", "취소요청"];
const numberFormatter = new Intl.NumberFormat("ko-KR");

const scrollToSection = (section: AdminSection) => {
  document.getElementById(`admin-${section}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export default function AdminPage() {
  const { accessToken } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>("dashboard");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
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

  useEffect(loadCategories, []);

  const dashboard = useMemo(() => {
    const totalSales = mockOrders.reduce((sum, order) => sum + order.total, 0);
    const pendingOrders = mockOrders.filter((order) => order.status !== "배송완료" && order.status !== "취소요청").length;
    const lowStockProducts = products.filter((product) => product.stock > 0 && product.stock <= 6).length;
    const soldOutProducts = products.filter((product) => product.status === "SOLD_OUT").length;
    const vipMembers = mockMembers.filter((member) => member.grade === "VIP").length;
    const averageOrderValue = totalSales / mockOrders.length;

    const popularProducts = products
      .map((product) => {
        const relatedOrders = mockOrders.filter((order) => order.productId === product.id);
        const soldQuantity = relatedOrders.reduce((sum, order) => sum + order.quantity, 0);
        const sales = relatedOrders.reduce((sum, order) => sum + order.total, 0);
        return { ...product, soldQuantity, sales };
      })
      .filter((product) => product.soldQuantity > 0)
      .sort((a, b) => b.soldQuantity - a.soldQuantity || b.sales - a.sales)
      .slice(0, 4);

    return {
      totalSales,
      pendingOrders,
      lowStockProducts,
      soldOutProducts,
      vipMembers,
      averageOrderValue,
      popularProducts
    };
  }, []);

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
      value: `${numberFormatter.format(mockOrders.length)}건`,
      delta: `${dashboard.pendingOrders}건 처리 필요`,
      helper: "결제완료, 제작중, 배송준비 기준",
      icon: ReceiptText,
      tone: "blue"
    },
    {
      label: "회원 지표",
      value: `${numberFormatter.format(mockMembers.length)}명`,
      delta: `VIP ${dashboard.vipMembers}명`,
      helper: "최근 가입 및 구매 회원 포함",
      icon: UserCheck,
      tone: "clay"
    },
    {
      label: "상품 지표",
      value: `${numberFormatter.format(products.length)}개`,
      delta: `품절 ${dashboard.soldOutProducts}개`,
      helper: `재고 주의 ${dashboard.lowStockProducts}개`,
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
              <span>{mockOrders.length}건</span>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>주문번호</th>
                    <th>고객</th>
                    <th>상품</th>
                    <th>금액</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.productName}</td>
                      <td>{formatPrice(order.total)}</td>
                      <td>
                        <span className={`status-badge ${order.status === "취소요청" ? "danger" : ""}`}>
                          {order.status}
                        </span>
                      </td>
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
                <article key={product.id}>
                  <strong>{index + 1}</strong>
                  <img src={product.thumbnail} alt={product.name} />
                  <div>
                    <b>{product.name}</b>
                    <small>
                      {product.soldQuantity}개 판매 · {formatPrice(product.sales)}
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
            const count = mockOrders.filter((order) => order.status === status).length;
            return (
              <article key={status}>
                <span>{status}</span>
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
                  <th>수량</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.orderedAt}</td>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.quantity}</td>
                    <td>
                      <span className={`status-badge ${order.status === "취소요청" ? "danger" : ""}`}>
                        {order.status}
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
            <h2>상품 재고 및 노출</h2>
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
                  <th>재고</th>
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
                    <td className={product.stock <= 6 ? "stock-warning" : ""}>
                      {product.stock <= 6 && product.stock > 0 && <AlertTriangle size={15} />}
                      {product.stock}
                    </td>
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
            <h2>회원 구매 요약</h2>
            <span>관리 대상 {mockMembers.filter((member) => member.grade === "휴면관리").length}명</span>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>회원</th>
                  <th>이메일</th>
                  <th>등급</th>
                  <th>주문</th>
                  <th>누적 구매</th>
                  <th>가입일</th>
                </tr>
              </thead>
              <tbody>
                {mockMembers.map((member) => (
                  <tr key={member.id}>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>
                      <span className={`status-badge ${member.grade === "휴면관리" ? "muted" : ""}`}>
                        {member.grade}
                      </span>
                    </td>
                    <td>{member.orderCount}건</td>
                    <td>{formatPrice(member.totalSpent)}</td>
                    <td>{member.joinedAt}</td>
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
