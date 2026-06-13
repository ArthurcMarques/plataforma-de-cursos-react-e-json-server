import { Navigate, Route, Routes } from "react-router-dom";
import { CategoriesPage } from "../pages/CategoriesPage";
import { CoursesPage } from "../pages/CoursesPage";
import { DashboardPage } from "../pages/DashboardPage";
import { EnrollmentsPage } from "../pages/EnrollmentsPage";
import { LessonsPage } from "../pages/LessonsPage";
import { ModulesPage } from "../pages/ModulesPage";
import type { PageProps } from "../pages/pageTypes";
import { PaymentsPage } from "../pages/PaymentsPage";
import { PlansPage } from "../pages/PlansPage";
import { ProgressPage } from "../pages/ProgressPage";
import { ReviewsPage } from "../pages/ReviewsPage";
import { SubscriptionsPage } from "../pages/SubscriptionsPage";
import { TracksPage } from "../pages/TracksPage";
import { UsersPage } from "../pages/UsersPage";
import { CertificatesPage } from "../pages/CertificatesPage";

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
