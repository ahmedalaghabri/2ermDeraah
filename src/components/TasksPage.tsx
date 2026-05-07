import { useState } from "react";
import { Plus, Calendar, Clock, AlertCircle, CheckCircle2, Circle } from "lucide-react";
import { cn } from "../lib/utils";

type TaskStatus = "new" | "urgent" | "in-progress" | "completed" | "all";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: "high" | "medium" | "low";
  dueDate: string;
  assignee: string;
}

const MOCK_TASKS: Task[] = [
  { id: "1", title: "إعداد تقرير المبيعات الشهري", description: "جمع وتحليل بيانات المبيعات", status: "new", priority: "high", dueDate: "2026-05-10", assignee: "أحمد" },
  { id: "2", title: "مراجعة طلبات الإجازات", description: "اعتماد طلبات الموظفين", status: "urgent", priority: "high", dueDate: "2026-05-06", assignee: "سارة" },
  { id: "3", title: "تحديث نظام الحضور", description: "إصلاح مشاكل تسجيل الحضور", status: "in-progress", priority: "medium", dueDate: "2026-05-08", assignee: "خالد" },
  { id: "4", title: "إرسال إشعارات الرواتب", description: "توزيع كشوف الرواتب", status: "completed", priority: "high", dueDate: "2026-05-01", assignee: "منى" },
  { id: "5", title: "اجتماع تقييم الأداء", description: "مراجعة أداء الموظفين الربع الأول", status: "new", priority: "medium", dueDate: "2026-05-15", assignee: "أحمد" },
  { id: "6", title: "صيانة الأجهزة المكتبية", description: "فحص وصيانة أجهزة الكمبيوتر", status: "in-progress", priority: "low", dueDate: "2026-05-12", assignee: "خالد" },
  { id: "7", title: "تدريب الموظفين الجدد", description: "برنامج توجيه الموظفين", status: "completed", priority: "medium", dueDate: "2026-04-30", assignee: "سارة" },
  { id: "8", title: "تحديث سياسة العمل", description: "مراجعة وتحديث اللوائح الداخلية", status: "new", priority: "high", dueDate: "2026-05-20", assignee: "منى" },
];

const TABS: [TaskStatus, string, any][] = [
  ["new", "جديدة", Circle],
  ["urgent", "طارئة", AlertCircle],
  ["in-progress", "قيد العمل", Clock],
  ["completed", "منتهية", CheckCircle2],
  ["all", "جميع المهام", Circle],
];

const STATUS_CONFIG: Record<TaskStatus, { label: string; bg: string }> = {
  new: { label: "جديدة", bg: "bg-blue-100 text-blue-700" },
  urgent: { label: "طارئة", bg: "bg-red-100 text-red-700" },
  "in-progress": { label: "قيد العمل", bg: "bg-amber-100 text-amber-700" },
  completed: { label: "منتهية", bg: "bg-emerald-100 text-emerald-700" },
  all: { label: "الكل", bg: "bg-gray-100 text-gray-700" },
};

const PRIORITY_CONFIG: Record<string, { label: string; bg: string }> = {
  high: { label: "عالية", bg: "bg-red-100 text-red-700" },
  medium: { label: "متوسطة", bg: "bg-amber-100 text-amber-700" },
  low: { label: "منخفضة", bg: "bg-green-100 text-green-700" },
};

interface TasksPageProps { onBack?: () => void; }

export default function TasksPage({ onBack }: TasksPageProps) {
  const [activeTab, setActiveTab] = useState<TaskStatus>("new");

  const filteredTasks = activeTab === "all"
    ? MOCK_TASKS
    : MOCK_TASKS.filter(t => t.status === activeTab);

  return (
    <div dir="rtl" className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="sticky top-0 z-40 md:z-30 bg-white dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700 rounded-xl">
        <div className="max-w-[1400px] mx-auto px-0 sm:px-2 rounded-xl overflow-hidden">
          <div className="px-2 sm:px-4 py-2 border-b border-neutral-100">
            <div className="flex items-center gap-1 bg-neutral-0 rounded-full p-1 min-w-0">
              {TABS.map(([key, label, Icon]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                  className={cn(
                    'flex flex-1 flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-[13px] font-semibold transition-all duration-200 min-w-0',
                    activeTab === key
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-neutral-50 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900'
                  )}>
                  <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-2 sm:px-4 py-4">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-100 dark:border-neutral-700 shadow-sm overflow-hidden">
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-700 border-b border-neutral-100 dark:border-neutral-600">
                  <th className="px-4 py-3 text-right font-bold text-neutral-600 dark:text-neutral-300">المهمة</th>
                  <th className="px-4 py-3 text-right font-bold text-neutral-600 dark:text-neutral-300">الحالة</th>
                  <th className="px-4 py-3 text-right font-bold text-neutral-600 dark:text-neutral-300">الأولوية</th>
                  <th className="px-4 py-3 text-right font-bold text-neutral-600 dark:text-neutral-300">الموعد النهائي</th>
                  <th className="px-4 py-3 text-right font-bold text-neutral-600 dark:text-neutral-300">المسؤول</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-neutral-400">
                      لا توجد مهام في هذا التبويب
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((task, idx) => (
                    <tr key={task.id} className={cn(
                      "border-b border-neutral-50 dark:border-neutral-700 hover:bg-blue-50/30 dark:hover:bg-neutral-700/30 transition-colors cursor-pointer",
                      idx % 2 === 0 ? "bg-white dark:bg-neutral-800" : "bg-neutral-50/30 dark:bg-neutral-700/30"
                    )}>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-semibold text-neutral-800 dark:text-neutral-200">{task.title}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">{task.description}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold px-2 py-1 rounded-lg", STATUS_CONFIG[task.status].bg)}>
                          {STATUS_CONFIG[task.status].label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold px-2 py-1 rounded-lg", PRIORITY_CONFIG[task.priority].bg)}>
                          {PRIORITY_CONFIG[task.priority].label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
                          <span className="text-xs">{task.dueDate}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-700 dark:text-neutral-300 text-xs">
                        {task.assignee}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-700 border-t border-neutral-100 dark:border-neutral-600 flex items-center justify-between">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              {filteredTasks.length} مهمة
            </span>
            <button className="flex items-center gap-1 text-xs font-semibold text-[#B21063] hover:text-[#8B0C4D] transition-colors">
              <Plus className="w-3 h-3" />
              <span>مهمة جديدة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
