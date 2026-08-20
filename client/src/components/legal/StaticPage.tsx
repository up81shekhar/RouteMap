import { ReactNode } from "react";

export default function StaticPage({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <div className="container-page max-w-2xl py-12">
      <p className="station-code mb-2">{eyebrow}</p>
      <h1 className="mb-8 font-display text-2xl font-semibold">{title}</h1>
      <div className="space-y-5 text-sm leading-relaxed text-text-muted [&_h2]:mt-8 [&_h2]:mb-2 [&_h2]:font-display [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-text-primary [&_a]:text-accent [&_a]:hover:text-accent-hover">
        {children}
      </div>
    </div>
  );
}
