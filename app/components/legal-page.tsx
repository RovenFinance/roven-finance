import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function LegalPage({ eyebrow, title, intro, children }: {
  eyebrow: string;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return <main className="legal-page">
    <header>
      <Link href="/"><span className="security-logo"><Image src="/roven-mark-v2.png" width={34} height={34} alt="" unoptimized /></span><strong>Roven<span>Finance</span></strong></Link>
      <Link href="/app">Open app</Link>
    </header>
    <article>
      <Link className="legal-back" href="/"><ArrowLeft size={13} />Back to Roven</Link>
      <span className="legal-eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="legal-intro">{intro}</p>
      <div className="legal-content">{children}</div>
    </article>
    <footer><span>RovenFinance</span><nav><Link href="/methodology">Methodology</Link><Link href="/security">Safety</Link><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></footer>
  </main>;
}
