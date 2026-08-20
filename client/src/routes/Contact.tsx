import StaticPage from "../components/legal/StaticPage";

export default function Contact() {
  return (
    <StaticPage eyebrow="Get in touch" title="Contact">
      <p>
        Found a broken link, a mis-tagged video, or have a roadmap you'd like to see added? We'd
        like to hear about it — open an issue on{" "}
        <a href="https://github.com/up81shekhar/RouteMap" target="_blank" rel="noreferrer">
          the project's GitHub repository
        </a>{" "}
        and it'll get reviewed.
      </p>
      <p>
        For a specific resource that seems broken, outdated, or wrongly credited, use the report
        option on that resource's page where available — it routes straight to review.
      </p>
    </StaticPage>
  );
}
