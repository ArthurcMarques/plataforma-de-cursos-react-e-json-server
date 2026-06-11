import type { ReactNode } from "react";
import { CategoriesPage, CoursesPage, LessonsPage, ModulesPage, TracksPage } from "./AcademicPages";
import { DashboardPage } from "./DashboardPage";
import { PaymentsPage, PlansPage, SubscriptionsPage } from "./FinancePages";
import type { PageProps } from "./pageTypes";
import { CertificatesPage, EnrollmentsPage, ProgressPage, ReviewsPage, UsersPage } from "./UserPages";

// Escolhe qual pagina renderizar com base na secao da rota atual.
export function CurrentSection({ section, ...props }: PageProps & { section: string }) {
    const pages: Record<string, (props: PageProps) => ReactNode> = {
        dashboard: DashboardPage,
        categorias: CategoriesPage,
        cursos: CoursesPage,
        modulos: ModulesPage,
        aulas: LessonsPage,
        trilhas: TracksPage,
        usuarios: UsersPage,
        matriculas: EnrollmentsPage,
        progresso: ProgressPage,
        avaliacoes: ReviewsPage,
        certificados: CertificatesPage,
        planos: PlansPage,
        assinaturas: SubscriptionsPage,
        pagamentos: PaymentsPage
    };
    const Page = pages[section] ?? DashboardPage;
    return <Page {...props} />;
}
