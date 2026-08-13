import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Shell from "./components/layout/Shell";
import Home from "./routes/Home";
import RoadmapDetail from "./routes/RoadmapDetail";
import TopicDetail from "./routes/TopicDetail";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import Dashboard from "./routes/Dashboard";
import RequireAdmin from "./components/admin/RequireAdmin";
import AdminLayout from "./routes/admin/AdminLayout";
import AdminRoadmapList from "./routes/admin/AdminRoadmapList";
import AdminRoadmapNew from "./routes/admin/AdminRoadmapNew";
import AdminRoadmapEditor from "./routes/admin/AdminRoadmapEditor";
import AdminTopicResources from "./routes/admin/AdminTopicResources";
import { useAuthStore } from "./store/authStore";
import { useAdminStore } from "./store/adminStore";

function Placeholder({ label }: { label: string }) {
  return (
    <div className="container-page py-24 text-center">
      <p className="station-code mb-3">Coming in a later phase</p>
      <h1 className="font-display text-2xl">{label}</h1>
    </div>
  );
}

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
        <Route path="/roadmaps" element={<Placeholder label="Roadmaps" />} />
        <Route path="/roadmaps/:slug" element={<RoadmapDetail />} />
        <Route path="/roadmaps/:roadmapSlug/:slug" element={<TopicDetail />} />
        <Route path="/topics/:slug" element={<TopicDetail />} />
        <Route path="/lesson/:id" element={<Placeholder label="Lesson" />} />
        <Route path="/search" element={<Placeholder label="Search results" />} />
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
        </Route>
      </Routes>
    </Shell>
  );
}
