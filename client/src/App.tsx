import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Shell from "./components/layout/Shell";
import Home from "./routes/Home";
import Roadmaps from "./routes/Roadmaps";
import RoadmapDetail from "./routes/RoadmapDetail";
import TopicDetail from "./routes/TopicDetail";
import Login from "./routes/Login";
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
import { useAuthStore } from "./store/authStore";
import { useAdminStore } from "./store/adminStore";

export default function App() {
  useEffect(() => {
    // Try to restore a session from the refresh cookie, then load the
    // roadmap catalog — both fall back to local demo data automatically
    // if the API isn't reachable (see authStore/adminStore).
    void useAuthStore.getState().hydrate();
    void useAdminStore.getState().loadRoadmaps();
  }, []);

  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/roadmaps" element={<Roadmaps />} />
        <Route path="/roadmaps/:slug" element={<RoadmapDetail />} />
        <Route path="/roadmaps/:roadmapSlug/:slug" element={<TopicDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/copyright" element={<Copyright />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/admin"
          element={
            <RequireAdmin>
              <AdminLayout />
            </RequireAdmin>
          }
        >
          <Route index element={<AdminRoadmapList />} />
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
