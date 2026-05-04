import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Briefcase, Bell, MoreHorizontal, Search, Plus, ChevronRight,
  ChevronLeft, X, Star, MessageSquare, Paperclip, Send, Check,
  MoreVertical, Clock, User, Calendar, Tag, Filter, ArrowRight,
} from "lucide-react";
import { cn } from "../lib/utils";

// ─── Types ───────────────────────────────────────────────
type TaskStatus = "working" | "done" | "stuck" | "none";
type TabKey = "home" | "mywork" | "notifications" | "more";

interface TaskUpdate { id: string; author: string; content: string; time: string; }
interface TaskItem {
  id: string; name: string; status: TaskStatus;
  person?: string; date?: string; updates: TaskUpdate[];
}
interface TaskGroup { id: string; name: string; color: string; items: TaskItem[]; }
interface Board { id: string; name: string; icon: string; workspace: string; starred: boolean; groups: TaskGroup[]; updatedAt: string; }

// ─── Mock Data ───────────────────────────────────────────
const MOCK_BOARDS: Board[] = [
  {
    id: "b1", name: "تخطيط الفريق", icon: "🗂️", workspace: "مساحة العمل الرئيسية",
    starred: true, updatedAt: "قبل دقيقتين",
    groups: [
      {
        id: "g1", name: "هذا الأسبوع", color: "#5559DF",
        items: [
          { id: "i1", name: "مراجعة خطة المشروع", status: "working", person: "أحمد", date: "2026-05-04", updates: [{ id: "u1", author: "أحمد", content: "تمت مراجعة القسم الأول", time: "قبل ساعة" }] },
          { id: "i2", name: "اجتماع الفريق الأسبوعي", status: "done", person: "سارة", date: "2026-05-05", updates: [] },
          { id: "i3", name: "تحديث تقرير الأداء", status: "stuck", person: "خالد", date: "2026-05-06", updates: [{ id: "u2", author: "خالد", content: "بانتظار البيانات من المبيعات", time: "قبل 3 ساعات" }] },
          { id: "i4", name: "إعداد العرض التقديمي", status: "none", person: "منى", date: "2026-05-07", updates: [] },
        ],
      },
      {
        id: "g2", name: "الأسبوع القادم", color: "#9B51E0",
        items: [
          { id: "i5", name: "تدريب الموظفين الجدد", status: "none", person: "أحمد", date: "2026-05-11", updates: [] },
          { id: "i6", name: "مراجعة الميزانية الربعية", status: "working", person: "سارة", date: "2026-05-12", updates: [] },
          { id: "i7", name: "إطلاق الحملة التسويقية", status: "none", person: "خالد", date: "2026-05-13", updates: [] },
        ],
      },
    ],
  },
  {
    id: "b2", name: "مشاريع المبيعات", icon: "📊", workspace: "مساحة العمل الرئيسية",
    starred: true, updatedAt: "قبل 7 ثوانٍ",
    groups: [
      {
        id: "g3", name: "العملاء المحتملون", color: "#E2445C",
        items: [
          { id: "i8", name: "عميل أبوظبي", status: "working", person: "منى", date: "2026-05-04", updates: [{ id: "u3", author: "منى", content: "تم إرسال عرض الأسعار", time: "قبل 30 دقيقة" }] },
          { id: "i9", name: "شركة الخليج", status: "done", person: "أحمد", date: "2026-05-03", updates: [] },
          { id: "i10", name: "مجموعة النور", status: "stuck", person: "سارة", date: "2026-05-05", updates: [] },
        ],
      },
      {
        id: "g4", name: "الصفقات المغلقة", color: "#00C875",
        items: [
          { id: "i11", name: "عقد شركة الأمل", status: "done", person: "خالد", date: "2026-04-28", updates: [] },
          { id: "i12", name: "اتفاقية مؤسسة البناء", status: "done", person: "منى", date: "2026-04-30", updates: [] },
        ],
      },
    ],
  },
  {
    id: "b3", name: "جدول التواصل الاجتماعي", icon: "📱", workspace: "مساحة العمل الرئيسية",
    starred: false, updatedAt: "قبل 36 ثانية",
    groups: [
      {
        id: "g5", name: "المنشورات المجدولة", color: "#0086C0",
        items: [
          { id: "i13", name: "منشور تويتر - أبريل", status: "done", person: "سارة", date: "2026-04-25", updates: [] },
          { id: "i14", name: "انستغرام - رمضان", status: "working", person: "منى", date: "2026-05-06", updates: [] },
          { id: "i15", name: "لينكدإن - إنجازات الشركة", status: "none", person: "أحمد", date: "2026-05-08", updates: [] },
        ],
      },
    ],
  },
];

