import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Shell from "./components/layout/Shell";
import Home from "./routes/Home";
import Roadmaps from "./routes/Roadmaps";
import RoadmapDetail from "./routes/RoadmapDetail";
import TopicDetail from "./routes/TopicDetail";
import Login from "./routes/Login";
import ForgotPassword from "./routes/ForgotPassword";
import ResetPassword from "./routes/ResetPassword";
import Signup from "./routes/Signup";
import Dashboard from "./routes/Dashboard";
import Search from "./routes/Search";
import About from "./routes/About";
import Contact from "./routes/Contact";
import Privacy from "./routes/Privacy";
import Terms from "./routes/Terms";
import Copyright from "./routes/Copyright";
import NotFound from "./routes/NotFound";
import RequireAdmin from "./components/admin/RequireAdmin";
import AdminLayout from "./routes/admin/AdminLayout";
import AdminRoadmapList from "./routes/admin/AdminRoadmapList";
import AdminRoadmapNew from "./routes/admin/AdminRoadmapNew";
import AdminRoadmapEditor from "./routes/admin/AdminRoadmapEditor";
import AdminTopicResources from "./routes/admin/AdminTopicResources";
import AdminTopicPractice from "./routes/admin/AdminTopicPractice";
import AdminPlaylistImport from "./routes/admin/AdminPlaylistImport";
import AdminNotesList from "./routes/admin/AdminNotesList";
import AdminNoteEditor from "./routes/admin/AdminNoteEditor";
import Notes from "./routes/Notes";
import NoteDetail from "./routes/NoteDetail";
import CreateInstitution from "./routes/CreateInstitution";
import InstitutionDashboard from "./routes/InstitutionDashboard";
import { useAuthStore } from "./store/authStore";
import { useAdminStore } from "./store/adminStore";
import { initAnalytics, trackPageview } from "./lib/analytics";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    // Try to restore a session from the refresh cookie, then load the
    // roadmap catalog — both fall back to local demo data automatically
    // if the API isn't reachable (see authStore/adminStore).
    void useAuthStore.getState().hydrate();
    void useAdminStore.getState().loadRoadmaps();
    initAnalytics();
  }, []);

  useEffect(() => {
    // GA4 doesn't know about client-side navigation on its own — fire a
    // pageview manually whenever the route changes. No-ops until
    // VITE_GA_MEASUREMENT_ID is configured (see lib/analytics.ts).
    trackPageview(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  useEffect(() => {
    // React Router doesn't reset scroll position on navigation like a
    // traditional multi-page site — without this, going from a long page
    // (e.g. the roadmap line) to a short one (e.g. a topic) keeps the old
    // scroll offset, so the new page appears to "open from the bottom".
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/roadmaps/:slug" element={<RoadmapDetail />} />
        <Route path="/roadmaps/:roadmapSlug/:slug" element={<TopicDetail />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/notes/:slug" element={<NoteDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/copyright" element={<Copyright />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/institution/create" element={<CreateInstitution />} />
        <Route path="/institution" element={<InstitutionDashboard />} />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminRoadmapList />} />
          <Route path="import-playlist" element={<AdminPlaylistImport />} />
          <Route path="notes" element={<AdminNotesList />} />
          <Route path="notes/:slug" element={<AdminNoteEditor />} />
          <Route path="roadmaps/new" element={<AdminRoadmapNew />} />
          <Route path="roadmaps/:slug" element={<AdminRoadmapEditor />} />
          <Route path="roadmaps/:roadmapSlug/topics/:nodeSlug" element={<AdminTopicResources />} />
          <Route path="roadmaps/:roadmapSlug/topics/:nodeSlug/practice" element={<AdminTopicPractice />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Shell>
  );
}
