import { Link } from "react-router-dom";

export default function AuthCard({ title, subtitle, children, footerText, footerLink, footerLabel }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 text-slate-950 dark:text-white">
      <section className="glass w-full max-w-md rounded-lg p-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-300">NLP Likelihood</p>
          <h1 className="mt-2 text-3xl font-bold">{title}</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
          {footerText}{" "}
          <Link className="font-semibold text-teal-700 dark:text-teal-300" to={footerLink}>
            {footerLabel}
          </Link>
        </p>
      </section>
    </div>
  );
}
