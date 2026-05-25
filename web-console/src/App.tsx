import { Navigate, Route, Routes, useMatch } from "react-router-dom";
import { Header } from "./components/Header";
import { WorkbenchQueueProvider } from "./contexts/WorkbenchQueueContext";
import { HomePage } from "./pages/HomePage";
import { StreamViewerPage } from "./pages/StreamViewerPage";
import { Workbench } from "./pages/Workbench";

export default function App() {
  const isStreamViewer = Boolean(useMatch("/stream"));
  const isWorkbench = Boolean(useMatch("/workbench/*"));

  return (
    <WorkbenchQueueProvider>
    <div className={`app-shell${isWorkbench ? " app-shell--workbench" : " app-shell--home"}${isStreamViewer ? " app-shell--stream-viewer" : ""}`}>
      {!isStreamViewer && <Header />}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/workbench"
            element={<Navigate to="/workbench/lab_jiaxing_electrochem" replace />}
          />
          <Route path="/workbench/:labId" element={<Workbench />} />
          <Route path="/stream" element={<StreamViewerPage />} />
        </Routes>
      </main>
    </div>
    </WorkbenchQueueProvider>
  );
}
