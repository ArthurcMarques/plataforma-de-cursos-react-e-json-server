// Decide o que aparece na area principal: carregamento, erro ou rotas.
import { useAppData } from "../hooks/useAppData";
import type { PageProps } from "../pages/pageTypes";
import { AppRoutes } from "../router/AppRoutes";

interface AppContentProps {
    navigateToSection: (section: string) => void;
}

export function AppContent({ navigateToSection }: AppContentProps) {
    const appData = useAppData();

    // Props que todas as paginas recebem para acessar dados e funcoes de CRUD.
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

    if (appData.loading) {
        return <section className="panel text-center text-muted">Carregando dados...</section>;
    }

    if (appData.error) {
        return (
            <section className="panel text-center">
                <p className="text-danger mb-3">{appData.error}</p>
                <button className="btn btn-primary" type="button" onClick={() => void appData.refreshData()}>Tentar novamente</button>
            </section>
        );
    }

    return (
        <>
            {appData.alert && <div className={`alert alert-${appData.alert.type} floating-alert shadow-sm`} role="alert">{appData.alert.message}</div>}
            <AppRoutes {...pageProps} />
        </>
    );
}
