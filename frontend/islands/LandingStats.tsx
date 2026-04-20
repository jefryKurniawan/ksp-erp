/** @jsxImportSource preact */
import { useState, useEffect } from "preact/hooks";

export default function LandingStats() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    const element = document.getElementById("stats-section");
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const stats = [
    { number: 500, suffix: "+", label: "Anggota Aktif", color: "text-blue-600" },
    { number: 1000, suffix: " jt", label: "Total Simpanan", color: "text-green-600" },
    { number: 50, suffix: " jt", label: "Pinjaman Disalurkan", color: "text-purple-600" },
    { number: 98, suffix: "%", label: "Kepuasan Anggota", color: "text-orange-600" },
  ];

  return (
    <section 
      id="stats-section"
      class="relative py-24 bg-fixed bg-cover bg-center"
      style={{
        backgroundImage: `url("https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1920&q=80")`,
      }}
    >
      <div class="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-purple-900/90"></div>
      
      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">
            Trak Rekaman Kami
          </h2>
          <p class="text-lg text-gray-200">
            Kepercayaan anggota adalah prioritas utama kami
          </p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} class="text-center">
              <div class={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                {isVisible && (
                  <AnimatedNumber target={stat.number} />
                )}
                {stat.suffix}
              </div>
              <div class="text-gray-200">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedNumber({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    const duration = 2000;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      setCount(Math.floor(progress * target));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target]);

  return <>{count.toLocaleString("id-ID")}</>;
}