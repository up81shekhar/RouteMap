import StaticPage from "../components/legal/StaticPage";

export default function Copyright() {
  return (
    <StaticPage eyebrow="Legal" title="Copyright Policy">
      <p>
        LearnPath is a curation layer, not a content host. Here's exactly what that means in
        practice:
      </p>

      <h2>What we do</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Store metadata about a resource — title, creator, language, duration, topic tag</li>
        <li>Play videos through the official YouTube player, embedded on our pages</li>
        <li>Always show and credit the original creator/channel next to each resource</li>
      </ul>

      <h2>What we never do</h2>
      <ul className="list-disc space-y-1.5 pl-5">
        <li>Download, re-host, or re-upload anyone's video or article content</li>
        <li>Strip or hide attribution, branding, or ads from embedded content</li>
        <li>Circumvent a platform's ads, restrictions, or terms of service</li>
        <li>Claim third-party content as our own</li>
      </ul>

      <h2>Reporting an issue</h2>
      <p>
        If you're a creator and believe your content is mis-credited, misused, or you'd like a
        resource removed from a roadmap, reach out via the <a href="/contact">contact page</a> and
        it'll be reviewed and addressed promptly.
      </p>
    </StaticPage>
  );
}
