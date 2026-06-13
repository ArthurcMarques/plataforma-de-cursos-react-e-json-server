import { useLocation, useNavigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import { useAppData } from "./hooks/useAppData";
import type { PageProps } from "./pages/pageTypes";
import { AppRoutes } from "./router/AppRoutes";
import { getPathBySection, getSectionByPath, sections } from "./router/routes";

export function App() {
    const location = useLocation();
    const navigate = useNavigate();
    const currentSection = getSectionByPath(location.pathname);
    const appData = useAppData();

    function navigateToSection(section: string) {
        navigate(getPathBySection(section));
    }

    const pageProps: PageProps = {
        data: appData.data,
        addWithId: appData.addWithId,
        addDirect: appData.addDirect,
        updateById: appData.updateById,
        removeById: appData.removeById,
        removeDirect: appData.removeDirect,
        notify: appData.notify,
        navigate: navigateToSection
    };

    return (
        <Layout sections={sections} currentSection={currentSection} onNavigate={navigateToSection}>
            {appData.alert && <div className={`alert alert-${appData.alert.type} floating-alert shadow-sm`} role="alert">{appData.alert.message}</div>}
            {appData.loading ? (
                <section className="panel text-center text-muted">Carregando dados...</section>
            ) : appData.error ? (
                <section className="panel text-center">
                    <p className="text-danger mb-3">{appData.error}</p>
                    <button className="btn btn-primary" type="button" onClick={() => void appData.refreshData()}>Tentar novamente</button>
                </section>
            ) : (
                <AppRoutes {...pageProps} />
            )}
        </Layout>
    );
}
