export default function AboutPage() {
  return (
    <div className="page about-page">
      <section className="about-hero">
        <img
          src="https://hourleather.com/cdn/shop/files/preview_images/036e245aca1d430fac7f6c311c75a4c7.thumbnail.0000000000.jpg?v=1779702553&width=1800"
          alt="h'our studio work table"
        />
        <div>
          <span>About h&apos;our</span>
          <h1>시간을 담는 가죽공방</h1>
          <p>
            h&apos;our는 손으로 만드는 시간이 물건의 표정이 된다고 믿습니다. 절제된 형태, 차분한 색,
            오래 쓰기 좋은 구조를 중심에 두고 제품과 클래스를 운영합니다.
          </p>
        </div>
      </section>
      <section className="values-grid">
        <article>
          <h2>Slow craft</h2>
          <p>빠른 소비보다 오래 쓰는 경험을 위해 소재와 마감을 천천히 살핍니다.</p>
        </article>
        <article>
          <h2>Daily object</h2>
          <p>특별한 날만이 아니라 매일의 손에 자연스럽게 닿는 물건을 만듭니다.</p>
        </article>
        <article>
          <h2>Learn by hand</h2>
          <p>원데이 클래스는 완성품보다 만드는 시간을 경험하는 데 초점을 둡니다.</p>
        </article>
      </section>
    </div>
  );
}
