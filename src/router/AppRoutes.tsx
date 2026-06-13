import { Navigate, Route, Routes } from "react-router-dom";
import { CategoriesPage, CoursesPage, LessonsPage, ModulesPage, TracksPage } from "../pages/AcademicPages";
import { DashboardPage } from "../pages/DashboardPage";
import { PaymentsPage, PlansPage, SubscriptionsPage } from "../pages/FinancePages";
import type { PageProps } from "../pages/pageTypes";
import { CertificatesPage, EnrollmentsPage, ProgressPage, ReviewsPage, UsersPage } from "../pages/UserPages";

export function AppRoutes(props: PageProps) {
    return (
        <Routes>
            <Route path="/" element={<DashboardPage {...props} />} />
            <Route path="/categorias" element={<CategoriesPage {...props} />} />
            <Route path="/cursos" element={<CoursesPage {...props} />} />
            <Route path="/modulos" element={<ModulesPage {...props} />} />
            <Route path="/aulas" element={<LessonsPage {...props} />} />
            <Route path="/trilhas" element={<TracksPage {...props} />} />
            <Route path="/usuarios" element={<UsersPage {...props} />} />
            <Route path="/matriculas" element={<EnrollmentsPage {...props} />} />
            <Route path="/progresso" element={<ProgressPage {...props} />} />
            <Route path="/avaliacoes" element={<ReviewsPage {...props} />} />
            <Route path="/certificados" element={<CertificatesPage {...props} />} />
            <Route path="/planos" element={<PlansPage {...props} />} />
            <Route path="/assinaturas" element={<SubscriptionsPage {...props} />} />
            <Route path="/pagamentos" element={<PaymentsPage {...props} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
