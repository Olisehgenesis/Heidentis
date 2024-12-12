import {
  BrowserRouter as Router,
  Route,
  Routes
} from "react-router-dom";
import Home from "./pages/Home";
import IdentityDashboard from "./pages/wallet/index";
import CredentialSystem from "./components/CredentialSystem";
import AdminPage from "./pages/admin";
import IssuerDashboard from "./pages/issuer/page";
import TopicsSetup from "./pages/admin/TopicsSetup";
import RegisterInstitution from "./pages/institutions/RegisterInstitution";
import ViewInstitutions from "./pages/institutions/ViewInstitutions";
import InstitutionAdmin from "./pages/institutions/InstitutionAdmin";
import InstitutionForms from "./pages/institutions/InstitutionForms";
import CreateForm from "./pages/institutions/CreateForm";
import PublicInstitutionForms from "./pages/institutions/PublicInstitutionForms";
import FormApplication from "./pages/institutions/FormApplication";
import MyInstitutions from "./pages/admin/MyInstitutions";
import NavBar from "./components/Navbar";



export default function AppRouter() {
  return (
    <Router>
       <header>
            <NavBar />
          </header>
      <Routes>
        {/* Existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/app/wallet"  element={<IdentityDashboard />} />
        <Route path="/app/identity" element={<IdentityDashboard />} />
        <Route path="/app/credentials" element={<CredentialSystem />} />
        <Route path= "/app/admin" element={<AdminPage />} />
        <Route path="/app/issuer" element={<IssuerDashboard />} />
        <Route path="/admin/topics-setup" element={<TopicsSetup />} />
        <Route path="/app/institutions/register" element={<RegisterInstitution />} />
        <Route path="/app/institutions" element={<ViewInstitutions />} />

        {/* Institution management routes */}
        <Route path="/:did/institution/dashboard" element={<InstitutionAdmin />} />
        {/* <Route path="/:did/institution/forms" element={<InstitutionForms />} /> */}
        <Route path="/:did/institution/forms/create" element={<CreateForm />} />
        {/* <Route path="/:did/institution/forms/:formId/edit" element={<EditForm />} /> */}
        {/* <Route path="/:did/institution/applications" element={<ReviewApplications />} /> */}
        {/* <Route path="/:did/institution/applications/:applicationId" element={<ApplicationDetail />} /> */}

        {/* User application routes */}
        {/* <Route path="/apply/:institutionId/:formId" element={<UserApplicationForm />} /> */}
        {/* <Route path="/applications/status/:applicationId" element={<ApplicationStatus />} /> */}
        <Route path="*" element={<Home />} />
        {/* Public Form Routes */}
        <Route path="/apply/:did/forms" element={<PublicInstitutionForms />} />
        <Route path="/apply/:did/forms/:formId" element={<FormApplication />} />
        <Route path="app/admin/myinstitutions" element={<MyInstitutions />} />
        {/* <Route path="/applications/status/:applicationId" element={<ApplicationStatus />} /> */}
      
        <Route path="*" element={<Home />} />
      </Routes>
    </Router>
  );
}