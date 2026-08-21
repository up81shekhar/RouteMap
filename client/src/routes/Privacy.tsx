import StaticPage from "../components/legal/StaticPage";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function Privacy() {
  useDocumentMeta({ title: "Privacy Policy", description: "How LearnPath handles your data, cookies, and third-party services like Google AdSense and YouTube.", path: "/privacy" });

  return (
    <StaticPage eyebrow="Legal" title="Privacy Policy">
      <p>Last updated: {new Date().getFullYear()}</p>

      <h2>What we collect</h2>
      <p>
        If you create an account: your name, email address, and learning progress (which topics
        and lessons you've completed). We don't ask for anything beyond what's needed to save your
        progress and show you a dashboard.
      </p>
      <p>
        If you don't create an account, you can still use roadmaps and lessons — progress is kept
        only in your browser and isn't sent to us.
      </p>

      <h2>Cookies</h2>
      <p>
        We set one functional cookie to keep you signed in (an httpOnly session cookie — it can't
        be read by page scripts). We don't use tracking or advertising cookies of our own.
      </p>

      <h2>Third-party services</h2>
      <p>
        <strong>Video playback:</strong> lessons embed videos via YouTube's privacy-enhanced player
        (youtube-nocookie.com), which avoids setting YouTube tracking cookies until you actually
        press play. Once you play a video, Google's own privacy policy applies to that playback.
      </p>
      <p>
        <strong>Advertising:</strong> this site uses Google AdSense to show ads, which may use
        cookies to personalize ads based on your visits here and other sites. You can opt out of
        personalized advertising through{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noreferrer">
          Google's Ad Settings
        </a>
        . See Google's own explanation of{" "}
        <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer">
          how it uses data in advertising
        </a>
        .
      </p>

      <h2>Data deletion</h2>
      <p>
        To delete your account and associated progress data, reach out via the{" "}
        <a href="/contact">contact page</a>.
      </p>

      <h2>Changes</h2>
      <p>If this policy changes materially, the "last updated" date above will change with it.</p>
    </StaticPage>
  );
}
