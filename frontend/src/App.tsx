import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/app-layout";
import About from "@/src/pages/About";
import Auth from "@/src/pages/Auth";
import Dashboard from "@/src/pages/Dashboard";
import Home from "@/src/pages/Home";

function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="auth" element={<Auth />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
