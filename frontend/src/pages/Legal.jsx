import { useParams, Link } from "react-router-dom";
import { LEGAL } from "@/legal_content";
import Footer, { legalLinks } from "@/components/Footer";
import { ArrowLeft } from "@phosphor-icons/react";

export default function Legal() {
  const { slug } = useParams();
  const data = LEGAL[slug];
  if (!data) {
    return <div className="min-h-screen grid place-items-center text-[var(--muted)]">Page not found. <Link to="/" className="underline ml-2">Go home</Link></div>;
  }
  const otherLinks = legalLinks.filter(l => l.slug !== slug).slice(0, 6);
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-5 flex items-center justify-between">
          <Link to="/" className="font-serif text-2xl">sparQ<span className="text-[var(--primary)]">.</span></Link>
          <Link to="/" className="smallcaps text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1" data-testid="legal-back-home"><ArrowLeft size={14}/> Home</Link>
        </div>
      </header>

      <article className="max-w-6xl mx-auto px-6 md:px-12 py-20">
        <p className="smallcaps text-[var(--primary)]">{data.eyebrow}</p>
        <h1 className="font-serif text-5xl md:text-7xl tracking-tight mt-3 leading-none">{data.title}</h1>
        <p className="text-sm text-[var(--muted)] mt-4">{data.updated}</p>

        <div className="grid md:grid-cols-12 gap-12 mt-16">
          <aside className="md:col-span-4 md:sticky md:top-8 self-start">
            <p className="font-serif italic text-2xl text-[var(--accent)] leading-snug">"{data.pull}"</p>
            <div className="divider-line my-10" />
            <p className="smallcaps text-[var(--muted)] mb-3">More policies</p>
            <ul className="space-y-2">
              {otherLinks.map(l => (
                <li key={l.slug}><Link to={`/legal/${l.slug}`} className="text-sm text-[var(--secondary-fg)] hover:text-[var(--primary)]">{l.label} →</Link></li>
              ))}
            </ul>
          </aside>
          <div className="md:col-span-8 legal-prose">
            {data.sections.map((s, i) => (
              <section key={i}>
                <h2 className="flex items-baseline gap-3"><span className="font-serif text-[var(--primary)] text-base smallcaps">§ {String(i + 1).padStart(2, "0")}</span> {s.h}</h2>
                <p>{s.p}</p>
              </section>
            ))}
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
