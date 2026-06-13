import { AppContent } from "./components/AppContent";
import { Layout } from "./components/Layout";
import { useAppNavigation } from "./hooks/useAppNavigation";
import { sections } from "./router/routes";

export function App() {
    const { currentSection, navigateToSection } = useAppNavigation();

    return (
        <Layout sections={sections} currentSection={currentSection} onNavigate={navigateToSection}>
            <AppContent navigateToSection={navigateToSection} />
        </Layout>
    );
}
