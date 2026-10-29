import { Breadcrumbs, Section } from "../components/ui";
import ApplicationTable from "../components/ApplicationTable";

export default function Applications({
  title,
  scrutiny,
}: {
  title: string;
  scrutiny?: boolean;
}) {
  return (
    <div className="space-y-4">
      <Breadcrumbs items={[{ label: title }]} />

      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-soft">
        <h1 className="text-xl sm:text-2xl font-extrabold text-navy tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
          {scrutiny
            ? "Extension of Approval (EoA) scrutiny registry. Access institutional applications, execute automated handbook cross-verifications, review document compliance, and record official findings."
            : "National central intake queue for Extension of Approval (EoA) institutional dossiers. Manage officer allocations, track review stages, and monitor compliance status."}
        </p>
      </div>

      <Section
        title={
          scrutiny
            ? "Extension of Approval — Applications for Scrutiny"
            : "Central Application Queue & Assignment Registry"
        }
        subtitle="Search, filter by academic year or approval status, and inspect application dossiers"
      >
        <ApplicationTable />
      </Section>
    </div>
  );
}
