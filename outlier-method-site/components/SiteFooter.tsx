export function SiteFooter() {
  return (
    <footer className="bg-bone">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-6 py-10 text-sm text-slate sm:flex-row sm:items-center">
        <span>&copy; {new Date().getFullYear()} Outlier Method</span>
        <span>AD Chief of Staff</span>
      </div>
    </footer>
  );
}
