import { FormEvent, useEffect, useState } from "react";
import { api, CategoryResponse } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function AdminPage() {
  const { accessToken } = useAuth();
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", thumbnail: "" });

  const loadCategories = () => {
    api
      .categories()
      .then(setCategories)
      .catch(() => setCategories([]));
  };

  useEffect(loadCategories, []);

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

  const removeCategory = async (categoryId: number) => {
    if (!accessToken) return;
    try {
      await api.deleteCategory(accessToken, categoryId);
      setCategories((current) => current.filter((category) => category.id !== categoryId));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "카테고리 삭제에 실패했습니다.");
    }
  };

  return (
    <div className="page admin-page">
      <h1>Admin</h1>
      <div className="admin-layout">
        <section className="plain-panel">
          <h2>카테고리 등록</h2>
          <form onSubmit={submit}>
            <label>
              이름
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </label>
            <label>
              썸네일 URL
              <input
                value={form.thumbnail}
                onChange={(event) => setForm({ ...form, thumbnail: event.target.value })}
              />
            </label>
            <button className="primary-button" type="submit">
              등록
            </button>
          </form>
        </section>
        <section className="plain-panel">
          <h2>카테고리 목록</h2>
          <div className="admin-list">
            {categories.map((category) => (
              <article key={category.id}>
                <img src={category.thumbnail} alt={category.name} />
                <strong>{category.name}</strong>
                <button className="text-button" onClick={() => void removeCategory(category.id)}>
                  삭제
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>
      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
