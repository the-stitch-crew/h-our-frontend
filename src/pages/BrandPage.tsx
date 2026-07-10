const brandPrinciples = [
  {
    title: "직접 만드는 즐거움",
    description: "가죽을 고르고 자르고 바느질하는 시간 속에 자신의 취향과 이야기를 담습니다."
  },
  {
    title: "오래 사용하는 즐거움",
    description: "빠르게 교체되는 물건보다 오래 곁에 두며 깊은 가치가 생기는 물건을 만듭니다."
  },
  {
    title: "나만의 물건이 되는 즐거움",
    description: "손때와 색의 변화, 생활의 흔적까지 세상에 하나뿐인 기록으로 받아들입니다."
  }
];

const studioValues = ["베지터블 가죽", "시간의 흔적", "깊어지는 색", "생활에 맞는 형태"];

export default function BrandPage() {
  return (
    <div className="brand-page">
      <section className="brand-hero">
        <div className="brand-hero-copy">
          <span>Brand philosophy</span>
          <h1>h&apos;our는 우리의 시간으로 완성되는 가죽을 만듭니다.</h1>
          <p>
            h&apos;our에는 시간을 뜻하는 hour와 우리의 의미를 가진 our가 함께 담겨 있습니다.
            만든 사람의 시간과 사용하는 사람의 시간이 만나 하나의 물건이 되고, 그 시간이 곧 아워의 이야기가 됩니다.
          </p>
        </div>
        <img
          src="https://hourleather.com/cdn/shop/files/preview_images/036e245aca1d430fac7f6c311c75a4c7.thumbnail.0000000000.jpg?v=1779702553&width=1800"
          alt="h'our leather studio work table"
        />
      </section>

      <section className="brand-statement">
        <span>Our attitude</span>
        <p>
          아워의 제품은 공방에서 제작이 끝나는 순간 완성되지 않습니다. 사용자의 체온과 손길,
          공기와 햇빛을 지나며 색이 깊어지고 자연스러운 광택과 흔적이 생길 때 비로소 각자의 물건이 됩니다.
        </p>
      </section>

      <section className="brand-principles" aria-label="h'our 브랜드 원칙">
        {brandPrinciples.map((principle, index) => (
          <article key={principle.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{principle.title}</h2>
            <p>{principle.description}</p>
          </article>
        ))}
      </section>

      <section className="brand-material">
        <div>
          <span>Material and form</span>
          <h2>시간을 더할수록 깊어지는 베지터블 가죽</h2>
        </div>
        <p>
          베지터블 가죽은 처음의 모습 그대로 멈춰 있는 소재가 아닙니다. 흠집과 색의 변화는 손상이 아니라
          함께 보낸 시간을 보여주는 기록이며, 사용할수록 사용자를 닮아가는 아름다움입니다.
        </p>
        <ul>
          {studioValues.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </section>

      <section className="brand-closing">
        <span>h&apos;our studio</span>
        <h2>시간을 더할수록, 우리의 인생처럼 깊어지는 가죽의 아름다움.</h2>
      </section>
    </div>
  );
}
