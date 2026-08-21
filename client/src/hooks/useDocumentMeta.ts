import { useEffect } from "react";

export const SITE_URL = "https://routemap-free.vercel.app";
export const SITE_NAME = "LearnPath";

function setMetaTag(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

type Options = {
  title: string;
  description?: string;
  /** Path only, e.g. "/roadmaps/dsa" — used to build the canonical URL. Defaults to the current path. */
  path?: string;
  /** Set true on private/gated pages (admin, dashboard) so they don't get indexed. */
  noindex?: boolean;
};

export function useDocumentMeta({ title, description, path, noindex }: Options) {
  useEffect(() => {
    const fullTitle = title === SITE_NAME ? title : `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
    }
    setMetaTag("property", "og:title", fullTitle);
    setMetaTag("property", "og:type", "website");

    const canonicalUrl = `${SITE_URL}${path ?? window.location.pathname}`;
    setLinkTag("canonical", canonicalUrl);
    setMetaTag("property", "og:url", canonicalUrl);

    const robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (noindex) {
      setMetaTag("name", "robots", "noindex, nofollow");
    } else if (robotsEl) {
      robotsEl.remove(); // fall back to indexable (no robots tag = index, follow)
    }
  }, [title, description, path, noindex]);
}
