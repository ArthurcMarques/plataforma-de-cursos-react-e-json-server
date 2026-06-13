import { useLocation, useNavigate } from "react-router-dom";
import { getPathBySection, getSectionByPath } from "../router/routes";

export function useAppNavigation() {
    const location = useLocation();
    const navigate = useNavigate();

    function navigateToSection(section: string) {
        navigate(getPathBySection(section));
    }

    return {
        currentSection: getSectionByPath(location.pathname),
        navigateToSection
    };
}
