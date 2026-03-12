export function ErrorState({
  message = "Không thể tải dữ liệu. Vui lòng thử lại.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <p>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white"
        >
          Thử lại
        </button>
      )}
    </div>
  );
}
