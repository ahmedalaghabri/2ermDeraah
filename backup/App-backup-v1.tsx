import React, { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Search,
  Settings,
  Menu,
  LogOut,
  Sun,
  Moon,
  Inbox,
  Send,
  FileText,
  Users,
  ShieldCheck,
  ClipboardList,
  Award,
  Accessibility,
  GaugeCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Upload,
  X,
  Save,
  Check,
  ArrowRight,
  Tag,
  Calendar,
  Building2,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle,
  Phone,
  RefreshCcw,
  Archive,
  FilePlus,
  Mail,
  BarChart3,
  LayoutDashboard,
  ArrowLeftRight,
} from "lucide-react";

// ====== مجموعات القائمة الجانبية ======
const sidebarGroups = [
  {
    label: "عام",
    items: [{ key: "dashboard", title: "الرئيسية", icon: GaugeCircle }],
  },
  {
    label: "الطلبات",
    items: [
      { key: "request_new", title: "طلب جديد", icon: FilePlus },
      { key: "inbox", title: "الوارد", icon: Inbox },
      { key: "outbox", title: "الصادر", icon: Send },
      { key: "request_archive", title: "ارشيف الطلب", icon: Archive },
      { key: "notices", title: "التنبيهات والتعميمات", icon: Bell },
    ],
  },
  {
    label: "الحضور والانصراف",
    items: [
      { key: "attendance_report", title: "تقرير الحضور", icon: Calendar },
      { key: "exit_permission", title: "طلب اذن خروج", icon: LogOut },
      { key: "permissions_review", title: "مراجعة الأذونات", icon: ClipboardList },
      { key: "hazer_system", title: "نظام حاضر", icon: Clock },
    ],
  },
  {
    label: "المسيرات والخصوم",
    items: [
      { key: "advances_approval", title: "مصادقة السلف", icon: CheckCircle },
      { key: "payroll_deductions", title: "المسير والخصوم", icon: ClipboardList },
    ],
  },
  {
    label: "الأنشطة والمسابقات",
    items: [
      { key: "excellence_comp", title: "مسابقة التميز المؤسسي", icon: Award },
      { key: "ramadan_events", title: "مسابقة وأنشطة رمضان", icon: Sparkles },
    ],
  },
  {
    label: "خدمات أخرى",
    items: [
      { key: "complaints", title: "الشكاوى والاقتراحات", icon: AlertTriangle },
      { key: "central", title: "السنترال", icon: Phone },
      { key: "profile_update", title: "تحديث البيانات", icon: RefreshCcw },
      { key: "help", title: "مساعدة", icon: Sparkles },
    ],
  },
  {
    label: "روابط خارجية",
    items: [
      { key: "hr_queries", title: "استعلامات الموارد البشرية", icon: Users },
      { key: "archiving_system", title: "نظام الأرشفة الإلكترونية", icon: Archive },
      { key: "tasks_tracking", title: "نظام متابعة المهام", icon: ClipboardList },
      { key: "deraa_email", title: "إيميل درعه", icon: Mail },
      { key: "external_email", title: "الإيميل الخارجي", icon: Mail },
      { key: "daily_sales", title: "المبيعات اليومية", icon: BarChart3 },
      { key: "portal_dashboard", title: "لوحة تحكم البوابة", icon: LayoutDashboard },
      { key: "email_dashboard", title: "لوحة تحكم الايميل", icon: LayoutDashboard },
      { key: "transactions_reports", title: "تقارير المعاملات", icon: BarChart3 },
      { key: "transfers_followup", title: "متابعة التحويلات والاستلامات", icon: ArrowLeftRight },
    ],
  },
];

// ====== مكوّنات مساعدة ======
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

function PageShell({ title, children }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <span className="font-medium">{title}</span>
      </div>
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-sm">
        {children}
      </div>
    </div>
  );
}

