import { useAuth } from "../hooks/useAuth"; import AdminDashboard from "./AdminDashboard"; import OfficerDashboard from "./OfficerDashboard";
export default function Dashboard() { const { user } = useAuth(); return user && ["Administrator", "Senior Reviewer"].includes(user.role) ? <AdminDashboard /> : <OfficerDashboard />; }
