export default function ShippingPolicyPage() {
  return (
    <div className="page policy-page">
      <span>Policy</span>
      <h1>배송 정책</h1>
      <section className="plain-panel policy-panel" aria-label="h'our 배송 정책">
        <h2>h&apos;our 배송 정책</h2>
        <div className="policy-sections">
          <article className="policy-section">
            <h3>제1조 (배송 안내)</h3>
            <p>
              h&apos;our의 모든 제품은 <strong>주문 제작(Made-to-Order)</strong> 방식으로 제작되므로, 주문 확인 후
              제작이 시작됩니다. 제작 기간은 상품 페이지에 별도 안내되며, 일반적으로{" "}
              <strong>영업일 기준 7~14일</strong> 소요됩니다.
            </p>
          </article>

          <article className="policy-section">
            <h3>제2조 (국내 배송)</h3>
            <ul>
              <li>
                배송사: <strong>우체국택배</strong>
              </li>
              <li>
                배송비: <strong>4,000원</strong> / <strong>50,000원 이상 구매 시 무료배송</strong>
              </li>
              <li>
                제작 완료 후 <strong>1~3 영업일 이내</strong> 출고됩니다.
              </li>
              <li>
                출고 후 <strong>1~3 영업일 이내</strong> 수령 가능합니다.
              </li>
            </ul>
          </article>

          <article className="policy-section">
            <h3>제3조 (해외 배송)</h3>
            <ul>
              <li>현재 해외 배송은 지원하지 않습니다. (추후 안내 예정)</li>
            </ul>
          </article>

          <article className="policy-section">
            <h3>제4조 (배송 지연)</h3>
            <p>아래의 경우 배송이 지연될 수 있습니다.</p>
            <ul>
              <li>주문 폭주 또는 제작 난이도가 높은 경우</li>
              <li>천재지변, 택배사 사정 등 불가항력적 상황</li>
              <li>배송 지연 시 h-our@naver.com으로 개별 안내드립니다.</li>
            </ul>
          </article>

          <article className="policy-section">
            <h3>제5조 (배송지 변경 및 오입력)</h3>
            <ul>
              <li>
                배송지 변경은 <strong>출고 전</strong>에만 가능합니다.
              </li>
              <li>고객의 주소 오입력으로 인한 배송 사고에 대해 h&apos;our는 책임을 지지 않습니다.</li>
              <li>변경 요청은 h-our@naver.com으로 빠르게 연락 주시기 바랍니다.</li>
            </ul>
          </article>

          <article className="policy-section">
            <h3>제6조 (분실 및 파손)</h3>
            <ul>
              <li>
                배송 중 분실·파손 발생 시 수령일로부터 <strong>7일 이내</strong> 사진과 함께 문의해 주세요.
              </li>
              <li>택배사 귀책 사유의 경우 택배사를 통해 보상 절차를 안내해 드립니다.</li>
            </ul>
          </article>

          <p className="policy-contact">
            <strong>문의</strong> 배송 관련 문의: <strong>h-our@naver.com</strong>
          </p>
        </div>
      </section>
    </div>
  );
}