function AttendanceMiniChart({ data }) {
  const max = 100;
  return (
    <div className="w-full">
      <div className="h-48 w-full flex items-end gap-2">
        {data.map((d) => (
          <div key={d.day} className="flex-1 flex flex-col justify-end gap-0.5">
            <div className="w-full rounded-t-md bg-emerald-500/80" style={{ height: `${(d.present / max) * 100}%` }} title={`حضور ${d.present}%`} />
            <div className="w-full bg-amber-500/80" style={{ height: `${(d.late / max) * 100}%` }} title={`تأخير ${d.late}%`} />
            <div className="w-full rounded-b-md bg-rose-500/80" style={{ height: `${(d.absent / max) * 100}%` }} title={`غياب ${d.absent}%`} />
            <div className="text-[11px] text-center mt-1 text-neutral-500">{d.day}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs mt-3 text-neutral-600 dark:text-neutral-400">
        <span className="inline-flex items-center gap-1"><span className="inline-block size-3 rounded-sm bg-emerald-500/80" /> حضور</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block size-3 rounded-sm bg-amber-500/80" /> تأخير</span>
        <span className="inline-flex items-center gap-1"><span className="inline-block size-3 rounded-sm bg-rose-500/80" /> غياب</span>
      </div>
    </div>
  );
}

// ====== نموذج إضافة معاملة ======
function AddTransactionForm({ onCancel, onSaved }) {
  const fileInputRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [form, setForm] = useState({
    direction: "صادر",
    type: "خطاب",
    title: "",
    refNo: "",
    date: "",
    dueDate: "",
    sender: "",
    receiver: "",
    priority: "عادي",
    confidentiality: "عادي",
    department: "",
    assignee: "",
    description: "",
  });

  function setField(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function validate() {
    const e = {};
    if (!form.title?.trim()) e.title = "العنوان مطلوب";
    if (!form.date) e.date = "التاريخ مطلوب";
    if (!form.direction) e.direction = "الاتجاه مطلوب";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function onFilesSelected(files) {
    const list = Array.from(files || []);
    if (!list.length) return;
    setAttachments((prev) => [
      ...prev,
      ...list.map((f) => ({ id: crypto.randomUUID?.() || String(Math.random()), name: f.name, size: f.size })),
    ]);
  }

  function removeAttachment(id) { setAttachments((prev) => prev.filter((a) => a.id !== id)); }
  function addTagFromInput(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = e.currentTarget.value.trim().replace(/,$/, "");
      if (val && !tags.includes(val)) setTags((t) => [...t, val]);
      e.currentTarget.value = "";
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      onSaved?.({ ...form, tags, attachments });
    }, 500);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300">
        <button onClick={onCancel} className="inline-flex items-center gap-1 hover:underline">
          <ArrowRight className="h-4 w-4" /> الرئيسية
        </button>
        <span>/</span>
        <span className="font-medium">إضافة معاملة</span>
      </div>

      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">إضافة معاملة</h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">أدخل تفاصيل المعاملة الجديدة، الحقول الأساسية مطلوبة.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onCancel} className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60 text-sm">إلغاء</button>
            <button onClick={handleSubmit} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 disabled:opacity-50">
              {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
              حفظ المعاملة
            </button>
          </div>
        </div>

        {saved && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300 p-3 text-sm">تم حفظ المعاملة بنجاح.</div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* العمود 1 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">عنوان المعاملة<span className="text-red-600">*</span></label>
              <input value={form.title} onChange={(e) => setField("title", e.target.value)} className={cn("w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border", errors.title ? "border-red-500" : "border-neutral-200 dark:border-neutral-700")} placeholder="مثال: طلب اعتماد عقد صيانة" />
              {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">الاتجاه<span className="text-red-600">*</span></label>
                <select value={form.direction} onChange={(e) => setField("direction", e.target.value)} className={cn("w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border", errors.direction ? "border-red-500" : "border-neutral-200 dark:border-neutral-700")}> 
                  <option>صادر</option>
                  <option>وارد</option>
                  <option>داخلي</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1">نوع المعاملة</label>
                <select value={form.type} onChange={(e) => setField("type", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                  <option>خطاب</option>
                  <option>طلب</option>
                  <option>محضر</option>
                  <option>مذكرة</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">رقم المرجع</label>
                <input value={form.refNo} onChange={(e) => setField("refNo", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="مثال: HR-2025-001" />
              </div>
              <div>
                <label className="block text-sm mb-1">التاريخ<span className="text-red-600">*</span></label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} className={cn("w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border", errors.date ? "border-red-500" : "border-neutral-200 dark:border-neutral-700")} />
                </div>
                {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
              </div>
            </div>
          </div>
          {/* العمود 2 */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">الجهة المرسلة</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <input value={form.sender} onChange={(e) => setField("sender", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="اسم الجهة/القسم" />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">الجهة المستلمة</label>
                <div className="relative">
                  <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <input value={form.receiver} onChange={(e) => setField("receiver", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="اسم الجهة/القسم" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">الأولوية</label>
                <div className="relative">
                  <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <select value={form.priority} onChange={(e) => setField("priority", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <option>عادي</option>
                    <option>عاجل</option>
                    <option>عاجل جدًا</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">درجة السرية</label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                  <select value={form.confidentiality} onChange={(e) => setField("confidentiality", e.target.value)} className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700">
                    <option>عادي</option>
                    <option>سري</option>
                    <option>سري جدًا</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">تاريخ الاستحقاق</label>
                <input type="date" value={form.dueDate} onChange={(e) => setField("dueDate", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
              </div>
              <div>
                <label className="block text-sm mb-1">القسم/الإدارة</label>
                <input value={form.department} onChange={(e) => setField("department", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="مثال: الموارد البشرية" />
              </div>
            </div>
          </div>
          {/* العمود 3 */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-1">المكلف بالمعاملة</label>
              <input value={form.assignee} onChange={(e) => setField("assignee", e.target.value)} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="اسم الموظف" />
            </div>
            <div>
              <label className="block text-sm mb-1">وسوم</label>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {tags.map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs bg-neutral-200 dark:bg-neutral-800">
                    <Tag className="h-3 w-3" /> {t}
                    <button onClick={() => setTags((prev) => prev.filter((x) => x !== t))} className="ms-1"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <input onKeyDown={addTagFromInput} placeholder="اكتب الوسم ثم Enter" className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" />
            </div>
            <div>
              <label className="block text-sm mb-1">الوصف</label>
              <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} rows={5} className="w-full rounded-xl px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700" placeholder="تفاصيل إضافية حول المعاملة" />
            </div>
          </div>
          {/* مرفقات */}
          <div className="lg:col-span-3">
            <label className="block text-sm mb-1">المرفقات</label>
            <div className="rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 p-4">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="text-sm text-neutral-600 dark:text-neutral-400">اسحب وأفلت الملفات هنا أو</div>
                <div className="flex items-center gap-2">
                  <input ref={fileInputRef} onChange={(e) => onFilesSelected(e.target.files)} type="file" multiple hidden />
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60 text-sm"><Upload className="h-4 w-4" /> اختر ملفات</button>
                </div>
              </div>
              {!!attachments.length && (
                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {attachments.map((a) => (
                    <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-neutral-200 dark:border-neutral-800 px-3 py-2 text-sm bg-white dark:bg-neutral-900">
                      <div className="truncate">{a.name}</div>
                      <button onClick={() => removeAttachment(a.id)} className="p-1 rounded-md hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60"><X className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-5 pb-4 flex items-center justify-start text-sm mt-auto">
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ====== البيانات التجريبية للبطاقات (كاملة) ======
const cards = [
  { title: "التنبيهات", subtitle: "إشعارات النظام", icon: Bell, badge: 3, accent: "from-red-500/50 to-rose-500/50", action: "إخفاء التنبيهات" },
  { title: "أرشيف الصادر", subtitle: "إدارة الصادر", icon: Send, badge: 1, accent: "from-amber-500/50 to-orange-500/50", action: "التفاصيل" },
  { title: "الوارد", subtitle: "المكاتبات الواردة", icon: Inbox, badge: 0, accent: "from-emerald-500/50 to-green-600/50", action: "التفاصيل" },
  { title: "عقد العمل الإلكتروني", subtitle: "إدارة العقود", icon: FileText, badge: 12, accent: "from-sky-500/50 to-blue-600/50", action: "عرض العقود" },
  { title: "المظهر الشخصي والزي", subtitle: "سياسات الزي", icon: Users, badge: null, accent: "from-indigo-500/50 to-violet-600/50", action: "التفاصيل" },
  { title: "الكفاءات الفنية والمهارية", subtitle: "مسارات التطوير", icon: Sparkles, badge: 4, accent: "from-fuchsia-500/50 to-pink-600/50", action: "استعراض" },
  { title: "سياسة تقييم الأداء الوظيفي", subtitle: "تقارير الأداء", icon: ClipboardList, badge: null, accent: "from-cyan-500/50 to-teal-600/50", action: "بدء التقييم" },
  { title: "الإجراءات التشغيلية الموحدة — SOP", subtitle: "دليل الإجراءات", icon: ShieldCheck, badge: null, accent: "from-slate-500/50 to-gray-600/50", action: "فتح الدليل" },
  { title: "تعليمات السلامة والصحة المهنية والبيئة", subtitle: "سلامة وجودة", icon: ShieldCheck, badge: null, accent: "from-lime-500/50 to-emerald-600/50", action: "استعراض" },
  { title: "دليل التعامل مع ذوي الإعاقة", subtitle: "تيسير الوصول", icon: Accessibility, badge: null, accent: "from-purple-500/50 to-indigo-600/50", action: "التفاصيل" },
  { title: "مسابقة التميز المؤسسي", subtitle: "مؤشرات التميز", icon: Award, badge: null, accent: "from-rose-500/50 to-red-600/50", action: "اشترك الآن" },
];

// بطاقات الصف الأول (تضم "معاملة جديد")
const primaryCards = [
  { title: "معاملة جديد", subtitle: "بدء معاملة جديدة", icon: FilePlus, badge: null, accent: "from-blue-500/50 to-sky-600/50", action: "بدء الإضافة", onAction: (setView) => setView("add") },
  { title: "الوارد", subtitle: "المكاتبات الواردة", icon: Inbox, badge: 0, accent: "from-emerald-500/50 to-green-600/50", action: "التفاصيل" },
  { title: "الصادر", subtitle: "إدارة الصادر", icon: Send, badge: 1, accent: "from-amber-500/50 to-orange-500/50", action: "التفاصيل" },
  { title: "تقرير الحضور", subtitle: "نسبة الالتزام اليوم", icon: Calendar, badge: null, accent: "from-indigo-500/50 to-violet-600/50", action: "عرض التقرير", onAction: (setView) => setView("attendance_report") },
];

// ====== الواجهة الرئيسية ======
export default function ResponsiveDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [activeKey, setActiveKey] = useState("dashboard");
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(sidebarGroups.map((g) => [g.label, true])));
  const [view, setView] = useState("dashboard"); // dashboard | add | attendance_report | ...

  const rootClass = useMemo(() => cn(
    "min-h-screen w-full font-sans antialiased transition-colors duration-300",
    dark ? "dark bg-neutral-950 text-neutral-100" : "text-neutral-900"
  ), [dark]);

  const backgroundStyle = dark ? {} : { backgroundColor: '#FAFCFF' };

  // عناوين الصفحات
  const titlesMap = (() => {
    const map = { dashboard: "البوابة الإلكترونية", add: "معاملة جديد", attendance_report: "تقرير الحضور" };
    sidebarGroups.forEach((g) => g.items.forEach((it) => (map[it.key] = it.title)));
    return map;
  })();
  const currentTitle = titlesMap[view] || "البوابة الإلكترونية";

  function toggleGroup(label) { setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] })); }

  const remainingCards = cards.filter((c) => !["الوارد", "أرشيف الصادر"].includes(c.title));
  const orderedCards = [
    ...primaryCards.map((c) => ({ ...c, onAction: c.onAction?.bind(null, setView) })),
    ...remainingCards,
  ];

  function renderDashboard() {
    return (
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
        {orderedCards.map((card, idx) => (
          <motion.div key={card.title + idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * idx }} className="group h-full">
            <div className="relative h-full min-h-[220px] flex flex-col overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm hover:shadow-xl transition-shadow">
              {/* طبقة التدرّج المخفّف 50% */}
              <div className={cn("absolute inset-x-0 -top-16 h-40 bg-gradient-to-r opacity-20 group-hover:opacity-30 blur-2xl transition", card.accent)} />
              <div className="relative p-5 flex items-start gap-4 flex-1">
                <div className="shrink-0">
                  <div className="size-12 rounded-2xl bg-gradient-to-br from-white/70 to-white/30 dark:from-neutral-800/60 dark:to-neutral-700/30 border border-neutral-200/70 dark:border-neutral-700/50 backdrop-blur flex items-center justify-center">
                    <card.icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold tracking-tight leading-6 text-gray-900 dark:text-white">{card.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-neutral-400 mt-0.5">{card.subtitle}</p>
                </div>
                {card.badge !== null && (
                  <span className="inline-flex items-center justify-center h-7 min-w-[1.75rem] px-2 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: '#B21063' }}>{card.badge}</span>
                )}
              </div>
              <div className="px-5 pb-4 flex items-center justify-start text-sm mt-auto">
                <button onClick={card.onAction} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">{card.action}</button>
              </div>
            </div>
          </motion.div>
        ))}
      </section>
    );
  }

  function renderAttendancePage() {
    const attendanceData = [
      { day: "سبت", present: 92, late: 5, absent: 3 },
      { day: "أحد", present: 94, late: 4, absent: 2 },
      { day: "اثنين", present: 90, late: 6, absent: 4 },
      { day: "ثلاثاء", present: 96, late: 2, absent: 2 },
      { day: "أربعاء", present: 93, late: 5, absent: 2 },
      { day: "خميس", present: 91, late: 5, absent: 4 },
      { day: "جمعة", present: 0, late: 0, absent: 0 },
    ];
    const attendanceSummary = { present: 92, late: 5, absent: 3 };

    return (
      <PageShell title="تقرير الحضور">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-4">
            <div className="text-xs text-neutral-500">نسبة الحضور اليوم</div>
            <div className="text-2xl font-bold mt-1">{attendanceSummary.present}%</div>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-4">
            <div className="text-xs text-neutral-500">عدد المتأخرين</div>
            <div className="text-2xl font-bold mt-1">{attendanceSummary.late}</div>
          </div>
          <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 p-4">
            <div className="text-xs text-neutral-500">عدد الغياب</div>
            <div className="text-2xl font-bold mt-1">{attendanceSummary.absent}</div>
          </div>
        </div>
        <AttendanceMiniChart data={attendanceData} />
      </PageShell>
    );
  }

  function renderGenericPage(key) {
    const title = titlesMap[key] || "صفحة";
    return (
      <PageShell title={title}>
        <div className="text-sm text-neutral-600 dark:text-neutral-300">هذه صفحة {title}. يمكن لاحقًا ربطها بواجهة فعلية أو بيانات من API.</div>
      </PageShell>
    );
  }

  function renderContent() {
    if (view === "dashboard") return renderDashboard();
    if (view === "add") return <AddTransactionForm onCancel={() => setView("dashboard")} onSaved={() => {}} />;
    if (view === "attendance_report") return renderAttendancePage();
    return renderGenericPage(view);
  }

  // ====== اختبارات دخانية (Smoke Tests) ======
  try {
    console.groupCollapsed("[SmokeTests] ResponsiveDashboard");
    console.assert(Array.isArray(sidebarGroups) && sidebarGroups.length > 0, "sidebarGroups should have items");
    console.assert(Array.isArray(cards) && cards.length >= 8, "cards should contain many items");
    console.assert(primaryCards[0]?.title === "معاملة جديد", "Primary card title should be 'معاملة جديد'");
    console.groupEnd();
  } catch (e) {
    console.warn("Smoke tests failed:", e);
  }

  return (
    <div dir="rtl" className={rootClass} style={backgroundStyle}>
      {/* Top Bar */}
      <header className="sticky top-0 z-30 backdrop-blur border-b border-neutral-200 dark:border-neutral-800" style={{ backgroundColor: '#FAFCFF' }}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center gap-3">
            <button onClick={() => setDrawerOpen(true)} className="md:hidden p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60" aria-label="فتح القائمة على الموبايل">
              <Menu className="h-5 w-5" />
            </button>
            <button onClick={() => setSidebarCollapsed((v) => !v)} className="hidden md:inline-flex p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60" aria-label="طي القائمة الجانبية">
              <Menu className="h-5 w-5" />
            </button>

            {/* شعار + العنوان */}
            <div className="ms-1 flex items-center gap-3">
              <img 
                src="/logonew.svg" 
                alt="الشعار" 
                className="h-24 w-24 object-contain" 
                onError={(e) => {
                  console.log('Logo failed to load, trying backup');
                  e.currentTarget.src = '/vite.svg';
                }}
                onLoad={() => console.log('Logo loaded successfully')}
              />
            </div>

            <div className="ms-auto flex items-center gap-2 sm:gap-3">
              {view === "dashboard" && (
                <div className="hidden md:flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
                    <input placeholder="ابحث عن خدمة أو مستند..." className="w-72 rounded-2xl ps-10 pe-4 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:ring-2 ring-blue-500" />
                  </div>
                </div>
              )}
              <button className="relative p-2 rounded-xl hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60 border border-transparent" aria-label="التنبيهات">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-0.5 -left-0.5 h-5 min-w-[1.25rem] px-1 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center">3</span>
              </button>
              <button onClick={() => setDark((d) => !d)} className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60" aria-label="تبديل الوضع الليلي">
                {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="hidden sm:flex items-center gap-2 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60">
                <Settings className="h-5 w-5" />
                <span className="text-sm">الإعدادات</span>
              </button>
              <button className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="py-6 flex gap-6">
        {/* Sidebar */}
        <aside className={cn("hidden md:flex flex-col transition-all duration-300 shrink-0 mr-4 sm:mr-6 lg:mr-8 ml-4 sm:ml-6 lg:ml-8", sidebarCollapsed ? "w-20" : "w-64")}>
          <nav className="relative rounded-2xl p-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pe-1">
              {sidebarGroups.map((group) => (
                <div key={group.label} className="mb-1">
                  <button onClick={() => toggleGroup(group.label)} className={cn("w-full flex items-center justify-between px-3 py-2 text-[12px] font-semibold text-neutral-500 dark:text-neutral-400", sidebarCollapsed && "justify-center")} title={sidebarCollapsed ? group.label : undefined}>
                    {!sidebarCollapsed && <span className="truncate text-right">{group.label}</span>}
                    {!sidebarCollapsed ? (
                      <ChevronDown className={cn("h-4 w-4 transition-transform", openGroups[group.label] ? "rotate-0" : "-rotate-90")} />
                    ) : (
                      <ChevronDown className="h-4 w-4 opacity-60" />
                    )}
                  </button>
                  <div className={cn(openGroups[group.label] ? "block" : "hidden")}>
                    {group.items.map(({ key, title, icon: Icon }) => (
                      <div key={key} className="group relative">
                        <button
                          onClick={() => {
                            setActiveKey(key);
                            if (key === "request_new") setView("add"); else setView(key);
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition outline-none",
                            activeKey === key ? "bg-neutral-100 dark:bg-neutral-800/70 text-neutral-900 dark:text-neutral-50 ring-1 ring-neutral-200 dark:ring-neutral-700" : "text-neutral-700 dark:text-neutral-300 hover:bg-[#B21063]/10 active:bg-[#B21063]/20 dark:hover:bg-[#B21063]/20 dark:active:bg-[#B21063]/30"
                          )}
                          title={sidebarCollapsed ? title : undefined}
                        >
                          {activeKey === key && <span className="absolute inset-y-1 right-0 w-1.5 rounded-s-full bg-blue-600 dark:bg-blue-500" />}
                          <Icon className="h-5 w-5 shrink-0" />
                          {!sidebarCollapsed && <span className="truncate text-right">{title}</span>}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 -mb-2 mt-2 bg-gradient-to-t from-white/90 dark:from-neutral-900/90 to-transparent pt-2">
              <button onClick={() => setSidebarCollapsed((v) => !v)} className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-blue-50 active:bg-blue-100 dark:hover:bg-blue-900/40 dark:active:bg-blue-900/60 text-sm">
                {sidebarCollapsed ? (<><ChevronLeft className="h-4 w-4" /><span>توسيع</span></>) : (<><ChevronRight className="h-4 w-4" /><span>طيّ</span></>)}
              </button>
            </div>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-7xl">
          {renderContent()}
          <footer className="mt-10 text-center text-xs text-neutral-500 dark:text-neutral-400">استعادة كاملة + معالجة شعار مرنة للمسارات.</footer>
        </main>
      </div>

      {/* Drawer (Mobile) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute top-0 right-0 h-full w-[85%] max-w-sm bg-white dark:bg-neutral-900 border-s border-neutral-200 dark:border-neutral-800 shadow-xl p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">القائمة</span>
              <button onClick={() => setDrawerOpen(false)} className="text-sm px-3 py-1 rounded-lg border border-neutral-200 dark:border-neutral-800">إغلاق</button>
            </div>
            <div className="relative mb-3">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" />
              <input placeholder="ابحث عن خدمة..." className="w-full rounded-xl ps-9 pe-3 py-2 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:ring-2 ring-blue-500" />
            </div>
            {sidebarGroups.map((group) => (
              <div key={group.label} className="mb-2">
                <div className="px-1 py-1 text-[12px] font-semibold text-neutral-500 dark:text-neutral-400">{group.label}</div>
                <ul className="space-y-1">
                  {group.items.map(({ key, title, icon: Icon }) => (
                    <li key={key}>
                      <button
                        onClick={() => {
                          setActiveKey(key);
                          setDrawerOpen(false);
                          if (key === "request_new") setView("add"); else setView(key);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#B21063]/10 active:bg-[#B21063]/20 dark:hover:bg-[#B21063]/20 dark:active:bg-[#B21063]/30 text-sm"
                      >
                        <Icon className="h-5 w-5" />
                        <span className="truncate text-right">{title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>
        </div>
      )}

      {/* Bottom Navigation — Mobile */}
      <nav className="md:hidden sticky bottom-0 z-30 h-14 bg-white/80 dark:bg-neutral-900/80 backdrop-blur border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-around">
        {[
          { title: "الرئيسية", icon: GaugeCircle },
          { title: "الوارد", icon: Inbox },
          { title: "الإعدادات", icon: Settings },
        ].map(({ title, icon: Icon }) => (
          <button key={title} className="flex flex-col items-center gap-0.5 text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
            <Icon className="h-5 w-5" />
            {title}
          </button>
        ))}
      </nav>
    </div>
  );
}