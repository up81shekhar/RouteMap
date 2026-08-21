import { useEffect } from "react";

export function useJsonLd(data: Record<string, unknown> | null) {
  useEffect(() => {
    const id = "jsonld-page";
    document.getElementById(id)?.remove();
    if (!data) return;

    const script = document.createElement("script");
    script.id = id;
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);

    return () => {
      document.getElementById(id)?.remove();
    };
  }, [data]);
}
