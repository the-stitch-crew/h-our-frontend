import { FormEvent, useEffect, useState } from "react";
import { api, AddressPayload, AddressResponse } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function MyPage() {
  const { accessToken, user, updateMe, logout } = useAuth();
  const [addresses, setAddresses] = useState<AddressResponse[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState({
    userName: user?.userName ?? "",
    phoneNumber: user?.phoneNumber ?? "",
    nationality: user?.nationality ?? "KOREA"
  });
  const [addressForm, setAddressForm] = useState<AddressPayload>({
    zipCode: "",
    roadAddress: "",
    oldAddress: "",
    addressDetail: "",
    isMain: false
  });

  useEffect(() => {
    if (!user) return;
    setProfile({
      userName: user.userName,
      phoneNumber: user.phoneNumber,
      nationality: user.nationality
    });
  }, [user]);

  useEffect(() => {
    if (!accessToken) return;
    api
      .addresses(accessToken)
      .then(setAddresses)
      .catch(() => setAddresses([]));
  }, [accessToken]);

  const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setError("");
    try {
      await updateMe(profile);
      setMessage("회원 정보가 수정되었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "회원 정보 수정에 실패했습니다.");
    }
  };

  const submitAddress = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!accessToken) return;
    setMessage("");
    setError("");
    try {
      const nextAddress = await api.createAddress(accessToken, addressForm);
      setAddresses((current) => [...current, nextAddress]);
      setAddressForm({ zipCode: "", roadAddress: "", oldAddress: "", addressDetail: "", isMain: false });
      setMessage("배송지가 추가되었습니다.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "배송지 추가에 실패했습니다.");
    }
  };

  return (
    <div className="page mypage">
      <h1>My page</h1>
      <div className="mypage-layout">
        <section className="plain-panel">
          <h2>회원 정보</h2>
          <p>{user?.email}</p>
          <form onSubmit={submitProfile}>
            <label>
              이름
              <input
                value={profile.userName}
                onChange={(event) => setProfile({ ...profile, userName: event.target.value })}
              />
            </label>
            <label>
              휴대폰 번호
              <input
                value={profile.phoneNumber}
                onChange={(event) => setProfile({ ...profile, phoneNumber: event.target.value })}
              />
            </label>
            <label>
              국적
              <input
                value={profile.nationality}
                onChange={(event) => setProfile({ ...profile, nationality: event.target.value })}
              />
            </label>
            <button className="primary-button" type="submit">
              저장
            </button>
          </form>
          <button className="text-button" onClick={() => void logout()}>
            로그아웃
          </button>
        </section>

        <section className="plain-panel">
          <h2>배송지</h2>
          <div className="address-list">
            {addresses.length ? (
              addresses.map((address) => (
                <article key={address.id} className="address-item">
                  <strong>{address.isMain ? "기본 배송지" : "배송지"}</strong>
                  <p>
                    [{address.zipCode}] {address.roadAddress} {address.addressDetail}
                  </p>
                </article>
              ))
            ) : (
              <p>등록된 배송지가 없습니다.</p>
            )}
          </div>
          <form onSubmit={submitAddress}>
            <label>
              우편번호
              <input
                value={addressForm.zipCode}
                onChange={(event) => setAddressForm({ ...addressForm, zipCode: event.target.value })}
                required
              />
            </label>
            <label>
              도로명 주소
              <input
                value={addressForm.roadAddress}
                onChange={(event) => setAddressForm({ ...addressForm, roadAddress: event.target.value })}
                required
              />
            </label>
            <label>
              상세 주소
              <input
                value={addressForm.addressDetail}
                onChange={(event) => setAddressForm({ ...addressForm, addressDetail: event.target.value })}
                required
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={Boolean(addressForm.isMain)}
                onChange={(event) => setAddressForm({ ...addressForm, isMain: event.target.checked })}
              />
              기본 배송지로 설정
            </label>
            <button className="outline-button" type="submit">
              배송지 추가
            </button>
          </form>
        </section>
      </div>
      {message && <p className="form-success">{message}</p>}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