const MOCK_NOTIFICATIONS = [
  { id: "n1", board: "تخطيط الفريق", item: "مراجعة خطة المشروع", author: "خالد", action: "أضاف تحديثاً", time: "قبل 5 دقائق", read: false },
  { id: "n2", board: "مشاريع المبيعات", item: "عميل أبوظبي", author: "منى", action: "غيّر الحالة إلى جاري العمل", time: "قبل 30 دقيقة", read: false },
  { id: "n3", board: "تخطيط الفريق", item: "اجتماع الفريق الأسبوعي", author: "سارة", action: "أكمل المهمة", time: "قبل ساعة", read: true },
  { id: "n4", board: "جدول التواصل الاجتماعي", item: "منشور تويتر", author: "أحمد", action: "أضاف ملف مرفق", time: "قبل 3 ساعات", read: true },
  { id: "n5", board: "مشاريع المبيعات", item: "شركة الخليج", author: "سارة", action: "علّق على المهمة", time: "أمس", read: true },
];

// ─── Status Config ─────────────────────────────────────
const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  working: { label: "جاري العمل", color: "#fff", bg: "#FDAB3D" },
  done:    { label: "مكتمل",      color: "#fff", bg: "#00C875" },
  stuck:   { label: "متوقف",      color: "#fff", bg: "#E2445C" },
  none:    { label: "—",          color: "#aaa", bg: "#E6E9EF" },
};

