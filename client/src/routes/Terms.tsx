import StaticPage from "../components/legal/StaticPage";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Terms() {
  useDocumentMeta({ title: "Terms of Service", description: "The terms governing use of RouteMap's free learning roadmaps and account features.", path: "/terms" });

  return (
    <StaticPage eyebrow="Legal" title="Terms of Service">
      <p>Last updated: {new Date().getFullYear()}</p>

      <h2>What this site is</h2>
      <p>
        RouteMap organizes existing free educational resources — primarily YouTube videos, plus
        articles and practice material — into structured roadmaps. We don't host or own the
        underlying course content; see our <a href="/copyright">copyright policy</a> for how
        third-party content is handled.
      </p>

      <h2>Accounts</h2>
      <p>
        You're responsible for keeping your account credentials secure. You can use the site
        without an account, but progress tracking requires one.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don't attempt to scrape, disrupt, or reverse-engineer the platform's curation or
        recommendation systems, and don't use the site to redistribute embedded content outside of
        normal browser use.
      </p>

      <h2>No guarantees</h2>
      <p>
        Roadmaps and estimated hours are guidance, not a promise of outcomes like job placement or
        exam results. External resources are curated in good faith but their availability and
        accuracy depend on the original creators.
      </p>

      <h2>Changes</h2>
      <p>These terms may be updated as the platform evolves; the "last updated" date reflects that.</p>
    </StaticPage>
  );
}
