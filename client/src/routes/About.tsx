import StaticPage from "../components/legal/StaticPage";

export default function About() {
  return (
    <StaticPage eyebrow="About" title="What LearnPath is">
      <p>
        Free educational content — YouTube videos, docs, articles — is everywhere. What's missing
        isn't more content, it's structure: what to learn first, what's next, which resources are
        actually good, and how to know you're ready for a job.
      </p>
      <p>
        LearnPath is a structured learning layer on top of the free educational content that
        already exists. We don't host courses. We chart them into sequenced roadmaps — organized
        by topic, difficulty, and prerequisite — and layer progress tracking and practice on top.
      </p>
      <h2>How curation works</h2>
      <p>
        Every roadmap is a sequence of stations (topics). Each station links to curated resources —
        usually more than one, so you can pick the source and language that fits you — always
        credited to the original creator.
      </p>
      <h2>Video playback</h2>
      <p>
        Videos are shown through the official YouTube player. We never download, re-host, or strip
        attribution from anyone's content — see our{" "}
        <a href="/copyright">copyright policy</a> for the full detail.
      </p>
    </StaticPage>
  );
}
