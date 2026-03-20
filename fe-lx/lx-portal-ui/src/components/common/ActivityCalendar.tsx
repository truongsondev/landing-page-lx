import { useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/vi";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Activity } from "@/types/models";

// Set default locale to Vietnamese
dayjs.locale("vi");

interface CalendarPopupData {
    date: Dayjs;
    activities: Activity[];
}

function CalendarPopup({
    data,
    onClose,
}: {
    data: CalendarPopupData;
    onClose: () => void;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="relative max-h-96 w-96 max-w-full overflow-auto rounded-lg bg-white p-6 shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                >
                    <X size={20} />
                </button>

                <h3 className="mb-4 text-lg font-bold text-slate-800">
                    {data.date.format("DD/MM/YYYY dddd")}
                </h3>

                {/* Activities */}
                {data.activities.length > 0 ? (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-slate-600">Hoạt động:</p>
                        {data.activities.map((activity) => (
                            <div
                                key={activity.id}
                                className={`rounded-lg border-l-4 p-3 ${(activity as any).isRequired
                                        ? "border-l-red-500 bg-red-50"
                                        : "border-l-yellow-500 bg-yellow-50"
                                    }`}
                            >
                                <p className="font-semibold text-slate-800">{activity.name}</p>
                                {activity.location && (
                                    <p className="text-xs text-slate-600">{activity.location}</p>
                                )}
                                <p className="text-xs text-slate-600">
                                    {dayjs(activity.startDate).format("HH:mm")}
                                    {activity.endDate
                                        ? ` - ${dayjs(activity.endDate).format("HH:mm")}`
                                        : ""}
                                </p>
                                {activity.description && (
                                    <p className="mt-2 text-xs text-slate-700">{activity.description}</p>
                                )}
                                <div className="mt-2">
                                    <span
                                        className={`text-xs font-bold ${(activity as any).isRequired
                                                ? "text-red-700"
                                                : "text-yellow-700"
                                            }`}
                                    >
                                        {(activity as any).isRequired ? "🔴 Bắt buộc" : "🟡 Không bắt buộc"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500">Không có hoạt động hôm nay.</p>
                )}
            </div>
        </div>
    );
}

interface Props {
    activities: Activity[];
    month?: Dayjs;
    onMonthChange?: (month: Dayjs) => void;
}

export function ActivityCalendar({ activities, month = dayjs(), onMonthChange }: Props) {
    const today = dayjs();
    const firstDay = month.startOf("month");
    const lastDay = month.endOf("month");
    const [popupData, setPopupData] = useState<CalendarPopupData | null>(null);

    // Get activities by date
    const activitiesByDate = useMemo(() => {
        const map = new Map<string, Activity[]>();
        activities.forEach((activity) => {
            const date = dayjs(activity.startDate).format("YYYY-MM-DD");
            if (!map.has(date)) {
                map.set(date, []);
            }
            map.get(date)!.push(activity);
        });
        return map;
    }, [activities]);



    // Generate calendar days
    const days: Dayjs[] = [];
    const startDate = firstDay.startOf("week");
    const endDate = lastDay.endOf("week");
    let current = startDate;

    while (current.isBefore(endDate) || current.isSame(endDate)) {
        days.push(current);
        current = current.add(1, "day");
    }

    const weeks: Dayjs[][] = [];
    for (let i = 0; i < days.length; i += 7) {
        weeks.push(days.slice(i, i + 7));
    }

    const weekDays = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

    const handleDateClick = (date: Dayjs) => {
        const dateStr = date.format("YYYY-MM-DD");
        const dayActivities = activitiesByDate.get(dateStr) || [];

        setPopupData({
            date,
            activities: dayActivities,
        });
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
                <button
                    onClick={() => onMonthChange?.(month.subtract(1, "month"))}
                    className="rounded-md border border-slate-300 p-2 hover:bg-slate-100"
                >
                    <ChevronLeft size={20} />
                </button>
                <h2 className="text-lg font-semibold text-slate-800">
                    {month.format("MMMM YYYY")}
                </h2>
                <button
                    onClick={() => onMonthChange?.(month.add(1, "month"))}
                    className="rounded-md border border-slate-300 p-2 hover:bg-slate-100"
                >
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Week day headers */}
            <div className="mb-1 grid grid-cols-7 gap-1">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-bold text-slate-600">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="space-y-1">
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="grid grid-cols-7 gap-1">
                        {week.map((date) => {
                            const dateStr = date.format("YYYY-MM-DD");
                            const dayActivities = activitiesByDate.get(dateStr) || [];
                            const isPast = date.isBefore(today, "day");
                            const isToday = date.isSame(today, "day");
                            const isInCurrentMonth = date.isSame(month, "month");

                            // Determine background color based on activities
                            let bgColor = isPast ? "bg-slate-50" : "bg-white";
                            let borderColor = "border-slate-200";
                            let textColor = isPast ? "text-slate-400" : "text-slate-700";

                            if (!isInCurrentMonth) {
                                bgColor = "bg-slate-50";
                                textColor = "text-slate-400";
                            }

                            if (dayActivities.length > 0) {
                                const hasMandatory = dayActivities.some(
                                    (a) => (a as any).isRequired
                                );
                                const hasOptional = dayActivities.some(
                                    (a) => !(a as any).isRequired
                                );

                                if (hasMandatory && hasOptional) {
                                    // Mixed: gradient or special color
                                    bgColor = isPast ? "bg-red-100" : "bg-red-100";
                                    borderColor = "border-red-300";
                                } else if (hasMandatory) {
                                    bgColor = isPast ? "bg-red-100" : "bg-red-100";
                                    borderColor = "border-red-300";
                                } else {
                                    bgColor = isPast ? "bg-yellow-100" : "bg-yellow-100";
                                    borderColor = "border-yellow-300";
                                }
                            }

                            if (isToday) {
                                borderColor = "border-blue-500 border-2";
                            }

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => handleDateClick(date)}
                                    className={`relative h-16 rounded border p-1 text-sm font-semibold transition-all hover:shadow-md ${bgColor} ${borderColor} ${textColor}`}
                                >
                                    {/* Date number */}
                                    <div className="absolute left-1 top-1 px-0.5 py-0.5 text-sm font-bold leading-tight">{date.date()}</div>
                                    {dayActivities.length > 0 && (
                                        <div className="absolute bottom-0.5 left-1 right-1 text-[9px] leading-tight">
                                            <div className="flex items-center justify-between gap-1">
                                                <span className="min-w-0 flex-1 truncate px-0.5 py-0.5 text-left text-slate-700">
                                                    {dayActivities[0].name}
                                                </span>
                                                <span className="shrink-0 px-0.5 py-0.5 text-slate-600">
                                                    {dayjs(dayActivities[0].startDate).format("HH:mm")}
                                                </span>
                                            </div>
                                            {dayActivities.length > 1 && (
                                                <div className="truncate whitespace-nowrap px-0.5 py-0.5 text-left text-[8px] text-slate-500">
                                                    +{dayActivities.length - 1} hoạt động khác
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-200 pt-4 text-xs">
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-red-100" />
                    <span className="text-slate-600">Bắt buộc</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-yellow-100" />
                    <span className="text-slate-600">Không bắt buộc</span>
                </div>
            </div>

            {/* Popup */}
            {popupData && <CalendarPopup data={popupData} onClose={() => setPopupData(null)} />}
        </div>
    );
}
