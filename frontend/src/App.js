import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { I18nProvider } from "@/i18n/I18nContext";
import { GuideProvider } from "@/context/GuideContext";
import { Layout } from "@/components/guide/Layout";
import Dashboard from "@/pages/Dashboard";
import CategoryPage from "@/pages/CategoryPage";
import BuildPage from "@/pages/BuildPage";
import CalculatorPage from "@/pages/CalculatorPage";

function App() {
  return (
    <div className="App dark">
      <I18nProvider>
        <GuideProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="c/:category" element={<CategoryPage />} />
                <Route path="build" element={<BuildPage />} />
                <Route path="calc" element={<CalculatorPage />} />
                <Route path="*" element={<Dashboard />} />
              </Route>
            </Routes>
          </BrowserRouter>
          <Toaster theme="dark" position="top-center" />
        </GuideProvider>
      </I18nProvider>
    </div>
  );
}

export default App;
