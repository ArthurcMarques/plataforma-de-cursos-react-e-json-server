import { useLocation, useNavigate } from "react-router-dom";
import { AppContent } from "./components/AppContent";
import { Layout } from "./components/Layout";
import { sections } from "./router/routes";

export function App() {
    const location = useLocation();
    const navigate = useNavigate();

    function navigateToSection(sectionId: string) {
        const section = sections.find((item) => item.id === sectionId);
        navigate(section?.path ?? "/");
    }

    return (
        <Layout sections={sections} currentPath={location.pathname} onNavigate={navigate}>
            <AppContent navigateToSection={navigateToSection} />
        </Layout>
    );
}
