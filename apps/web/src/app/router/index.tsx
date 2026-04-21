import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "@/widgets/app-shell/AppShell";
import { ProtectedRoute } from "@/widgets/protected-route/ProtectedRoute";
import { AuthPage } from "@/pages/auth/AuthPage";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { DownloadsPage } from "@/pages/downloads/DownloadsPage";
import { FilesPage } from "@/pages/files/FilesPage";
import { JobsPage } from "@/pages/jobs/JobsPage";
import { SettingsPage } from "@/pages/settings/SettingsPage";
import { TranscriptionsPage } from "@/pages/transcriptions/TranscriptionsPage";

export const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "downloads", element: <DownloadsPage /> },
          { path: "files", element: <FilesPage /> },
          { path: "jobs", element: <JobsPage /> },
          { path: "transcriptions", element: <TranscriptionsPage /> },
          { path: "settings", element: <SettingsPage /> },
        ],
      },
    ],
  },
]);