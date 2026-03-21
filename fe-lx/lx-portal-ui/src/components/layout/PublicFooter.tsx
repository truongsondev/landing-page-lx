export function PublicFooter() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-600 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <img
            src="/images/brand/logo-da-minh-thu-duc-2.svg"
            alt="Logo Đa Minh Thủ Đức 2"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="h-8 w-8 rounded border border-slate-200 object-cover"
          />
          <p>© 2026 Đa Minh Thủ Đức 2. All rights reserved.</p>
        </div>
        <p>Email: sonltute@gmail.com</p>
      </div>
    </footer>
  );
}
