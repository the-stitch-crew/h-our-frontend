const brandPrinciples = [
  {
    title: "손의 속도",
    description: "서두르지 않는 제작 과정을 통해 가죽의 결, 두께, 마감이 자연스럽게 드러나도록 만듭니다."
  },
  {
    title: "일상의 균형",
    description: "눈에 띄기보다 오래 곁에 남는 형태를 고릅니다. 매일 드는 물건일수록 조용한 균형이 필요합니다."
  },
  {
    title: "시간의 기록",
    description: "사용자의 손과 계절을 지나며 남는 자국까지 제품의 일부로 받아들이는 물건을 지향합니다."
  }
];

const studioValues = ["절제된 실루엣", "견고한 구조", "따뜻한 색감", "수선 가능한 물건"];

export default function BrandPage() {
  return (
    <div className="brand-page">
      <section className="brand-hero">
        <div className="brand-hero-copy">
          <span>Brand philosophy</span>
          <h1>h&apos;our는 손으로 만든 시간이 오래 남는다고 믿습니다.</h1>
          <p>
            아워의 제품은 빠르게 지나가는 유행보다 매일의 손에 천천히 익어가는 물건을 향합니다.
            좋은 가죽, 단정한 구조, 고요한 색을 바탕으로 시간이 지날수록 더 자연스러워지는 생활의 도구를 만듭니다.
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
          좋은 물건은 완성되는 순간보다 사용되는 시간 속에서 더 분명해집니다. h&apos;our는 새것의 완벽함보다,
          오래 쓰며 생기는 윤기와 손때가 어울리는 가죽 제품을 만듭니다.
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
          <h2>단정하지만 차갑지 않은 물건</h2>
        </div>
        <p>
          가죽의 질감이 충분히 보이도록 장식은 덜어내고, 손이 자주 닿는 부분의 마감은 더 세심하게 다룹니다.
          h&apos;our가 고르는 색과 형태는 계절과 옷차림에 부드럽게 섞이면서도 오래 질리지 않는 방향을 따릅니다.
        </p>
        <ul>
          {studioValues.map((value) => (
            <li key={value}>{value}</li>
          ))}
        </ul>
      </section>

      <section className="brand-closing">
        <span>h&apos;our studio</span>
        <h2>만드는 사람의 시간에서 사용하는 사람의 시간으로.</h2>
      </section>
    </div>
  );
}