// ─── Helpers ────────────────────────────────────────────
function StatusBadge({ status, small }: { status: TaskStatus; small?: boolean }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={cn("rounded-lg font-semibold", small ? "text-[10px] px-2 py-0.5" : "text-xs px-3 py-1.5 block text-center w-full")}
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function Avatar({ name, size = "sm" }: { name?: string; size?: "sm" | "md" }) {
  if (!name) return <div className={cn("rounded-full bg-neutral-200", size === "sm" ? "w-6 h-6" : "w-8 h-8")} />;
  const initials = name.slice(0, 1);
  const colors = ["#5559DF", "#9B51E0", "#00C875", "#FDAB3D", "#E2445C", "#0086C0"];
  const bg = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={cn("rounded-full flex items-center justify-center text-white font-bold shrink-0", size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs")}
      style={{ backgroundColor: bg }}>
      {initials}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────
interface TasksPageProps { onBack?: () => void; }

export default function TasksPage({ onBack }: TasksPageProps) {
  const [tab, setTab] = useState<TabKey>("home");
  const [boards, setBoards] = useState(MOCK_BOARDS);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ item: TaskItem; board: Board; group: TaskGroup } | null>(null);
  const [itemTab, setItemTab] = useState<"columns" | "updates" | "files">("columns");
  const [newUpdate, setNewUpdate] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Navigation helpers ──
  const goBoard = (b: Board) => { setSelectedBoard(b); setSelectedItem(null); };
  const goItem = (item: TaskItem, board: Board, group: TaskGroup) => { setSelectedItem({ item, board, group }); setItemTab("columns"); };
  const goBack = () => {
    if (selectedItem) { setSelectedItem(null); return; }
    if (selectedBoard) { setSelectedBoard(null); return; }
    onBack?.();
  };

  // ── Toggle star ──
  const toggleStar = (boardId: string) =>
    setBoards(bs => bs.map(b => b.id === boardId ? { ...b, starred: !b.starred } : b));

  // ── Change status ──
  const changeStatus = (itemId: string, status: TaskStatus) => {
    setBoards(bs => bs.map(b => ({
      ...b, groups: b.groups.map(g => ({
        ...g, items: g.items.map(i => i.id === itemId ? { ...i, status } : i)
      }))
    })));
    if (selectedItem && selectedItem.item.id === itemId)
      setSelectedItem(si => si ? { ...si, item: { ...si.item, status } } : si);
  };

  // ── Add update ──
  const addUpdate = () => {
    if (!newUpdate.trim() || !selectedItem) return;
    const update: TaskUpdate = { id: Date.now().toString(), author: "أحمد", content: newUpdate, time: "الآن" };
    setBoards(bs => bs.map(b => ({
      ...b, groups: b.groups.map(g => ({
        ...g, items: g.items.map(i => i.id === selectedItem.item.id ? { ...i, updates: [...i.updates, update] } : i)
      }))
    })));
    setSelectedItem(si => si ? { ...si, item: { ...si.item, updates: [...si.item.updates, update] } } : si);
    setNewUpdate("");
  };

  // ── My Work: all items flat ──
  const myItems = boards.flatMap(b => b.groups.flatMap(g => g.items.map(i => ({ ...i, boardName: b.name, board: b, group: g }))));
  const myWorkSections = [
    { label: "هذا الأسبوع", key: "week", items: myItems.filter(i => i.status !== "done").slice(0, 3) },
    { label: "الأسبوع القادم", key: "next", items: myItems.filter(i => i.status === "none").slice(0, 2) },
    { label: "لاحقاً", key: "later", items: myItems.filter(i => i.status === "done").slice(0, 2) },
  ];

  // ── Search results ──
  const searchResults = searchQuery.length > 1
    ? myItems.filter(i => i.name.includes(searchQuery) || i.boardName.includes(searchQuery))
    : [];

  // ─── Render: Item Detail ──────────────────────────────
  if (selectedItem) {
    const { item, board, group } = selectedItem;
    return (
      <div dir="rtl" className="min-h-screen bg-neutral-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-neutral-100 px-4 pt-4 pb-2 flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-neutral-100"><ChevronRight className="w-5 h-5 text-neutral-500" /></button>
          <span className="flex-1" />
          <button className="p-1.5 rounded-lg hover:bg-neutral-100"><MoreVertical className="w-5 h-5 text-neutral-400" /></button>
        </div>

        {/* Title + breadcrumb */}
        <div className="bg-white px-5 pb-4">
          <h1 className="text-xl font-bold text-neutral-900 mt-2 mb-1">{item.name}</h1>
          <div className="flex items-center gap-1 text-xs text-neutral-400">
            <span>{board.name}</span>
            <ChevronLeft className="w-3 h-3" />
            <span>{group.name}</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-neutral-100 px-5 flex gap-4">
          {(["columns", "updates", "files"] as const).map(t => (
            <button key={t} onClick={() => setItemTab(t)}
              className={cn("py-2.5 text-sm font-semibold border-b-2 transition-colors",
                itemTab === t ? "border-[#5559DF] text-[#5559DF]" : "border-transparent text-neutral-400")}>
              {t === "columns" ? "الأعمدة" : t === "updates" ? `التحديثات${item.updates.length > 0 ? ` (${item.updates.length})` : ""}` : "الملفات"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {itemTab === "columns" && (
            <div className="space-y-3">
              {/* Person */}
              <div className="bg-white rounded-xl p-4">
                <p className="text-xs font-semibold text-neutral-400 mb-3">المسؤول</p>
                <div className="flex items-center gap-2">
                  <Avatar name={item.person} size="md" />
                  <span className="text-sm font-semibold text-neutral-700">{item.person || "غير محدد"}</span>
                </div>
              </div>
              {/* Status */}
              <div className="bg-white rounded-xl p-4">
                <p className="text-xs font-semibold text-neutral-400 mb-3">الحالة</p>
                <div className="space-y-2">
                  {(["working", "done", "stuck", "none"] as TaskStatus[]).map(s => (
                    <button key={s} onClick={() => changeStatus(item.id, s)}
                      className={cn("w-full rounded-xl py-3 text-sm font-bold transition-all border-2",
                        item.status === s ? "border-[#5559DF] shadow-md scale-[1.01]" : "border-transparent")}
                      style={{ backgroundColor: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color }}>
                      {STATUS_CONFIG[s].label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Date */}
              {item.date && (
                <div className="bg-white rounded-xl p-4">
                  <p className="text-xs font-semibold text-neutral-400 mb-2">التاريخ</p>
                  <div className="flex items-center gap-2 text-sm text-neutral-700 font-medium">
                    <Calendar className="w-4 h-4 text-neutral-400" />
                    <span>{item.date}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {itemTab === "updates" && (
            <div className="space-y-3">
              {item.updates.length === 0 ? (
                <div className="text-center py-12 text-neutral-400">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">لا توجد تحديثات بعد</p>
                </div>
              ) : item.updates.map(u => (
                <div key={u.id} className="bg-white rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar name={u.author} size="md" />
                    <div>
                      <p className="text-sm font-bold text-neutral-800">{u.author}</p>
                      <p className="text-[10px] text-neutral-400">{u.time}</p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-700">{u.content}</p>
                </div>
              ))}
            </div>
          )}

          {itemTab === "files" && (
            <div className="text-center py-12 text-neutral-400">
              <Paperclip className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-semibold">لا توجد ملفات</p>
              <p className="text-xs mt-1">يمكنك رفع الملفات من خلال التحديثات</p>
            </div>
          )}
        </div>

        {/* Update input */}
        {itemTab === "updates" && (
          <div className="bg-white border-t border-neutral-100 p-3 flex items-center gap-2">
            <input
              value={newUpdate} onChange={e => setNewUpdate(e.target.value)}
              placeholder="اكتب تحديثاً..."
              className="flex-1 text-sm bg-neutral-50 rounded-xl px-3 py-2.5 outline-none border border-neutral-200"
            />
            <button onClick={addUpdate} disabled={!newUpdate.trim()}
              className="w-9 h-9 bg-[#5559DF] rounded-xl flex items-center justify-center disabled:opacity-40">
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // ─── Render: Board Detail ──────────────────────────────
  if (selectedBoard) {
    return (
      <div dir="rtl" className="min-h-screen bg-neutral-50 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-neutral-100 px-4 h-14 flex items-center gap-3">
          <button onClick={goBack} className="p-1.5 rounded-lg hover:bg-neutral-100"><ChevronRight className="w-5 h-5 text-neutral-500" /></button>
          <span className="font-bold text-neutral-900 flex-1 text-center">{selectedBoard.name}</span>
          <button className="p-1.5 rounded-lg hover:bg-neutral-100"><MoreHorizontal className="w-5 h-5 text-neutral-400" /></button>
        </div>

        {/* Scrollable groups */}
        <div className="flex-1 overflow-y-auto pb-6">
          {selectedBoard.groups.map(group => (
            <div key={group.id} className="mt-4 mx-3">
              {/* Group header */}
              <div className="flex items-center gap-2 mb-1 px-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: group.color }} />
                <span className="text-sm font-bold" style={{ color: group.color }}>{group.name}</span>
                <span className="text-xs text-neutral-400">({group.items.length})</span>
              </div>
              {/* Items */}
              <div className="bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm">
                {/* Column headers */}
                <div className="flex items-center border-b border-neutral-100 px-3 py-2">
                  <span className="flex-1 text-[10px] font-bold text-neutral-400">المهمة</span>
                  <span className="w-20 text-center text-[10px] font-bold text-neutral-400">الحالة</span>
                  <span className="w-7 text-center text-[10px] font-bold text-neutral-400">من</span>
                </div>
                {group.items.map((item, idx) => (
                  <button key={item.id} onClick={() => goItem(item, selectedBoard, group)}
                    className={cn("w-full flex items-center px-3 py-3 text-right gap-2 hover:bg-neutral-50 active:bg-neutral-100 transition-colors",
                      idx < group.items.length - 1 ? "border-b border-neutral-100" : "")}>
                    <div className="w-1 h-6 rounded-full shrink-0" style={{ backgroundColor: group.color }} />
                    <span className="flex-1 text-sm font-medium text-neutral-800 truncate">{item.name}</span>
                    <div className="w-20 shrink-0"><StatusBadge status={item.status} small /></div>
                    <Avatar name={item.person} />
                  </button>
                ))}
                {/* New item */}
                <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#5559DF] font-semibold hover:bg-neutral-50">
                  <Plus className="w-3.5 h-3.5" />
                  <span>مهمة جديدة</span>
                </button>
              </div>
            </div>
          ))}
          <button className="mx-3 mt-3 flex items-center gap-2 text-sm text-[#5559DF] font-semibold px-1">
            <Plus className="w-4 h-4" />
            <span>إضافة مجموعة</span>
          </button>
        </div>
      </div>
    );
  }

  // ─── Render: Home Tab ──────────────────────────────────
  const renderHome = () => {
    const starred = boards.filter(b => b.starred);
    return (
      <div className="flex-1 overflow-y-auto">
        {/* Favorites carousel */}
        {starred.length > 0 && (
          <div className="bg-[#5559DF] mx-0 rounded-b-3xl pt-4 pb-6 px-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold text-base">المفضلة</span>
              <button className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {starred.map(b => (
                <button key={b.id} onClick={() => goBoard(b)}
                  className="shrink-0 bg-white rounded-2xl p-3 w-40 text-right shadow-md">
                  <div className="text-2xl mb-2">{b.icon}</div>
                  <p className="text-sm font-bold text-neutral-800 truncate">{b.name}</p>
                  <p className="text-[10px] text-neutral-400">{b.workspace}</p>
                </button>
              ))}
              <button className="shrink-0 bg-white/20 rounded-2xl p-3 w-12 flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* Recently visited */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-neutral-800">آخر الزيارات</span>
            <button className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-neutral-500" />
            </button>
          </div>
          <div className="space-y-2">
            {boards.map(b => (
              <button key={b.id} onClick={() => goBoard(b)}
                className="w-full bg-white rounded-2xl p-3.5 flex items-center gap-3 border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-xl shrink-0">{b.icon}</div>
                <div className="flex-1 text-right min-w-0">
                  <p className="text-sm font-bold text-neutral-800 truncate">{b.name}</p>
                  <p className="text-xs text-neutral-400">{b.workspace} · {b.updatedAt}</p>
                </div>
                <button onClick={e => { e.stopPropagation(); toggleStar(b.id); }}
                  className="p-1 shrink-0">
                  <Star className={cn("w-4 h-4", b.starred ? "fill-amber-400 text-amber-400" : "text-neutral-300")} />
                </button>
              </button>
            ))}
          </div>

          {/* Workspaces */}
          <div className="mt-4">
            <button className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 border border-neutral-100 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-[#5559DF] flex items-center justify-center shrink-0">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-neutral-800 flex-1 text-right">مساحات العمل</span>
              <ChevronLeft className="w-4 h-4 text-neutral-400" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── Render: My Work Tab ───────────────────────────────
  const renderMyWork = () => (
    <div className="flex-1 overflow-y-auto px-4 pt-2">
      {/* Timeline chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {myWorkSections.map((s, idx) => (
          <button key={s.key}
            className={cn("shrink-0 rounded-2xl px-4 py-2 text-sm font-bold border-2 transition-all",
              idx === 0 ? "bg-[#5559DF]/10 border-[#5559DF] text-[#5559DF]" : "border-neutral-200 text-neutral-500 bg-white")}>
            <span className="text-lg font-black block leading-none">{s.items.length}</span>
            <span className="text-[10px] font-medium block mt-0.5">{s.label}</span>
          </button>
        ))}
        <button className="shrink-0 rounded-2xl px-4 py-2 text-sm font-bold border-2 border-neutral-200 text-neutral-500 bg-white">
          <span className="text-lg font-black block leading-none">0</span>
          <span className="text-[10px] font-medium block mt-0.5">بلا تاريخ</span>
        </button>
      </div>

      {/* Sections */}
      {myWorkSections.map(section => section.items.length > 0 && (
        <div key={section.key} className="mb-5">
          <h3 className="text-xs font-bold text-neutral-400 uppercase mb-2 px-1">{section.label}</h3>
          <div className="space-y-2">
            {section.items.map(item => (
              <button key={item.id} onClick={() => goItem(item, item.board, item.group)}
                className="w-full bg-white rounded-2xl p-3.5 border border-neutral-100 shadow-sm flex items-center gap-3 text-right">
                <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: item.group.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-neutral-800 truncate">{item.name}</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{item.boardName}</p>
                </div>
                <StatusBadge status={item.status} small />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ─── Render: Notifications Tab ─────────────────────────
  const renderNotifications = () => (
    <div className="flex-1 overflow-y-auto px-4 pt-2">
      {notifications.map(n => (
        <button key={n.id} onClick={() => setNotifications(ns => ns.map(x => x.id === n.id ? { ...x, read: true } : x))}
          className={cn("w-full flex items-start gap-3 p-3.5 rounded-2xl mb-2 text-right border transition-colors",
            n.read ? "bg-white border-neutral-100" : "bg-[#5559DF]/5 border-[#5559DF]/20")}>
          {!n.read && <div className="w-2 h-2 rounded-full bg-[#5559DF] mt-1.5 shrink-0" />}
          {n.read && <div className="w-2 h-2 shrink-0" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-sm font-bold text-neutral-800">{n.author}</span>
              <span className="text-xs text-neutral-500">{n.action}</span>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5 truncate">{n.board} · {n.item}</p>
            <p className="text-[10px] text-neutral-400 mt-1">{n.time}</p>
          </div>
        </button>
      ))}
    </div>
  );

  // ─── Render: More Tab ──────────────────────────────────
  const renderMore = () => (
    <div className="flex-1 overflow-y-auto px-4 pt-4">
      {[
        { icon: User, label: "الملف الشخصي" },
        { icon: Bell, label: "إعدادات الإشعارات" },
        { icon: Filter, label: "الفلاتر المحفوظة" },
        { icon: Tag, label: "التصنيفات" },
        { icon: Clock, label: "سجل النشاط" },
      ].map(({ icon: Icon, label }) => (
        <button key={label} className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 mb-2 border border-neutral-100 shadow-sm">
          <div className="w-9 h-9 bg-neutral-100 rounded-xl flex items-center justify-center">
            <Icon className="w-4 h-4 text-neutral-600" />
          </div>
          <span className="flex-1 text-sm font-semibold text-neutral-800 text-right">{label}</span>
          <ChevronLeft className="w-4 h-4 text-neutral-300" />
        </button>
      ))}
      {onBack && (
        <button onClick={onBack} className="w-full mt-4 bg-red-50 rounded-2xl p-4 flex items-center gap-3 border border-red-100">
          <div className="w-9 h-9 bg-red-100 rounded-xl flex items-center justify-center">
            <X className="w-4 h-4 text-red-500" />
          </div>
          <span className="flex-1 text-sm font-semibold text-red-500 text-right">الخروج من إدارة المهام</span>
        </button>
      )}
    </div>
  );

  // ─── Main Shell ────────────────────────────────────────
  return (
    <div dir="rtl" className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-neutral-100 px-4 h-14 flex items-center gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-6 h-6 bg-[#5559DF] rounded-md flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
          </div>
          <span className="font-black text-neutral-900 text-sm">إدارة المهام</span>
        </div>
        <div className="flex-1" />
        <AnimatePresence>
          {searchOpen && (
            <motion.input initial={{ width: 0, opacity: 0 }} animate={{ width: 140, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="بحث..." className="text-sm bg-neutral-100 rounded-xl px-3 py-1.5 outline-none" />
          )}
        </AnimatePresence>
        <button onClick={() => { setSearchOpen(v => !v); setSearchQuery(""); }} className="p-1.5 rounded-lg hover:bg-neutral-100">
          {searchOpen ? <X className="w-5 h-5 text-neutral-500" /> : <Search className="w-5 h-5 text-neutral-500" />}
        </button>
        <button className="p-1.5 rounded-lg hover:bg-neutral-100">
          <Plus className="w-5 h-5 text-[#5559DF]" />
        </button>
      </div>

      {/* Search results overlay */}
      {searchOpen && searchQuery.length > 1 && (
        <div className="bg-white border-b border-neutral-100 px-4 py-2 max-h-48 overflow-y-auto">
          {searchResults.length === 0 ? (
            <p className="text-sm text-neutral-400 py-3 text-center">لا توجد نتائج</p>
          ) : searchResults.map(item => (
            <button key={item.id} onClick={() => { goItem(item, item.board, item.group); setSearchOpen(false); setSearchQuery(""); }}
              className="w-full flex items-center gap-2 py-2 text-right">
              <StatusBadge status={item.status} small />
              <div>
                <p className="text-sm font-semibold text-neutral-800">{item.name}</p>
                <p className="text-xs text-neutral-400">{item.boardName}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Page content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {tab === "home" && renderHome()}
        {tab === "mywork" && renderMyWork()}
        {tab === "notifications" && renderNotifications()}
        {tab === "more" && renderMore()}
      </div>

      {/* Bottom navigation */}
      <div className="bg-white border-t border-neutral-100 flex items-center px-2 pb-safe">
        {([
          { key: "home" as TabKey, label: "الرئيسية", icon: Home, badge: 0 },
          { key: "mywork" as TabKey, label: "مهامي", icon: Briefcase, badge: 0 },
          { key: "notifications" as TabKey, label: "الإشعارات", icon: Bell, badge: unreadCount },
          { key: "more" as TabKey, label: "المزيد", icon: MoreHorizontal, badge: 0 },
        ]).map(({ key, label, icon: Icon, badge }) => (
          <button key={key} onClick={() => setTab(key as TabKey)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5">
            <div className="relative">
              <Icon className={cn("w-5 h-5 transition-colors", tab === key ? "text-[#5559DF]" : "text-neutral-400")} />
              {badge ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E2445C] rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                  {badge}
                </span>
              ) : null}
            </div>
            <span className={cn("text-[10px] font-semibold transition-colors", tab === key ? "text-[#5559DF]" : "text-neutral-400")}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
