import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { mealSignUpsService } from "@/services/meal-signups.service";
import { useAuthStore } from "@/stores/auth.store";

type Period = "morning" | "afternoon";

interface MealSlot {
    day: string;
    period: Period;
    isSelected: boolean;
}

interface CookScheduleSlot {
    day: string;
    period: "Sáng" | "Chiều";
    cookNames: string[];
}

export function MealSignUpPage() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const days = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];
    const dayOfWeekMap = useMemo(
        () => Object.fromEntries(days.map((day, index) => [day, index + 1])) as Record<string, number>,
        [days]
    );

    const periods: { key: Period; label: string }[] = [
        { key: "morning", label: "Sáng" },
        { key: "afternoon", label: "Chiều" },
    ];

    const weekStartDate = useMemo(() => {
        const now = new Date();
        const day = now.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        const monday = new Date(now);
        monday.setDate(now.getDate() + diff);
        monday.setHours(0, 0, 0, 0);
        return monday.toISOString().slice(0, 10);
    }, []);

    const mealData = useQuery({
        queryKey: ["meal-data"],
        queryFn: async () => {
            const mealScheduleData: Record<string, { morning: string[]; afternoon: string[] }> = {
                "Thứ 2": {
                    morning: ["Tùng Lớn", "QUỐC"],
                    afternoon: ["Kiết k5", "Hiệp"],
                },
                "Thứ 3": {
                    morning: ["Kiết k4", "Huy new"],
                    afternoon: ["Tuấn", "Châu"],
                },
                "Thứ 4": {
                    morning: ["Báo Tùng", "Báo Lâm"],
                    afternoon: ["Duy Hân", "Khang"],
                },
                "Thứ 5": {
                    morning: ["Quân k6", "Trí"],
                    afternoon: ["Ân", "Kiết K6"],
                },
                "Thứ 6": {
                    morning: ["Minh", "Trung"],
                    afternoon: ["Đại", "Phúc"],
                },
                "Thứ 7": {
                    morning: ["Lục", "Hữu"],
                    afternoon: ["Lộc", "Duy", "Trọng"],
                },
                "Chủ nhật": {
                    morning: ["Huy Malay", "Khoa"],
                    afternoon: ["Huy Cơ", "Hưng"],
                },
            };

            const cookSchedule: CookScheduleSlot[] = days.flatMap((day) => [
                {
                    day,
                    period: "Sáng",
                    cookNames: mealScheduleData[day]?.morning || ["Trống"],
                },
                {
                    day,
                    period: "Chiều",
                    cookNames: mealScheduleData[day]?.afternoon || ["Trống"],
                },
            ]);

            return {
                mealCounts: days.map((day) => ({
                    day,
                    morning: Math.floor(Math.random() * 10),
                    afternoon: Math.floor(Math.random() * 10),
                })),
                cookSchedule,
            };
        },
    });

    const createDefaultMealSignUps = () =>
        days.flatMap((day) =>
            periods.map((p) => ({
                day,
                period: p.key,
                isSelected: false,
            }))
        );

    const createMealSignUpsFromSlots = (slots: { dayOfWeek: number; period: Period }[]) => {
        const selectedSet = new Set(slots.map((slot) => `${slot.dayOfWeek}-${slot.period}`));
        return days.flatMap((day) =>
            periods.map((p) => ({
                day,
                period: p.key,
                isSelected: selectedSet.has(`${dayOfWeekMap[day]}-${p.key}`),
            }))
        );
    };

    const [mealSignUps, setMealSignUps] = useState<MealSlot[]>(createDefaultMealSignUps);
    const [savedMealSignUps, setSavedMealSignUps] = useState<MealSlot[]>(createDefaultMealSignUps);

    const myWeekSignUpQuery = useQuery({
        queryKey: ["my-meal-signups", weekStartDate],
        queryFn: () => mealSignUpsService.getMyWeek(weekStartDate),
        enabled: isAuthenticated,
    });

    useEffect(() => {
        if (!myWeekSignUpQuery.data?.slots) return;

        const mapped = createMealSignUpsFromSlots(
            myWeekSignUpQuery.data.slots.map((slot) => ({
                dayOfWeek: slot.dayOfWeek,
                period: slot.period,
            }))
        );

        setMealSignUps(mapped);
        setSavedMealSignUps(mapped);
    }, [myWeekSignUpQuery.data]);

    const saveMealSignUpsMutation = useMutation({
        mutationFn: () => {
            const slots = mealSignUps
                .filter((slot) => slot.isSelected)
                .map((slot) => ({
                    dayOfWeek: dayOfWeekMap[slot.day],
                    period: slot.period,
                }));

            return mealSignUpsService.saveMyWeek({
                weekStartDate,
                slots,
            });
        },
        onSuccess: () => {
            setSavedMealSignUps(mealSignUps.map((slot) => ({ ...slot })));
            toast.success("Đã lưu đăng ký cơm");
        },
        onError: () => {
            toast.error("Lưu đăng ký cơm thất bại");
        },
    });

    const hasChanges = mealSignUps.some((slot, index) => {
        const savedSlot = savedMealSignUps[index];
        return (
            savedSlot?.day !== slot.day ||
            savedSlot?.period !== slot.period ||
            savedSlot?.isSelected !== slot.isSelected
        );
    });

    const handleChange = (day: string, period: Period) => {
        setMealSignUps((prev) =>
            prev.map((slot) =>
                slot.day === day && slot.period === period
                    ? { ...slot, isSelected: !slot.isSelected }
                    : slot
            )
        );
    };

    const handleResetChanges = () => {
        setMealSignUps(savedMealSignUps.map((slot) => ({ ...slot })));
    };

    const handleSaveChanges = () => {
        if (!isAuthenticated) {
            toast.error("Vui lòng đăng nhập để lưu đăng ký cơm");
            return;
        }
        saveMealSignUpsMutation.mutate();
    };

    if (mealData.isLoading) return <Loading />;
    if (mealData.isError || !mealData.data) return <ErrorState />;
    if (isAuthenticated && myWeekSignUpQuery.isLoading) return <Loading />;
    if (isAuthenticated && myWeekSignUpQuery.isError) return <ErrorState onRetry={myWeekSignUpQuery.refetch} />;

    return (
        <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg">
                <h1 className="text-2xl font-bold">Đăng ký Cơm 🍱</h1>
                <p className="mt-1 text-sm text-white/90">
                    Đăng ký suất ăn theo buổi và theo dõi lịch nấu trong tuần.
                </p>
            </div>

            {/* 1. Đăng ký */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">Đăng ký theo tuần</h2>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-700">
                            <tr>
                                <th className="border-b border-slate-200 p-3 text-left font-semibold">Buổi</th>
                                {days.map((day) => (
                                    <th key={day} className="border-b border-slate-200 p-3 text-center font-semibold">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map((p) => (
                                <tr key={p.key} className="hover:bg-blue-50/40">
                                    <td className="border-b border-slate-100 p-3 font-medium text-slate-700">{p.label}</td>
                                    {days.map((day) => {
                                        const slot = mealSignUps.find(
                                            (s) => s.day === day && s.period === p.key
                                        );
                                        return (
                                            <td key={day} className="border-b border-slate-100 p-3 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 accent-indigo-600"
                                                    checked={slot?.isSelected || false}
                                                    onChange={() => handleChange(day, p.key)}
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {hasChanges && (
                    <div className="mt-4 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={handleResetChanges}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                        >
                            Quay lại
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveChanges}
                            disabled={saveMealSignUpsMutation.isPending}
                            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                        >
                            {saveMealSignUpsMutation.isPending ? "Đang lưu..." : "Lưu"}
                        </button>
                    </div>
                )}
            </section>

            {/* 2. Số người */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">Số người đăng ký</h2>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-700">
                            <tr>
                                <th className="border-b border-slate-200 p-3 text-left font-semibold">Buổi</th>
                                {days.map((day) => (
                                    <th key={day} className="border-b border-slate-200 p-3 text-center font-semibold">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map((p) => (
                                <tr key={p.key} className="hover:bg-blue-50/40">
                                    <td className="border-b border-slate-100 p-3 font-medium text-slate-700">{p.label}</td>
                                    {days.map((day) => {
                                        const count = mealData.data.mealCounts.find((c) => c.day === day);
                                        const value = p.key === "morning" ? count?.morning : count?.afternoon;
                                        return (
                                            <td key={day} className="border-b border-slate-100 p-3 text-center">
                                                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700">
                                                    {value}
                                                </span>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            {/* 3. Lịch nấu */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-800">Lịch nấu cơm</h2>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                    <table className="w-full border-collapse text-xs md:text-sm">
                        <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-slate-700">
                            <tr>
                                <th className="border border-slate-300 p-2 md:p-4 text-left font-bold">Buổi</th>
                                {days.map((day) => (
                                    <th
                                        key={day}
                                        className="border border-slate-300 p-2 md:p-4 text-center font-bold"
                                    >
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map((p) => {
                                const periodLabel = p.label;
                                const periodType = p.key === "morning" ? "Sáng" : "Chiều";
                                return (
                                    <tr key={p.key} className="hover:bg-blue-50">
                                        <td className="border border-slate-300 bg-slate-50 p-2 md:p-4 font-bold text-slate-800">
                                            {periodLabel}
                                        </td>
                                        {days.map((day) => {
                                            const slot = mealData.data.cookSchedule.find(
                                                (c) => c.day === day && c.period === periodType
                                            );
                                            const cooks = slot?.cookNames || [];
                                            return (
                                                <td
                                                    key={`${day}-${p.key}`}
                                                    className="border border-slate-300 p-2 md:p-4 text-slate-700"
                                                >
                                                    <div className="space-y-1">
                                                        {cooks.map((cook, idx) => (
                                                            <div
                                                                key={idx}
                                                                className="rounded bg-blue-100 px-2 py-1 text-center text-slate-800"
                                                            >
                                                                {cook}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}