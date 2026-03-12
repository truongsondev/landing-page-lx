import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { membersService } from "@/services/members.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { EmptyState } from "@/components/common/EmptyState";
import type { Member } from "@/types/models";

export function MembersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["members", page, search],
    queryFn: () => membersService.getAll({ page, limit: 12, search }),
  });

  if (query.isLoading) return <Loading />;
  if (query.isError) return <ErrorState onRetry={query.refetch} />;

  const list = (query.data?.data || []).filter(
    (m: Member) => m.status !== "INACTIVE",
  );

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Thành viên Lưu Xá</h1>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm theo tên"
        className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 md:w-80"
      />

      {list.length === 0 ? (
        <EmptyState title="Chưa có thành viên" />
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          {list.map((member: Member) => (
            <Link
              key={member.id}
              to={`/members/${member.id}`}
              className="rounded-xl border border-slate-200 bg-white p-4 text-center"
            >
              <img
                src={
                  member.avatar || "https://placehold.co/120x120?text=Avatar"
                }
                alt={member.fullName || member.firstName || "Member"}
                className="mx-auto mb-3 h-20 w-20 rounded-full object-cover"
              />
              <h3 className="font-semibold">
                {member.fullName ||
                  `${member.lastName || ""} ${member.firstName || ""}`.trim()}
              </h3>
              <p className="text-sm text-slate-600">
                {member.position || "Member"}
              </p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((v) => v - 1)}
          className="rounded-md border border-slate-300 px-3 py-1 disabled:opacity-50"
        >
          Prev
        </button>
        <span>Trang {page}</span>
        <button
          onClick={() => setPage((v) => v + 1)}
          className="rounded-md border border-slate-300 px-3 py-1"
        >
          Next
        </button>
      </div>
    </div>
  );
}
