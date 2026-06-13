// Componente principal da aplicacao.
// Ele monta o layout, passa as rotas e liga a navegacao do menu.
import { useLocation, useNavigate } from "react-router-dom";
import { AppContent } from "./components/AppContent";
import { Layout } from "./components/Layout";
import { sections } from "./router/routes";

export function App() {
    const location = useLocation();
    const navigate = useNavigate();

    // As paginas internas navegam pelo id da secao, como "cursos".
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
