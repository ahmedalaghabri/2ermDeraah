import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  ShoppingBag,
  FileText,
  MapPin,
  BarChart2,
  Calendar,
  ChevronDown,
  ArrowUpDown,
  X,
  Check,
  Table,
  LayoutGrid,
  Rows,
  Pin,
} from "lucide-react";
import { cn } from "../lib/utils";

// ─────────────────────────────────────────
// Constants
// ─────────────────────────────────────────
const MONTHS_AR = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
const DAYS_SHORT_AR = ["أحد","اثنين","ثلاثاء","أربعاء","خميس","جمعة","سبت"];

// ─────────────────────────────────────────
// Data — Generated (10 regions · 25 areas · 200 supervisors · 1000 showrooms · 1000 sellers)
// ─────────────────────────────────────────

// ── Deterministic pseudo-random helpers ──
function _ds(n: number) { return ((n * 9301 + 49297) % 233280) / 233280; }
function _dsk(...p: number[]) { return p.reduce((a, v, i) => a ^ ((v + 1) * (i * 7919 + 1)), 0); }
function _pick<T>(arr: T[], s: number): T { return arr[Math.floor(Math.abs(s) % 1 * arr.length)]; }
function _rng(lo: number, hi: number, s: number) { return Math.round(lo + s * (hi - lo)); }

// ── Name pools ──
const _FIRST = ["أحمد","محمد","عبدالله","خالد","فهد","سعد","عمر","ناصر","تركي","بندر","وليد","فيصل","ماجد","سلطان","نواف","بدر","منصور","راشد","زياد","عادل","يوسف","إبراهيم","حمد","صالح","جاسم","سامي","رامي","طارق","هاني","علي","حسن","عزيز","كريم","أنس","مازن","أيمن","رياض","بلال","وائل","أسامة","عاصم","حازم","مهند","لؤي","عمار","سيف","قيس","شادي","باسم","أيوب"];
const _LAST  = ["السلمي","الشمري","الدوسري","العمري","الحربي","النجار","الزهراني","القرني","الغامدي","الحسن","البلوي","المطيري","الرشيدي","القحطاني","العتيبي","الحمدان","الغريب","العجمي","العنزي","الرشيد","الشمراني","الجهني","الشريف","السبيعي","الحكمي","الجبير","الفيفي","الهاجري","الكثيري","البقمي","الصبيحي","الرويلي","الأنصاري","التميمي","القرشي","السهلي","الزيد","البسام","العيسى","العساف","الفضل","النويصر","الدخيل","الشايع","البراهيم","الموسى","الحمود","الصالح","المنصور","الخالدي"];
const _SFX   = ["العليا","المملكة","النزهة","الروضة","الملقا","الياسمين","الأندلس","السلام","الخليج","المزون","الراشد","النسيم","الوصل","الريان","الفيصلية","العقيق","حراء","النور","الصفاء","الجوهرة","البحر","الكورنيش","الفردوس","الغدير","التلال","الأفنان","البستان","الزيتون","الفلاح","الدانة","الهدى","المشرق","الرفيعة","الأمل","الريف","الواجهة","السحاب","الربوة","القمة","الأفق"];

// ── 10 Regions ──
const _REGION_META = [
  { n: "الرياض" },{ n: "الغربية" },{ n: "الخليج" },{ n: "الشمال" },{ n: "الجنوب" },
  { n: "الوسط"  },{ n: "الشرق"  },{ n: "تهامة"  },{ n: "نجد"    },{ n: "الحجاز" },
];

// ── 25 Areas (2–3 per region) ──
const _AREA_META: { n: string; ri: number }[] = [
  { n: "وسط الرياض",        ri: 0 },{ n: "شمال الرياض",       ri: 0 },{ n: "جنوب الرياض",      ri: 0 },
  { n: "جدة",               ri: 1 },{ n: "مكة المكرمة",       ri: 1 },{ n: "الطائف",            ri: 1 },
  { n: "الدمام",            ri: 2 },{ n: "الخبر",             ri: 2 },{ n: "الأحساء",           ri: 2 },
  { n: "القصيم",            ri: 3 },{ n: "الحدود الشمالية",   ri: 3 },{ n: "حائل",              ri: 3 },
  { n: "أبها",              ri: 4 },{ n: "نجران",             ri: 4 },{ n: "جيزان",             ri: 4 },
  { n: "الدوادمي",          ri: 5 },{ n: "الخرج",             ri: 5 },
  { n: "رفحاء",             ri: 6 },{ n: "عرعر",              ri: 6 },
  { n: "تبوك",              ri: 7 },{ n: "الوجه",             ri: 7 },
  { n: "عنيزة",             ri: 8 },{ n: "الرس",              ri: 8 },
  { n: "المدينة المنورة",   ri: 9 },{ n: "ينبع",              ri: 9 },
];

const REGIONS = _REGION_META.map((r, i) => ({ id: `r${i + 1}`, name: `إقليم ${r.n}` }));

const AREAS = _AREA_META.map((a, i) => ({
  id: `a${i + 1}`,
  name: `منطقة ${a.n}`,
  regionId: `r${a.ri + 1}`,
}));

// 200 supervisors: 8 per area (25 areas × 8 = 200)
const SUPERVISORS = Array.from({ length: 200 }, (_, i) => {
  const areaIdx = Math.floor(i / 8);              // area 0-24, 8 supervisors each
  const area    = AREAS[areaIdx];
  const s1 = _ds(_dsk(i, 1, 31));
  const s2 = _ds(_dsk(i, 2, 43));
  return {
    id: `sup${i + 1}`,
    name: `المشرف ${_pick(_FIRST, s1)} ${_pick(_LAST, s2)}`,
    areaId:   area.id,
    regionId: area.regionId,
  };
});

// 1000 showrooms: 40 per area (25 areas × 40 = 1000)
// Each group of 5 showrooms inside an area shares one supervisor (40 showrooms ÷ 8 supervisors = 5)
const SHOWROOMS = Array.from({ length: 1000 }, (_, i) => {
  const areaIdx  = Math.floor(i / 40);            // area 0-24
  const area     = AREAS[areaIdx];
  const supLocal = Math.floor((i % 40) / 5);      // supervisor slot 0-7 within the area
  const supIdx   = areaIdx * 8 + supLocal;
  const sfx      = _pick(_SFX, _ds(_dsk(i, 77)));
  return {
    id:           `sh${i + 1}`,
    name:         `معرض ${_AREA_META[areaIdx].n} - ${sfx}`,
    regionId:     area.regionId,
    areaId:       area.id,
    supervisorId: `sup${supIdx + 1}`,
  };
});

// 1000 sellers: 1 per showroom
const SELLERS = Array.from({ length: 1000 }, (_, i) => {
  const showroom   = SHOWROOMS[i];
  const f1  = _ds(_dsk(i, 11, 100));
  const f2  = _ds(_dsk(i, 22, 200));
  const sales      = _rng(75_000, 780_000,  _ds(_dsk(i, 33)));
  const target     = Math.round(sales * (0.82 + _ds(_dsk(i, 44)) * 0.40) / 10_000) * 10_000;
  const prevSales  = Math.round(sales * (0.68 + _ds(_dsk(i, 55)) * 0.42));
  const invoices   = _rng(200, 3600, _ds(_dsk(i, 66)));
  const pieces     = _rng(500, 9200, _ds(_dsk(i, 77)));
  const avgPieceSar = parseFloat((2.4 + _ds(_dsk(i, 88)) * 1.6).toFixed(1));
  return {
    id:           `sel${i + 1}`,
    name:         `${_pick(_FIRST, f1)} ${_pick(_LAST, f2)}`,
    showroomId:   showroom.id,
    regionId:     showroom.regionId,
    areaId:       showroom.areaId,
    supervisorId: showroom.supervisorId,
    sales,
    target,
    prevSales,
    invoices,
    avgInvoice:   Math.max(1, Math.round(sales / invoices)),
    pieces,
    avgPiece:     Math.max(1, Math.round(sales / pieces)),
    avgPieceSar,
    customers:    _rng(12, 130, _ds(_dsk(i, 99))),
  };
});

const CATEGORIES = [
  { name: "الهدايا", pct: 100, color: "#00C9A7" },
  { name: "العطور", pct: 100, color: "#00B4D8" },
  { name: "العناية", pct: 100, color: "#F9A825" },
  { name: "التجميل", pct: 99, color: "#4D8AFF" },
  { name: "العود", pct: 93, color: "#845EC2" },
  { name: "الإكسيسوار", pct: 0, color: "#E91E8C" },
];

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toArabicDigits(str: string) { return str; }

function formatNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "K";
  return n.toLocaleString("en-US");
}

function formatFull(n: number) { return n.toLocaleString("en-US"); }

function pctColor(pct: number) {
  if (pct >= 100) return "#00C9A7";
  if (pct >= 80) return "#4D8AFF";
  if (pct >= 60) return "#F9A825";
  return "#E91E8C";
}

function pctBg(pct: number) {
  if (pct >= 100) return "bg-emerald-100 text-emerald-700";
  if (pct >= 80) return "bg-blue-100 text-blue-700";
  if (pct >= 60) return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

// Deterministic pseudo-random — different result per unique integer key
function seed(n: number) { return ((n * 9301 + 49297) % 233280) / 233280; }

// Combine multiple integers into one unique seed key
function mkSeed(...parts: number[]) {
  return parts.reduce((acc, v, i) => acc ^ ((v + 1) * (i * 7919 + 1)), 0);
}

// ── Module-level caches (survive re-renders, reset never — data is deterministic) ──
const _monthDataCache = new Map<string, { day: number; current: number; prev: number }[]>();
const _dayDataCache   = new Map<string, { day: string; current: number; prev: number }[]>();
const _achCache       = new Map<string, number>();

// ── Per-seller, per-period sales generator ──────────────────────────────────

// Achievement ratio for a seller × year × month — ranges realistically 0.30 → 1.20
// Distribution: ~25% low (<60%), ~40% mid (60-90%), ~25% good (90-110%), ~10% excellent (>110%)
function sellerMonthAchievement(selIdx: number, year: number, month: number): number {
  const k = `${selIdx},${year},${month}`;
  if (_achCache.has(k)) return _achCache.get(k)!;
  const r = seed(mkSeed(selIdx + 3, year * 13, month * 7, 99));
  let v: number;
  if (r < 0.20) v = 0.28 + r * 1.6;
  else if (r < 0.55) v = 0.60 + (r - 0.20) * 1.71;
  else if (r < 0.80) v = 0.80 + (r - 0.55) * 1.20;
  else v = 1.10 + (r - 0.80) * 0.50;
  _achCache.set(k, v);
  return v;
}

// Daily variation factor within a month: ±35% around the monthly average
function dailyVariation(selIdx: number, year: number, month: number, day: number): number {
  return 0.65 + seed(mkSeed(selIdx, year, month, day, 1)) * 0.70;
}

function genSellerMonthData(selIdx: number, year: number, month: number) {
  const k = `${selIdx},${year},${month}`;
  if (_monthDataCache.has(k)) return _monthDataCache.get(k)!;
  const days = getDaysInMonth(year, month);
  const baseTarget  = SELLERS[selIdx].target;
  const achievement = sellerMonthAchievement(selIdx, year, month);
  const prevAch     = sellerMonthAchievement(selIdx, year - 1, month);
  const result = Array.from({ length: days }, (_, i) => {
    const d     = i + 1;
    const dv    = dailyVariation(selIdx, year, month, d);
    const dvP   = dailyVariation(selIdx, year - 1, month, d);
    const daily = (baseTarget * achievement / days) * dv;
    const prev  = (baseTarget * prevAch / days) * dvP;
    return { day: d, current: daily, prev };
  });
  _monthDataCache.set(k, result);
  return result;
}

function genSellerDayData(selIdx: number, year: number, month: number, day: number) {
  const k = `${selIdx},${year},${month},${day}`;
  if (_dayDataCache.has(k)) return _dayDataCache.get(k)!;
  const baseTarget  = SELLERS[selIdx].target;
  const achievement = sellerMonthAchievement(selIdx, year, month);
  const dailyTotal  = (baseTarget * achievement) / getDaysInMonth(year, month);
  const prevAch     = sellerMonthAchievement(selIdx, year - 1, month);
  const prevDaily   = (baseTarget * prevAch) / getDaysInMonth(year, month);
  const result = Array.from({ length: 12 }, (_, i) => {
    const h  = 8 + i;
    const s1 = seed(mkSeed(selIdx, year, month, day, h, 1));
    const s2 = seed(mkSeed(selIdx, year, month, day, h, 2));
    const hourWeight = 0.4 + Math.sin(((h - 8) / 14) * Math.PI) * 0.6;
    return {
      day: `${h}:00`,
      current: dailyTotal * hourWeight * (0.5 + s1 * 0.8) / 6,
      prev:    prevDaily  * hourWeight * (0.5 + s2 * 0.8) / 6,
    };
  });
  _dayDataCache.set(k, result);
  return result;
}

// Aggregate chart data across a list of seller indices for a given period
function genAggMonthData(selIdxs: number[], year: number, month: number) {
  const days = getDaysInMonth(year, month);
  const totals = new Float64Array(days * 2); // [cur0, prev0, cur1, prev1, ...]
  for (const si of selIdxs) {
    const rows = genSellerMonthData(si, year, month);
    for (let i = 0; i < days; i++) {
      totals[i * 2]     += rows[i].current;
      totals[i * 2 + 1] += rows[i].prev;
    }
  }
  return Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    current: totals[i * 2],
    prev:    totals[i * 2 + 1],
  }));
}

function genAggDayData(selIdxs: number[], year: number, month: number, day: number) {
  const totals = new Float64Array(24); // 12 hours × [cur, prev]
  for (const si of selIdxs) {
    const rows = genSellerDayData(si, year, month, day);
    for (let i = 0; i < 12; i++) {
      totals[i * 2]     += rows[i].current;
      totals[i * 2 + 1] += rows[i].prev;
    }
  }
  return Array.from({ length: 12 }, (_, i) => ({
    day: `${8 + i}:00`,
    current: totals[i * 2],
    prev:    totals[i * 2 + 1],
  }));
}

function genAggYearData(selIdxs: number[], year: number) {
  return MONTHS_AR.map((m, mIdx) => {
    const mData = genAggMonthData(selIdxs, year, mIdx);
    const prev  = genAggMonthData(selIdxs, year - 1, mIdx);
    return {
      day: m.slice(0, 3),
      current: mData.reduce((s, d) => s + d.current, 0) / 10,
      prev:    prev.reduce((s, d) => s + d.current, 0) / 10,
    };
  });
}

// ── Per-seller derived KPIs for a period ────────────────────────────────────
function sellerPeriodSales(selIdx: number, year: number, month: number, period: "day" | "month" | "year", day: number) {
  if (period === "day") {
    return genSellerDayData(selIdx, year, month, day).reduce((s, h) => s + h.current, 0);
  }
  if (period === "month") {
    return genSellerMonthData(selIdx, year, month).reduce((s, d) => s + d.current, 0);
  }
  // year
  return MONTHS_AR.reduce((s, _, mIdx) =>
    s + genSellerMonthData(selIdx, year, mIdx).reduce((ms, d) => ms + d.current, 0), 0);
}

function sellerPeriodPrevSales(selIdx: number, year: number, month: number, period: "day" | "month" | "year", day: number) {
  if (period === "day") {
    return genSellerDayData(selIdx, year, month, day).reduce((s, h) => s + h.prev, 0);
  }
  if (period === "month") {
    return genSellerMonthData(selIdx, year, month).reduce((s, d) => s + d.prev, 0);
  }
  return MONTHS_AR.reduce((s, _, mIdx) =>
    s + genSellerMonthData(selIdx, year - 1, mIdx).reduce((ms, d) => ms + d.current, 0), 0);
}

// Scale target to the selected period
function sellerPeriodTarget(selIdx: number, year: number, month: number, period: "day" | "month" | "year") {
  const annual = SELLERS[selIdx].target * 12;
  if (period === "year") return annual;
  const monthlyTarget = SELLERS[selIdx].target;
  if (period === "month") return monthlyTarget;
  return Math.round(monthlyTarget / getDaysInMonth(year, month));
}

// Scale invoices / pieces / customers proportionally to the period
function scalePeriodCount(base: number, year: number, month: number, period: "day" | "month" | "year") {
  if (period === "year") return base * 12;
  if (period === "month") return base;
  return Math.max(1, Math.round(base / getDaysInMonth(year, month)));
}

// Calendar day achievement %s (uses per-seller aggregate for the filtered set)
function genPeriodDayPcts(selIdxs: number[], year: number, month: number) {
  const days = getDaysInMonth(year, month);
  const r: Record<number, number> = {};
  for (let d = 1; d <= days; d++) {
    const current = selIdxs.reduce((s, si) => s + genSellerMonthData(si, year, month)[d - 1].current, 0);
    const target  = selIdxs.reduce((s, si) => s + sellerPeriodTarget(si, year, month, "day"), 0);
    r[d] = target > 0 ? Math.min(Math.round((current / target) * 100), 130) : 80;
  }
  return r;
}

// Month-tab achievement % for the calendar strip
function genMonthPct(selIdxs: number[], year: number, month: number) {
  const current = selIdxs.reduce((s, si) => s + sellerPeriodSales(si, year, month, "month", 1), 0);
  const target  = selIdxs.reduce((s, si) => s + sellerPeriodTarget(si, year, month, "month"), 0);
  return target > 0 ? Math.min(Math.round((current / target) * 100), 130) : 80;
}


// ─────────────────────────────────────────
// Counting animation hook
// ─────────────────────────────────────────
function useCountUp(target: number, duration = 900) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    fromRef.current = 0;
    startRef.current = null;

    const step = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(fromRef.current + (target - fromRef.current) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return current;
}

// Parse formatted value string → raw number + suffix
function parseFormattedValue(val: string): { num: number; suffix: string; prefix: string } {
  const prefix = val.startsWith("+") || val.startsWith("-") ? val[0] : "";
  const clean = val.replace(/^[+-]/, "");
  if (clean.endsWith("M")) return { num: parseFloat(clean) * 1_000_000, suffix: "M", prefix };
  if (clean.endsWith("K")) return { num: parseFloat(clean) * 1_000, suffix: "K", prefix };
  if (clean.endsWith("%")) return { num: parseFloat(clean), suffix: "%", prefix };
  const n = parseFloat(clean.replace(/,/g, ""));
  return { num: isNaN(n) ? 0 : n, suffix: "", prefix };
}

function formatAnimated(n: number, suffix: string, prefix: string): string {
  if (suffix === "M") return prefix + (n / 1_000_000).toFixed(2) + "M";
  if (suffix === "K") return prefix + (n / 1_000).toFixed(0) + "K";
  if (suffix === "%") return prefix + Math.round(n) + "%";
  return prefix + Math.round(n).toLocaleString("en-US");
}

// ─────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────
function KpiCard({ title, value, sub, icon: Icon, color = "#4D8AFF", progress }: {
  title: string; value: string; sub?: string; icon: React.ElementType; color?: string; progress?: number;
}) {
  const { num, suffix, prefix } = parseFormattedValue(value);
  const animated = useCountUp(num);
  const displayValue = formatAnimated(animated, suffix, prefix);

  return (
    <div className="bg-white rounded-xl border border-neutral-100 shadow-sm p-3 sm:p-4 flex flex-col gap-1.5 hover:shadow-md transition-shadow" style={{ borderRadius: 12 }}>
      <div className="flex items-center justify-between gap-1">
        <span className="text-[11px] sm:text-[13px] text-neutral-500 font-semibold leading-tight">{title}</span>
        <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shrink-0 bg-neutral-100" style={{ borderRadius: 8 }}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700" />
        </div>
      </div>
      <div className="text-lg sm:text-2xl font-bold text-neutral-800 tracking-tight tabular-nums">{displayValue}</div>
      {sub && <div className="text-[10px] sm:text-xs text-neutral-500 font-medium">{sub}</div>}
      {progress !== undefined && (
        <div className="h-1 sm:h-1.5 rounded-full bg-neutral-100 overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }} />
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Drill-down hierarchy types
// ─────────────────────────────────────────
type DrillLevel = "team" | "regions" | "areas" | "supervisors" | "showrooms" | "sellers" | "days";

interface DrillCrumb {
  level: DrillLevel;
  id: string;
  name: string;
}

interface DrillRow {
  id: string;
  name: string;
  regionName?: string;
  areaName?: string;
  supervisorName?: string;
  showroomName?: string;
  sales: number;
  target: number;
  prevSales: number;
  invoices: number;
  pieces: number;
  customers: number;
  avgInvoice: number;
  avgPiece: number;
  nextLevel: DrillLevel;
}

interface DrillTableProps {
  title: string;
  rowCount: number;
  rows: DrillRow[];
  onDrill: (id: string, name: string) => void;
  totalSales: number; totalTarget: number; totalPrevSales: number;
  totalInvoices: number; totalPieces: number; totalCustomers: number;
  achievementPct: number;
  sortKey: string; sortDir: "asc" | "desc";
  toggleSort: (key: string) => void;
  tablePage: number; setTablePage: (fn: (p: number) => number) => void; totalPages: number;
  nameLabel?: string; drillLabel?: string;
  filterType?: FilterType;
}

function DrillTable({
  title, rowCount, rows, onDrill,
  totalSales, totalTarget, totalPrevSales, totalInvoices, totalPieces, totalCustomers, achievementPct,
  sortKey, sortDir, toggleSort, tablePage, setTablePage, totalPages,
  nameLabel = "الاسم", drillLabel = "تفاصيل",
  filterType = "team",
  mobileTableMode,
  setMobileTableMode,
}: DrillTableProps & { mobileTableMode?: "default" | "pinned" | "cards" | "single", setMobileTableMode?: (mode: "default" | "pinned" | "cards" | "single") => void }) {
  const sorted = [...rows].sort((a, b) => {
    const aVal = (a as any)[sortKey] ?? 0;
    const bVal = (b as any)[sortKey] ?? 0;
    return sortDir === "desc" ? bVal - aVal : aVal - bVal;
  });
  const PAGE_SIZE = 40;
  const start = (tablePage - 1) * PAGE_SIZE;
  const paged = sorted.slice(start, start + PAGE_SIZE);
  const pages = Math.ceil(sorted.length / PAGE_SIZE);

  // Detect which hierarchy columns have data
  const hasRegion    = rows.some(r => r.regionName);
  const hasArea      = rows.some(r => r.areaName);
  const hasSupervisor = rows.some(r => r.supervisorName);
  const hasShowroom  = rows.some(r => r.showroomName);

  const hierarchyCols = [
    ...(hasRegion     ? [{ key: "regionName",     label: "الإقليم" }]     : []),
    ...(hasArea       ? [{ key: "areaName",       label: "المنطقة" }]     : []),
    ...(hasSupervisor ? [{ key: "supervisorName", label: "المشرف" }] : []),
    ...(hasShowroom   ? [{ key: "showroomName",   label: "المعرض" }]     : []),
  ];

  // Columns vary by tab
  const teamCols = [
    { key: "name", label: nameLabel },
    ...hierarchyCols,
    { key: "sales", label: "المبيعات" },
    { key: "target", label: "الهدف" },
    { key: "invoices", label: "الفواتير" },
    { key: "pieces", label: "القطع" },
    { key: "prevSales", label: "مبيعات سابق" },
  ];
  const showroomCols = [
    { key: "name", label: nameLabel },
    ...hierarchyCols,
    { key: "sales", label: "المبيعات" },
    { key: "target", label: "الهدف" },
    { key: "invoices", label: "الفواتير" },
    { key: "pieces", label: "القطع" },
    { key: "customers", label: "العملاء" },
    { key: "prevSales", label: "مبيعات سابق" },
  ];
  const sellerCols = [
    { key: "name", label: nameLabel },
    ...hierarchyCols,
    { key: "sales", label: "المبيعات" },
    { key: "target", label: "الهدف" },
    { key: "invoices", label: "الفواتير" },
    { key: "avgInvoice", label: "م. الفاتورة" },
    { key: "pieces", label: "القطع" },
    { key: "avgPiece", label: "م. القطع" },
    { key: "prevSales", label: "مبيعات سابق" },
  ];
  const activeCols = filterType === "sellers" ? sellerCols : filterType === "showrooms" ? showroomCols : teamCols;

  const totalAvgInvoice = totalInvoices > 0 ? Math.round(totalSales / totalInvoices) : 0;
  const totalAvgPiece = totalInvoices > 0 ? Math.round(totalPieces / totalInvoices) : 0;

  function renderCell(row: DrillRow, key: string) {
    if (key === "name") return (
      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-[#B21063] whitespace-nowrap hover:underline">{row.name}</span>
        <ChevronLeft className="w-3.5 h-3.5 text-neutral-300 shrink-0" />
      </div>
    );
    if (key === "regionName") return <span className="text-neutral-500 text-[11px] whitespace-nowrap">{row.regionName ?? "—"}</span>;
    if (key === "areaName") return <span className="text-neutral-500 text-[11px] whitespace-nowrap">{row.areaName ?? "—"}</span>;
    if (key === "supervisorName") return <span className="text-neutral-500 text-[11px] whitespace-nowrap">{row.supervisorName ?? "—"}</span>;
    if (key === "showroomName") return <span className="text-neutral-500 text-[11px] whitespace-nowrap">{row.showroomName ?? "—"}</span>;
    if (key === "sales") return <span className="text-neutral-700 font-semibold tabular-nums">{formatFull(Math.round(row.sales))}</span>;
    if (key === "target") return <span className="text-neutral-500 tabular-nums">{formatFull(row.target)}</span>;
    if (key === "invoices") return <span className="text-neutral-600 tabular-nums">{formatFull(row.invoices)}</span>;
    if (key === "avgInvoice") return <span className="text-neutral-600 tabular-nums">{formatFull(row.avgInvoice)}</span>;
    if (key === "pieces") return <span className="text-neutral-600 tabular-nums">{formatFull(row.pieces)}</span>;
    if (key === "avgPiece") return <span className="text-neutral-600 tabular-nums">{row.avgPiece}</span>;
    if (key === "customers") return <span className="text-neutral-600 tabular-nums">{row.customers}</span>;
    if (key === "prevSales") return <span className="text-neutral-500 tabular-nums">{formatFull(Math.round(row.prevSales))}</span>;
    return null;
  }

  function renderFooterCell(key: string) {
    if (key === "name") return <span className="text-neutral-800 font-bold">الإجمالي</span>;
    if (["regionName","areaName","supervisorName","showroomName"].includes(key)) return null;
    if (key === "sales") return <span className="text-neutral-800 tabular-nums">{formatFull(Math.round(totalSales))}</span>;
    if (key === "target") return <span className="text-neutral-700 tabular-nums">{formatFull(totalTarget)}</span>;
    if (key === "invoices") return <span className="text-neutral-700 tabular-nums">{formatFull(totalInvoices)}</span>;
    if (key === "avgInvoice") return <span className="text-neutral-700 tabular-nums">{formatFull(totalAvgInvoice)}</span>;
    if (key === "pieces") return <span className="text-neutral-700 tabular-nums">{formatFull(totalPieces)}</span>;
    if (key === "avgPiece") return <span className="text-neutral-700 tabular-nums">{totalAvgPiece}</span>;
    if (key === "customers") return <span className="text-neutral-700 tabular-nums">{totalCustomers}</span>;
    if (key === "prevSales") return <span className="text-neutral-700 tabular-nums">{formatFull(Math.round(totalPrevSales))}</span>;
    return null;
  }

  // Mobile view modes
  const renderMobilePinnedView = () => {
    const mainCol = hierarchyCols[0] || { key: "name", label: nameLabel };
    const otherCols = activeCols.filter(col => col.key !== mainCol.key);
    
    return (
      <div className="block sm:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]" style={{ minWidth: 320 }}>
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="px-2 py-2 text-right font-bold text-neutral-600 sticky right-0 bg-white z-10 border-l border-neutral-200">
                  <div className="flex items-center gap-1">
                    <Pin className="w-3 h-3 text-[#B21063]" />
                    <span>{mainCol.label}</span>
                  </div>
                </th>
                {otherCols.map(col => (
                  <th key={col.key} onClick={() => toggleSort(col.key)}
                    className="px-2 py-2 text-right font-bold text-neutral-600 cursor-pointer hover:bg-neutral-100 transition-colors select-none whitespace-nowrap">
                    <div className="flex items-center justify-between gap-1 w-full">
                      <ArrowUpDown className={cn("w-2 h-2.5 order-last", sortKey === col.key ? "text-[#B21063]" : "text-neutral-300")} />
                      <span>{col.label}</span>
                    </div>
                  </th>
                ))}
                <th className="px-2 py-2 text-right font-bold text-neutral-600">تحقيق</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((row, idx) => {
                const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
                return (
                  <tr key={row.id} className={cn("border-b border-neutral-50 hover:bg-blue-50/30 transition-colors cursor-pointer", idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30")}
                    onClick={() => onDrill(row.id, row.name)}>
                    <td className="px-2 py-2 sticky right-0 bg-white z-10 border-l border-neutral-200 font-medium text-neutral-800">
                      {renderCell(row, mainCol.key)}
                    </td>
                    {otherCols.map(col => (
                      <td key={col.key} className="px-2 py-2 whitespace-nowrap">
                        {renderCell(row, col.key)}
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-lg", pctBg(pct))}>{pct}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderMobileCardsView = () => {
    return (
      <div className="block sm:hidden p-2 space-y-2">
        {paged.map((row, idx) => {
          const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
          return (
            <div key={row.id} className={cn("bg-white border border-neutral-100 rounded-xl p-3 hover:shadow-md transition-shadow cursor-pointer", idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30")}
              onClick={() => onDrill(row.id, row.name)}>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-neutral-800 truncate flex-1">{row.name}</h4>
                <span className={cn("text-xs font-bold px-2 py-1 rounded-lg mr-2", pctBg(pct))}>{pct}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-neutral-500">المبيعات:</span>
                  <span className="font-semibold">{formatFull(Math.round(row.sales))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">الهدف:</span>
                  <span className="font-semibold">{formatFull(row.target)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">الفواتير:</span>
                  <span className="font-semibold">{formatFull(row.invoices)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">العملاء:</span>
                  <span className="font-semibold">{row.customers}</span>
                </div>
              </div>
              {hierarchyCols.length > 0 && (
                <div className="mt-2 pt-2 border-t border-neutral-100 flex flex-wrap gap-2">
                  {hierarchyCols.map(col => (
                    <span key={col.key} className="text-[10px] text-neutral-500 bg-neutral-50 px-2 py-1 rounded">
                      {renderCell(row, col.key)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMobileSingleView = () => {
    return (
      <div className="block sm:hidden space-y-3">
        {paged.map((row, idx) => {
          const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
          return (
            <div key={row.id} className={cn("bg-white border border-neutral-100 rounded-xl overflow-hidden", idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30")}>
              <div className="px-3 py-2 bg-neutral-50 border-b border-neutral-100 cursor-pointer hover:bg-neutral-100 transition-colors"
                onClick={() => onDrill(row.id, row.name)}>
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-800 truncate flex-1">{row.name}</h4>
                  <span className={cn("text-xs font-bold px-2 py-1 rounded-lg mr-2", pctBg(pct))}>{pct}%</span>
                  <ChevronLeft className="w-4 h-4 text-neutral-400" />
                </div>
              </div>
              <div className="divide-y divide-neutral-100">
                {activeCols.map(col => (
                  <div key={col.key} className="px-3 py-2 flex justify-between items-center">
                    <span className="text-xs font-medium text-neutral-600">{col.label}</span>
                    <span className="text-xs text-neutral-800">{renderCell(row, col.key)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
        <h3 className="text-sm font-bold text-neutral-800">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium">{rowCount} سجل</span>
          {/* Mobile view mode selector */}
          {setMobileTableMode && (
            <div className="sm:hidden flex items-center gap-1 bg-neutral-100 rounded-lg p-0.5">
              {[
                ["default", "افتراضي", Table],
                ["pinned", "مثبت", Pin],
                ["cards", "بطاقات", LayoutGrid],
                ["single", "مفرد", Rows]
              ].map(([mode, label, Icon]) => (
                <button key={mode} onClick={() => setMobileTableMode(mode as "default" | "pinned" | "cards" | "single")}
                  className={cn("px-1.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1",
                    mobileTableMode === mode ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700")}
                  title={label}>
                  <Icon className="w-3 h-3" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Desktop view - always show default table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-[11px] sm:text-[13px]" style={{ minWidth: 600 }}>
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              {activeCols.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 cursor-pointer hover:bg-neutral-100 transition-colors select-none whitespace-nowrap text-xs sm:text-sm">
                  <div className="flex items-center justify-between gap-1 w-full">
                    <ArrowUpDown className={cn("w-2 h-2.5 sm:w-2.5 sm:h-2.5 order-last", sortKey === col.key ? "text-[#B21063]" : "text-neutral-300")} />
                    <span>{col.label}</span>
                  </div>
                </th>
              ))}
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 whitespace-nowrap text-xs sm:text-sm">تحقيق</th>
              <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 whitespace-nowrap text-xs sm:text-sm">{drillLabel}</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((row, idx) => {
              const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
              return (
                <tr key={row.id} className={cn("border-b border-neutral-50 hover:bg-blue-50/30 transition-colors cursor-pointer", idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30")}
                  onClick={() => onDrill(row.id, row.name)}>
                  {activeCols.map(col => (
                    <td key={col.key} className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                      {renderCell(row, col.key)}
                    </td>
                  ))}
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                    <span className={cn("text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg", pctBg(pct))}>{pct}%</span>
                  </td>
                  <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                    <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">انقر للعرض</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="bg-neutral-50 border-t-2 border-neutral-200 font-bold">
              {activeCols.map(col => (
                <td key={col.key} className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap text-xs sm:text-sm">
                  {renderFooterCell(col.key)}
                </td>
              ))}
              <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg" style={{ backgroundColor: "#00C9A7", color: "white" }}>
                  {achievementPct}%
                </span>
              </td>
              <td className="px-2 sm:px-3 py-2 sm:py-3 whitespace-nowrap">
                <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium">—</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Mobile views - only show on mobile */}
      <div className="sm:hidden">
        {mobileTableMode === "default" && (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]" style={{ minWidth: 600 }}>
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {activeCols.map(col => (
                    <th key={col.key} onClick={() => toggleSort(col.key)}
                      className="px-2 py-2 text-right font-bold text-neutral-600 cursor-pointer hover:bg-neutral-100 transition-colors select-none whitespace-nowrap">
                      <div className="flex items-center justify-between gap-1 w-full">
                        <ArrowUpDown className={cn("w-2 h-2.5 order-last", sortKey === col.key ? "text-[#B21063]" : "text-neutral-300")} />
                        <span>{col.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-2 py-2 text-right font-bold text-neutral-600">تحقيق</th>
                  <th className="px-2 py-2 text-right font-bold text-neutral-600">{drillLabel}</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((row, idx) => {
                  const pct = row.target > 0 ? Math.round((row.sales / row.target) * 100) : 0;
                  return (
                    <tr key={row.id} className={cn("border-b border-neutral-50 hover:bg-blue-50/30 transition-colors cursor-pointer", idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30")}
                      onClick={() => onDrill(row.id, row.name)}>
                      {activeCols.map(col => (
                        <td key={col.key} className="px-2 py-2 whitespace-nowrap">
                          {renderCell(row, col.key)}
                        </td>
                      ))}
                      <td className="px-2 py-2">
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-lg", pctBg(pct))}>{pct}%</span>
                      </td>
                      <td className="px-2 py-2">
                        <span className="text-[10px] text-neutral-400 font-medium">انقر للعرض</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {mobileTableMode === "pinned" && renderMobilePinnedView()}
        {mobileTableMode === "cards" && renderMobileCardsView()}
        {mobileTableMode === "single" && renderMobileSingleView()}
      </div>
      
      {pages > 1 && (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 border-t border-neutral-100">
          <button onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage === 1}
            className="flex items-center gap-1 text-xs sm:text-sm text-neutral-600 disabled:opacity-30 hover:text-neutral-800 transition-colors font-medium">
            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> السابق
          </button>
          <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">صفحة {tablePage} من {pages}</span>
          <button onClick={() => setTablePage(p => Math.min(pages, p + 1))} disabled={tablePage === pages}
            className="flex items-center gap-1 text-xs sm:text-sm text-neutral-600 disabled:opacity-30 hover:text-neutral-800 transition-colors font-medium">
            التالي <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}
    </div>
  );
}


function TeamSummary({ data }: { data: { label: string; value: number; pct: number }[] }) {
  const total = data.length || 1;
  const tiers = [
    { label: "ممتاز", min: 100, max: Infinity, color: "#00C9A7", bg: "bg-emerald-50",  text: "text-emerald-700" },
    { label: "جيد",   min: 80,  max: 99,       color: "#4D8AFF", bg: "bg-blue-50",     text: "text-blue-700"   },
    { label: "متوسط", min: 60,  max: 79,       color: "#F9A825", bg: "bg-amber-50",    text: "text-amber-700"  },
    { label: "ضعيف",  min: 0,   max: 59,       color: "#E91E8C", bg: "bg-rose-50",     text: "text-rose-700"   },
  ];
  const buckets = tiers.map(t => ({ ...t, count: data.filter(d => d.pct >= t.min && d.pct <= t.max).length }));
  const top3 = [...data].sort((a, b) => b.pct - a.pct).slice(0, 3);

  return (
    <div className="space-y-3">
      {/* Stacked distribution bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden" style={{ gap: 2 }}>
        {buckets.map((b, i) => (
          <div key={i} title={`${b.label}: ${b.count}`}
            style={{ width: `${(b.count / total) * 100}%`, backgroundColor: b.color, minWidth: b.count ? 4 : 0 }}
            className="h-full transition-all duration-500" />
        ))}
      </div>

      {/* Tier rows */}
      <div className="space-y-2">
        {buckets.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
            <span className="text-[12px] font-semibold text-neutral-600 w-10 shrink-0">{b.label}</span>
            <div className="flex-1 bg-neutral-100 rounded-full h-1.5 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(b.count / total) * 100}%`, backgroundColor: b.color }} />
            </div>
            <span className={cn("text-[11px] font-bold min-w-[28px] text-center rounded-md px-1.5 py-0.5", b.bg, b.text)}>
              {b.count}
            </span>
            <span className="text-[10px] text-neutral-400 w-7 text-right shrink-0">
              {Math.round((b.count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>

      {/* Top performers */}
      {top3.length > 0 && (
        <div className="border-t border-neutral-100 pt-2.5 space-y-1.5">
          <p className="text-[10px] font-semibold text-neutral-400 mb-1">الأعلى أداءً</p>
          {top3.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-neutral-300 w-3 shrink-0">{i + 1}</span>
              <span className="text-[11px] text-neutral-700 truncate flex-1">
                {d.label.split(" ").slice(0, 2).join(" ")}
              </span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: pctColor(d.pct) }}>{d.pct}%</span>
              <span className="text-[10px] text-neutral-400 tabular-nums">{formatNum(d.value)}</span>
            </div>
          ))}
        </div>
      )}

      <p className="text-[10px] text-neutral-400 text-center pt-0.5">{total.toLocaleString()} عنصر</p>
    </div>
  );
}

function AreaChart({ data, height = 120 }: { data: { day: number | string; current: number; prev: number }[]; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data.flatMap(d => [d.current, d.prev]), 1);
  const W = data.length * 22;
  const H = height;

  const polyline = (key: "current" | "prev") =>
    data.map((d, i) => `${i === 0 ? "M" : "L"} ${i * 22 + 11} ${H - 10 - ((d[key] / max) * (H - 20))}`).join(" ");

  const area = (key: "current" | "prev") =>
    polyline(key) + ` L ${(data.length - 1) * 22 + 11} ${H - 10} L 11 ${H - 10} Z`;

  const xLabels = data.filter((_, i) => i === 0 || i === data.length - 1 || i % Math.ceil(data.length / 5) === 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: W, height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="gc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00C9A7" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F9A825" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#F9A825" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <line key={t} x1="0" y1={H - 10 - t * (H - 20)} x2={W} y2={H - 10 - t * (H - 20)}
          stroke="#f0f0f0" strokeWidth="0.6" />
      ))}
      <path d={area("prev")} fill="url(#gp)" />
      <path d={polyline("prev")} fill="none" stroke="#F9A825" strokeWidth="1.2" strokeDasharray="4 2" strokeLinejoin="round" />
      <path d={area("current")} fill="url(#gc)" />
      <path d={polyline("current")} fill="none" stroke="#00C9A7" strokeWidth="1.8" strokeLinejoin="round" />
      {xLabels.map((d, i) => {
        const idx = data.indexOf(d);
        return (
          <text key={i} x={idx * 22 + 11} y={H - 1} textAnchor="middle" fontSize="6" fill="#9ca3af">
            {d.day}
          </text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────
// Arabic Date Range Picker
// ─────────────────────────────────────────
const DAYS_FULL_AR = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function parseDateStr(s: string): [number, number, number] {
  const [y, m, d] = s.split("-").map(Number);
  return [y, m - 1, d];
}
function formatArabicDate(s: string) {
  const [y, m, d] = parseDateStr(s);
  const date = new Date(y, m, d);
  return `${DAYS_FULL_AR[date.getDay()]} ${d} ${MONTHS_AR[m]}`;
}

interface DateRangePickerProps {
  dateFrom: string;
  dateTo: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}

function DateRangePicker({ dateFrom, dateTo, onFromChange, onToChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">("from");
  const containerRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  // Left calendar = calMonth, Right calendar = calMonth - 1 (RTL: right is earlier)
  const rightMonth = calMonth === 0 ? 11 : calMonth - 1;
  const rightYear  = calMonth === 0 ? calYear - 1 : calYear;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = containerRef.current?.contains(target);
      const inPanel = panelRef.current?.contains(target);
      if (!inTrigger && !inPanel) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [])

  function openDropdown() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setOpen(v => !v);
    setSelecting("from");
  }

  function handleDayClick(dateStr: string) {
    if (selecting === "from") {
      onFromChange(dateStr);
      if (dateTo && dateStr > dateTo) onToChange(dateStr);
      setSelecting("to");
    } else {
      if (dateStr < dateFrom) {
        onFromChange(dateStr);
        setSelecting("to");
      } else {
        onToChange(dateStr);
        setSelecting("from");
        setOpen(false);
      }
    }
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11); }
    else setCalMonth(m => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0); }
    else setCalMonth(m => m + 1);
  }

  function renderMonth(year: number, month: number, isLeft: boolean) {
    const days = getDaysInMonth(year, month);
    const firstDow = new Date(year, month, 1).getDay(); // 0=Sun
    const cells: (number | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= days; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <div className="flex-1 min-w-[200px] sm:min-w-[240px]">
        {/* Month header */}
        <div className="flex items-center justify-between px-2 sm:px-3 pb-2 sm:pb-3">
          {isLeft ? (
            <button onClick={nextMonth} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500" />
            </button>
          ) : <div className="w-6 sm:w-7" />}
          <span className="text-xs sm:text-sm font-bold text-neutral-800">{MONTHS_AR[month]} {year}</span>
          {!isLeft ? (
            <button onClick={prevMonth} className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors">
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-500" />
            </button>
          ) : <div className="w-6 sm:w-7" />}
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_FULL_AR.map((d, i) => (
            <div key={i} className={cn(
              "text-center text-[9px] sm:text-[10px] font-semibold py-0.5 sm:py-1",
              i === 5 ? "text-[#2563EB]" : i === 6 ? "text-[#2563EB]" : "text-neutral-500"
            )}>
              {d.slice(0, d === "الاثنين" || d === "الثلاثاء" || d === "الأربعاء" || d === "الخميس" ? 6 : 4)}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-y-0.5">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const dateStr = toDateStr(year, month, d);
            const isFrom = dateStr === dateFrom;
            const isTo = dateStr === dateTo;
            const endDate = hoveredDate && selecting === "to" ? hoveredDate : dateTo;
            const inRange = dateStr > dateFrom && dateStr < endDate;
            const isRangeStart = isFrom;
            const isRangeEnd = isTo || (selecting === "to" && hoveredDate === dateStr);
            const isFriSat = new Date(year, month, d).getDay() === 5 || new Date(year, month, d).getDay() === 6;

            return (
              <div
                key={i}
                className={cn(
                  "relative flex items-center justify-center h-6 sm:h-8 cursor-pointer select-none transition-colors",
                  inRange ? "bg-blue-50" : "",
                )}
                onMouseEnter={() => setHoveredDate(dateStr)}
                onMouseLeave={() => setHoveredDate(null)}
                onClick={() => handleDayClick(dateStr)}
              >
                <span className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full text-[11px] sm:text-[13px] font-medium transition-colors z-10 relative",
                  (isFrom || isTo) ? "bg-[#2563EB] text-white font-bold" : "",
                  !isFrom && !isTo && inRange ? "text-neutral-700" : "",
                  !isFrom && !isTo && !inRange && isFriSat ? "text-[#2563EB]" : "",
                  !isFrom && !isTo && !inRange && !isFriSat ? "text-neutral-700" : ""
                )}>
                  {d}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const displayFrom = dateFrom ? formatArabicDate(dateFrom) : "من تاريخ";
  const displayTo   = dateTo   ? formatArabicDate(dateTo)   : "إلى تاريخ";

  const dropdown = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          ref={panelRef}
          className="bg-white rounded-2xl border border-neutral-200 shadow-xl p-3 sm:p-4"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            right: dropdownPos.right,
            minWidth: "min(520px, calc(100vw - 2rem))",
            maxWidth: "calc(100vw - 2rem)",
            zIndex: 9999,
          }}
          dir="rtl"
        >
          {/* Header showing selected range */}
          <div className="flex items-center gap-2 sm:gap-3 border-b border-neutral-100 pb-2 sm:pb-3 mb-3 sm:mb-4">
            <button
              onClick={() => setSelecting("from")}
              className={cn(
                "flex-1 text-center py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl text-[10px] sm:text-[12px] font-bold border-2 transition-colors",
                selecting === "from" ? "border-[#2563EB] text-[#2563EB] bg-blue-50" : "border-neutral-200 text-neutral-600"
              )}
            >
              {displayFrom}
            </button>
            <span className="text-neutral-400 text-xs sm:text-sm font-bold">—</span>
            <button
              onClick={() => setSelecting("to")}
              className={cn(
                "flex-1 text-center py-1 sm:py-1.5 px-2 sm:px-3 rounded-xl text-[10px] sm:text-[12px] font-bold border-2 transition-colors",
                selecting === "to" ? "border-[#2563EB] text-[#2563EB] bg-blue-50" : "border-neutral-200 text-neutral-600"
              )}
            >
              {displayTo}
            </button>
          </div>

          {/* Dual month calendars — RTL: right=earlier, left=later */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 divide-y sm:divide-y-0 sm:divide-x divide-x-reverse divide-neutral-100">
            {renderMonth(calYear, calMonth, true)}
            <div className="hidden sm:block w-px bg-neutral-100 self-stretch mx-1" />
            {renderMonth(rightYear, rightMonth, false)}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div ref={containerRef} className="relative shrink-0" dir="rtl">
      {/* Trigger button */}
      <button
        ref={btnRef}
        onClick={openDropdown}
        className="flex items-center gap-1.5 sm:gap-2 border border-neutral-200 rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 bg-white hover:bg-neutral-50 transition-colors shadow-sm"
      >
        <Calendar className="w-3 h-3.5 sm:w-3.5 sm:h-3.5 text-neutral-400 shrink-0" />
        <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-700 whitespace-nowrap">
          {displayFrom}
        </span>
        <span className="text-[9px] sm:text-[10px] text-neutral-400 mx-0.5 sm:mx-1">—</span>
        <span className={cn("text-[10px] sm:text-[11px] font-semibold whitespace-nowrap", selecting === "to" && open ? "text-[#2563EB]" : "text-neutral-700")}>
          {displayTo}
        </span>
      </button>

      {createPortal(dropdown, document.body)}
    </div>
  );
}

// ─────────────────────────────────────────
// MultiSelectDropdown
// ─────────────────────────────────────────
interface MultiSelectOption { id: string; name: string; }
interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: Set<string>;
  onChange: (next: Set<string>) => void;
  placeholder: string;
  activeColor?: string;
}
function MultiSelectDropdown({ options, selected, onChange, placeholder, activeColor = "#B21063" }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function close(e: MouseEvent) {
      const target = e.target as Node;
      const inTrigger = ref.current?.contains(target);
      const inPanel = panelRef.current?.contains(target);
      if (!inTrigger && !inPanel) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const filtered = options.filter(o => o.name.includes(search));
  const hasSelection = selected.size > 0;

  function toggle(id: string) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    onChange(next);
  }

  function toggleAll() {
    if (selected.size === options.length) onChange(new Set());
    else onChange(new Set(options.map(o => o.id)));
  }

  const label = hasSelection
    ? selected.size === 1
      ? options.find(o => o.id === [...selected][0])?.name ?? placeholder
      : `${selected.size} محدد`
    : placeholder;

  return (
    <div ref={ref} className="relative shrink-0" dir="rtl">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          "flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] border rounded-xl px-2 sm:px-2.5 py-1 sm:py-1.5 bg-white focus:outline-none cursor-pointer font-medium transition-colors whitespace-nowrap",
          hasSelection ? "border-[#B21063] text-[#B21063]" : "border-neutral-200 text-neutral-700"
        )}
      >
        <span className="max-w-[80px] sm:max-w-[110px] truncate">{label}</span>
        <ChevronDown className={cn("w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 transition-transform", open ? "rotate-180" : "", hasSelection ? "text-[#B21063]" : "text-neutral-400")} />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: (ref.current?.getBoundingClientRect().bottom ?? 0) + 4,
            right: window.innerWidth - (ref.current?.getBoundingClientRect().right ?? 0),
            zIndex: 9999,
            width: "min(220px, calc(100vw - 2rem))",
            maxWidth: "calc(100vw - 2rem)",
          }}
          className="bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden"
          dir="rtl"
        >
          <div className="p-2 border-b border-neutral-100">
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث..."
              className="w-full text-[10px] sm:text-[11px] border border-neutral-200 rounded-lg px-2 sm:px-2.5 py-1 sm:py-1.5 focus:outline-none focus:ring-1 focus:ring-[#B21063]/30"
            />
          </div>
          <div className="p-1 border-b border-neutral-100">
            <button
              onClick={toggleAll}
              className="w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-semibold hover:bg-neutral-50 transition-colors text-neutral-600"
            >
              <span className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                selected.size === options.length ? "bg-[#B21063] border-[#B21063]" : "border-neutral-300"
              )}>
                {selected.size === options.length && <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              {selected.size === options.length ? "إلغاء تحديد الكل" : "تحديد الكل"}
            </button>
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length === 0 && <p className="text-center text-[10px] sm:text-[11px] text-neutral-400 py-2 sm:py-3">لا توجد نتائج</p>}
            {filtered.map(opt => (
              <button
                key={opt.id}
                onClick={() => toggle(opt.id)}
                className="w-full flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[10px] sm:text-[11px] hover:bg-neutral-50 transition-colors text-right"
              >
                <span className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors",
                  selected.has(opt.id) ? "bg-[#B21063] border-[#B21063]" : "border-neutral-300"
                )}>
                  {selected.has(opt.id) && <Check className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" />}
                </span>
                <span className="truncate text-neutral-700 font-medium">{opt.name}</span>
              </button>
            ))}
          </div>
          {hasSelection && (
            <div className="p-2 border-t border-neutral-100">
              <button onClick={() => { onChange(new Set()); setOpen(false); }}
                className="w-full text-[10px] sm:text-[11px] text-neutral-400 hover:text-red-500 transition-colors font-medium">
                مسح التحديد
              </button>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
type Period = "day" | "month" | "year";
type FilterType = "team" | "areas" | "supervisors" | "showrooms" | "sellers";
type ViewMode = "analytics" | "table";

interface Props { onBack?: () => void; }

export default function SalesPerformancePage({ onBack }: Props) {
  const today = new Date();

  // Period
  const [period, setPeriod] = useState<Period>("month");
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number>(today.getDate());

  // Date range (for table/detail view)
  const firstOfMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const [dateFrom, setDateFrom] = useState<string>(firstOfMonth);
  const [dateTo, setDateTo] = useState<string>(todayStr);

  // Filter
  const [filterType, setFilterType] = useState<FilterType>("team");
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [selectedAreas, setSelectedAreas] = useState<Set<string>>(new Set());
  const [selectedSupervisors, setSelectedSupervisors] = useState<Set<string>>(new Set());
  const [selectedShowrooms, setSelectedShowrooms] = useState<Set<string>>(new Set());
  const [selectedSellers, setSelectedSellers] = useState<Set<string>>(new Set());

  // Mobile table view mode
  const [mobileTableMode, setMobileTableMode] = useState<"default" | "pinned" | "cards" | "single">("default");

  function resetTableFilters() {
    setSelectedRegions(new Set());
    setSelectedAreas(new Set());
    setSelectedSupervisors(new Set());
    setSelectedShowrooms(new Set());
    setSelectedSellers(new Set());
  }

  const hasActiveTableFilter =
    selectedRegions.size > 0 || selectedAreas.size > 0 ||
    selectedSupervisors.size > 0 || selectedShowrooms.size > 0 || selectedSellers.size > 0;

  // Drill-down navigation
  // drillPath[0] is always team root; each subsequent item is a clicked entity
  const [drillPath, setDrillPath] = useState<DrillCrumb[]>([]);

  // Current drill level and context id
  const currentDrillLevel: DrillLevel = drillPath.length === 0 ? "regions"
    : drillPath[drillPath.length - 1].level === "regions" ? "areas"
    : drillPath[drillPath.length - 1].level === "areas" ? "supervisors"
    : drillPath[drillPath.length - 1].level === "supervisors" ? "showrooms"
    : drillPath[drillPath.length - 1].level === "showrooms" ? "sellers"
    : drillPath[drillPath.length - 1].level === "sellers" ? "days"
    : "days";

  const currentDrillId = drillPath.length > 0 ? drillPath[drillPath.length - 1].id : null;

  function drillInto(level: DrillLevel, id: string, name: string) {
    setDrillPath(prev => [...prev, { level, id, name }]);
    setViewMode("table");
  }

  function drillTo(index: number) {
    setDrillPath(prev => prev.slice(0, index));
    setViewMode("table");
  }

  // View
  const [viewMode, setViewMode] = useState<ViewMode>("analytics");

  // Table sorting
  const [sortKey, setSortKey] = useState<string>("sales");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [tablePage, setTablePage] = useState(1);
  const TABLE_PAGE_SIZE = 40;

  // Scroll collapse (table view only)
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    lastScrollY.current = el.scrollTop;
    const handleScroll = () => {
      const currentY = el.scrollTop;
      if (currentY > 60 && currentY > lastScrollY.current) {
        setHeaderCollapsed(true);
      } else if (currentY < lastScrollY.current - 5) {
        setHeaderCollapsed(false);
      }
      lastScrollY.current = currentY;
    };
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Calendar
  const daysInMonth = getDaysInMonth(year, month);

  // Filtered sellers — respects drill-down path
  const filteredSellers = useMemo(() => {
    // If drillPath has a context, filter by drill context instead of filter tabs
    if (drillPath.length > 0) {
      const last = drillPath[drillPath.length - 1];
      if (last.level === "regions") return SELLERS.filter(s => s.regionId === last.id);
      if (last.level === "areas") return SELLERS.filter(s => s.areaId === last.id);
      if (last.level === "supervisors") return SELLERS.filter(s => s.supervisorId === last.id);
      if (last.level === "showrooms") return SELLERS.filter(s => s.showroomId === last.id);
      if (last.level === "sellers") return SELLERS.filter(s => s.id === last.id);
      return SELLERS;
    }
    // Table view: cascading 5-level filter
    if (viewMode === "table") {
      return SELLERS.filter(s => {
        if (selectedRegions.size > 0 && !selectedRegions.has(s.regionId)) return false;
        if (selectedAreas.size > 0 && !selectedAreas.has(s.areaId)) return false;
        if (selectedSupervisors.size > 0 && !selectedSupervisors.has(s.supervisorId)) return false;
        if (selectedShowrooms.size > 0 && !selectedShowrooms.has(s.showroomId)) return false;
        if (selectedSellers.size > 0 && !selectedSellers.has(s.id)) return false;
        return true;
      });
    }
    return SELLERS.filter(s => {
      if (filterType === "team") return selectedRegions.size === 0 || selectedRegions.has(s.regionId);
      if (filterType === "areas") return selectedAreas.size === 0 || selectedAreas.has(s.areaId);
      if (filterType === "supervisors") return selectedSupervisors.size === 0 || selectedSupervisors.has(s.supervisorId);
      if (filterType === "showrooms") return selectedShowrooms.size === 0 || selectedShowrooms.has(s.showroomId);
      if (filterType === "sellers") return selectedSellers.size === 0 || selectedSellers.has(s.id);
      return true;
    });
  }, [filterType, selectedRegions, selectedAreas, selectedSupervisors, selectedShowrooms, selectedSellers, drillPath, viewMode]);

  const filteredIdxs = useMemo(
    () => filteredSellers.map(s => SELLERS.indexOf(s)),
    [filteredSellers]
  );

  // Dynamic KPIs — recalculate when period / month / year / day / filter changes
  const periodKpis = useMemo(() => {
    const sales     = filteredIdxs.reduce((s, si) => s + sellerPeriodSales(si, year, month, period, selectedDay), 0);
    const prevSales = filteredIdxs.reduce((s, si) => s + sellerPeriodPrevSales(si, year, month, period, selectedDay), 0);
    const target    = filteredIdxs.reduce((s, si) => s + sellerPeriodTarget(si, year, month, period), 0);
    const invoices  = filteredIdxs.reduce((s, si) => s + scalePeriodCount(SELLERS[si].invoices, year, month, period), 0);
    const pieces    = filteredIdxs.reduce((s, si) => s + scalePeriodCount(SELLERS[si].pieces, year, month, period), 0);
    const customers = filteredIdxs.reduce((s, si) => s + scalePeriodCount(SELLERS[si].customers, year, month, period), 0);
    return { sales, prevSales, target, invoices, pieces, customers };
  }, [filteredIdxs, period, year, month, selectedDay]);

  const totalSales    = periodKpis.sales;
  const totalTarget   = periodKpis.target;
  const totalPrevSales = periodKpis.prevSales;
  const totalInvoices = periodKpis.invoices;
  const totalPieces   = periodKpis.pieces;
  const totalCustomers = periodKpis.customers;
  const achievementPct = totalTarget > 0 ? Math.round((totalSales / totalTarget) * 100) : 0;
  const growthPct = totalPrevSales > 0 ? Math.round(((totalSales - totalPrevSales) / totalPrevSales) * 100) : 0;
  const avgInvoice = totalInvoices > 0 ? Math.round(totalSales / totalInvoices) : 0;

  // Calendar day pcts — based on filtered sellers
  const dayPcts = useMemo(() => genPeriodDayPcts(filteredIdxs, year, month), [filteredIdxs, year, month]);

  // Chart data — aggregated over filtered sellers
  const chartData = useMemo(() => {
    if (period === "day") return genAggDayData(filteredIdxs, year, month, selectedDay);
    if (period === "year") return genAggYearData(filteredIdxs, year);
    return genAggMonthData(filteredIdxs, year, month);
  }, [filteredIdxs, period, year, month, selectedDay]);

  // Bar chart data — grouped by filterType
  const barData = useMemo(() => {
    function groupData(items: { id: string; name: string }[], keyFn: (s: typeof SELLERS[number]) => string) {
      return items.map(item => {
        const idxs = filteredSellers.map((s, i) => keyFn(s) === item.id ? filteredIdxs[i] : -1).filter(i => i >= 0);
        const value = idxs.reduce((a, si) => a + sellerPeriodSales(si, year, month, period, selectedDay), 0);
        const tgt   = idxs.reduce((a, si) => a + sellerPeriodTarget(si, year, month, period), 0);
        return { label: item.name, value, pct: tgt > 0 ? Math.round((value / tgt) * 100) : 0 };
      }).filter(d => d.value > 0 || d.pct > 0);
    }
    if (filterType === "areas") return groupData(AREAS, s => s.areaId);
    if (filterType === "supervisors") return groupData(SUPERVISORS, s => s.supervisorId);
    if (filterType === "showrooms") return groupData(SHOWROOMS, s => s.showroomId);
    // sellers or team
    return filteredSellers.map((s, i) => {
      const si = filteredIdxs[i];
      const value = sellerPeriodSales(si, year, month, period, selectedDay);
      const tgt   = sellerPeriodTarget(si, year, month, period);
      return { label: s.name, value, pct: tgt > 0 ? Math.round((value / tgt) * 100) : 0 };
    });
  }, [filteredSellers, filteredIdxs, filterType, period, year, month, selectedDay]);

  // Table data — period-aware rows
  const tableRows = useMemo(() =>
    filteredSellers.map((s, i) => {
      const si      = filteredIdxs[i];
      const sales   = sellerPeriodSales(si, year, month, period, selectedDay);
      const target  = sellerPeriodTarget(si, year, month, period);
      const prev    = sellerPeriodPrevSales(si, year, month, period, selectedDay);
      const invoices  = scalePeriodCount(s.invoices, year, month, period);
      const pieces    = scalePeriodCount(s.pieces, year, month, period);
      const customers = scalePeriodCount(s.customers, year, month, period);
      return { ...s, sales, target, prevSales: prev, invoices, pieces, customers };
    }),
    [filteredSellers, filteredIdxs, period, year, month, selectedDay]
  );

  const tableData = useMemo(() => {
    const sorted = [...tableRows].sort((a, b) => {
      const aVal = (a as any)[sortKey] ?? 0;
      const bVal = (b as any)[sortKey] ?? 0;
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    });
    const start = (tablePage - 1) * TABLE_PAGE_SIZE;
    return { rows: sorted.slice(start, start + TABLE_PAGE_SIZE), total: sorted.length };
  }, [tableRows, sortKey, sortDir, tablePage]);

  const currentSales   = useMemo(() => chartData.reduce((s, d) => s + d.current, 0), [chartData]);
  const prevSalesChart = useMemo(() => chartData.reduce((s, d) => s + d.prev, 0), [chartData]);

  const totalPages = Math.ceil(tableData.total / TABLE_PAGE_SIZE);

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortKey(key); setSortDir("desc"); }
    setTablePage(1);
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDay(1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDay(1);
  }

  return (
    <div dir="rtl" className="w-full min-h-screen bg-neutral-0 flex flex-col">
      {/* ── Fixed Header (filters + tabs) ── */}
      <div className="sticky top-0 z-40 md:z-30 bg-white border-b border-neutral-100">
        <div className="max-w-[1400px] mx-auto px-1 sm:px-2">
          {/* Filters and view mode */}
          <div className="px-2 sm:px-6 py-2 border-b border-neutral-100">
            <div className="flex items-center gap-3 sm:gap-4 mb-1 pb-[10px] w-full overflow-x-auto">
              {viewMode === "table" ? (
                /* ── Table view: 5-level cascading filters + date range ── */
                <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto min-w-0 flex-1">
                  {/* Clear button */}
                  {hasActiveTableFilter && (
                    <button
                      onClick={resetTableFilters}
                      className="shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full hover:bg-neutral-100 transition-colors ml-1 text-neutral-400 hover:text-neutral-700"
                      title="مسح الفلاتر"
                    >
                      <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                  )}

                  {/* Date range picker */}
                  <DateRangePicker
                    dateFrom={dateFrom} dateTo={dateTo}
                    onFromChange={setDateFrom} onToChange={setDateTo}
                  />

                  {/* الإقليم */}
                  <MultiSelectDropdown
                    options={REGIONS}
                    selected={selectedRegions}
                    onChange={s => { setSelectedRegions(s); setSelectedAreas(new Set()); setSelectedSupervisors(new Set()); setSelectedShowrooms(new Set()); setSelectedSellers(new Set()); }}
                    placeholder="جميع الأقاليم"
                  />
                  {/* المنطقة */}
                  <MultiSelectDropdown
                    options={selectedRegions.size > 0 ? AREAS.filter(a => selectedRegions.has(a.regionId)) : AREAS}
                    selected={selectedAreas}
                    onChange={s => { setSelectedAreas(s); setSelectedSupervisors(new Set()); setSelectedShowrooms(new Set()); setSelectedSellers(new Set()); }}
                    placeholder="جميع المناطق"
                  />
                  {/* المشرف */}
                  <MultiSelectDropdown
                    options={SUPERVISORS.filter(sup =>
                      (selectedRegions.size === 0 || selectedRegions.has(sup.regionId)) &&
                      (selectedAreas.size === 0 || selectedAreas.has(sup.areaId))
                    )}
                    selected={selectedSupervisors}
                    onChange={s => { setSelectedSupervisors(s); setSelectedShowrooms(new Set()); setSelectedSellers(new Set()); }}
                    placeholder="جميع المشرفين"
                  />
                  {/* المعرض */}
                  <MultiSelectDropdown
                    options={SHOWROOMS.filter(sh =>
                      (selectedRegions.size === 0 || selectedRegions.has(sh.regionId)) &&
                      (selectedAreas.size === 0 || selectedAreas.has(sh.areaId)) &&
                      (selectedSupervisors.size === 0 || selectedSupervisors.has(sh.supervisorId))
                    )}
                    selected={selectedShowrooms}
                    onChange={s => { setSelectedShowrooms(s); setSelectedSellers(new Set()); }}
                    placeholder="جميع المعارض"
                  />
                  {/* البائع */}
                  <MultiSelectDropdown
                    options={SELLERS.filter(s =>
                      (selectedRegions.size === 0 || selectedRegions.has(s.regionId)) &&
                      (selectedAreas.size === 0 || selectedAreas.has(s.areaId)) &&
                      (selectedSupervisors.size === 0 || selectedSupervisors.has(s.supervisorId)) &&
                      (selectedShowrooms.size === 0 || selectedShowrooms.has(s.showroomId))
                    )}
                    selected={selectedSellers}
                    onChange={setSelectedSellers}
                    placeholder="جميع البائعين"
                  />
                </div>
              ) : (
                /* ── Analytics view: simple title + single filter ── */
                <>
                  <div className="flex items-center gap-3 sm:gap-4 w-full overflow-x-auto">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs sm:text-sm font-bold text-neutral-700">مؤشر أداء</span>
                      <span className="text-[9px] sm:text-[10px] text-neutral-400">
                        {period === "day"
                          ? `${selectedDay} ${MONTHS_AR[month]} ${toArabicDigits(String(year))}`
                          : period === "month"
                          ? `${MONTHS_AR[month]} ${toArabicDigits(String(year))}`
                          : toArabicDigits(String(year))}
                      </span>
                    </div>
                    {filterType === "team" && (
                      <MultiSelectDropdown options={REGIONS} selected={selectedRegions} onChange={setSelectedRegions} placeholder="جميع الأقاليم" />
                    )}
                    {filterType === "areas" && (
                      <MultiSelectDropdown options={AREAS} selected={selectedAreas} onChange={setSelectedAreas} placeholder="جميع المناطق" />
                    )}
                    {filterType === "supervisors" && (
                      <MultiSelectDropdown options={SUPERVISORS} selected={selectedSupervisors} onChange={setSelectedSupervisors} placeholder="جميع المشرفين" />
                    )}
                    {filterType === "showrooms" && (
                      <MultiSelectDropdown options={SHOWROOMS} selected={selectedShowrooms} onChange={setSelectedShowrooms} placeholder="جميع المعارض" />
                    )}
                    {filterType === "sellers" && (
                      <MultiSelectDropdown options={SELLERS} selected={selectedSellers} onChange={setSelectedSellers} placeholder="جميع البائعين" />
                    )}
                  </div>
                </>
              )}
              <div className="mr-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
                {/* View mode tabs */}
                <div className="flex items-center gap-0.5 bg-neutral-100 rounded-xl p-0.5">
                  {([
                    ["analytics", "ملخص", BarChart2],
                    ["table", "تفصيلي", Table]
                  ] as const).map(([mode, label, IconComponent]) => (
                    <button key={mode} onClick={() => setViewMode(mode)}
                      className={cn("px-1.5 sm:px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-[10px] font-semibold transition-all flex items-center gap-1",
                        viewMode === mode ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700")}
                      title={label}>
                      <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* Filter type tabs */}
          <div className="px-2 sm:px-6 py-2 flex items-center gap-1.5 sm:gap-2">
            <div className="flex flex-1 items-center gap-0.5 rounded-xl p-0.5 min-w-0">
            {([["team","الفريق"],["areas","المناطق"],["supervisors","المشرفين"],["showrooms","المعارض"],["sellers","البائعين"]] as [FilterType, string][]).map(([type, label]) => (
              <motion.button
                key={type}
                onClick={() => { setFilterType(type); resetTableFilters(); }}
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={cn(
                  "flex flex-1 items-center justify-center px-1.5 sm:px-3 py-1.5 rounded-[10px] text-[11px] sm:text-[13px] font-bold transition-colors duration-200 min-w-0",
                  filterType === type
                    ? "bg-neutral-900 text-white shadow-sm"
                    : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-200/60"
                )}
              >
                <span className="truncate">{label}</span>
              </motion.button>
            ))}
          </div>

          </div>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-16">
        <div className="max-w-[1400px] mx-auto px-1 sm:px-2 space-y-4 pt-2">
          {/* ── Calendar / Period Navigator ── */}
          <div className="border-b border-neutral-100 px-1 sm:px-2 py-2.5 -mx-1 sm:-mx-2">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5 bg-neutral-100 rounded-xl p-0.5">
                {([["day","يومي"],["month","شهري"]] as [Period, string][]).map(([p, l]) => (
                  <button key={p} onClick={() => setPeriod(p as Period)}
                    className={cn("px-2 sm:px-2.5 py-1 rounded-[10px] text-[10px] sm:text-[11px] font-semibold transition-all whitespace-nowrap",
                      period === p ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700")}>
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1 mr-auto">
                <button onClick={prevMonth} className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors">
                  <ChevronRight className="w-4 h-4 text-neutral-500" />
                </button>
                <span className="text-xs font-bold text-neutral-700 whitespace-nowrap">{period === "year" ? `إجمالي سنة ${year}` : `${MONTHS_AR[month]} ${year}`}</span>
                <button onClick={nextMonth} className="w-7 h-7 rounded-lg hover:bg-neutral-100 flex items-center justify-center transition-colors">
                  <ChevronLeft className="w-4 h-4 text-neutral-500" />
                </button>
              </div>
            </div>
            {(period === "month" || period === "year") ? (
              <div className="overflow-x-auto scrollbar-hide py-1">
                <div className="flex gap-0.5 pb-1 justify-center" style={{ minWidth: "max-content", margin: "0 auto" }}>
                  {MONTHS_AR.map((mName, mIdx) => {
                    const isSelected = period === "month" && mIdx === month;
                    const pct = genMonthPct(filteredIdxs, year, mIdx);
                    const color = pctColor(pct);
                    return (
                      <button key={mIdx} onClick={() => { setMonth(mIdx); setPeriod("month"); }}
                        className={cn(
                          "flex flex-col items-center gap-1 rounded-xl px-2 py-2 transition-all shrink-0 active:scale-95",
                          "sm:min-w-[76px] min-w-[calc((100vw-2rem-1rem)/7)]"
                        )}
                        style={{
                          backgroundColor: isSelected ? "#111111" : "#f4f4f5",
                          border: isSelected ? "1.5px solid rgba(0,0,0,0.25)" : "1.5px solid transparent",
                          boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                        }}>
                        <span className="text-[10px] sm:text-[11px] font-bold whitespace-nowrap" style={{ color: isSelected ? "#ffffff" : "#404040" }}>{mName}</span>
                        <span className="text-xs sm:text-sm font-extrabold whitespace-nowrap" style={{ color: isSelected ? "#ffffff" : color }}>{pct}%</span>
                        <div className="w-full h-1 sm:h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "#ddd" }}>
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: isSelected ? "#ffffff" : color }} />
                        </div>
                      </button>
                    );
                  })}
                  {(() => {
                    const yearPct = Math.round(MONTHS_AR.reduce((s, _, mIdx) => s + genMonthPct(filteredIdxs, year, mIdx), 0) / 12);
                    const isYearSelected = period === "year";
                    return (
                      <button onClick={() => setPeriod("year")}
                        className="flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 transition-all shrink-0 active:scale-95"
                        style={{
                          minWidth: 64,
                          backgroundColor: isYearSelected ? "#111111" : "#f4f4f5",
                          border: isYearSelected ? "1.5px solid rgba(0,0,0,0.25)" : "1.5px solid transparent",
                          boxShadow: isYearSelected ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                        }}>
                        <span className="text-[11px] font-bold whitespace-nowrap" style={{ color: isYearSelected ? "#ffffff" : "#B21063" }}>السنوي</span>
                        <span className="text-sm font-extrabold whitespace-nowrap" style={{ color: isYearSelected ? "#ffffff" : pctColor(yearPct) }}>{yearPct}%</span>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isYearSelected ? "rgba(255,255,255,0.25)" : "#ddd" }}>
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(yearPct, 100)}%`, backgroundColor: isYearSelected ? "#ffffff" : "#B21063" }} />
                        </div>
                      </button>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide py-1">
                <div className="flex gap-0.5 pb-1 justify-center px-1" style={{ minWidth: `${daysInMonth * 44 + 32}px`, width: "max-content", margin: "0 auto" }}>
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1;
                    const pct = dayPcts[day];
                    const isSelected = selectedDay === day;
                    const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                    const dayName = DAYS_SHORT_AR[new Date(year, month, day).getDay()];
                    const color = pctColor(pct);
                    return (
                      <button key={day} onClick={() => setSelectedDay(day)}
                        className={cn(
                          "flex flex-col items-center gap-0.5 rounded-xl py-2 transition-all shrink-0 active:scale-95",
                          "sm:min-w-[42px] min-w-[calc((100vw-2rem-1rem)/7)]",
                          isSelected ? "bg-neutral-900 text-white shadow-sm" : isToday ? "bg-blue-50 border border-blue-200" : "bg-neutral-50 hover:bg-neutral-100"
                        )}
                        style={{
                          backgroundColor: isSelected ? "#111111" : "#f4f4f5",
                          border: isSelected ? "1.5px solid rgba(0,0,0,0.25)" : "1.5px solid transparent",
                          boxShadow: isSelected ? "0 2px 8px rgba(0,0,0,0.18)" : "none",
                        }}>
                        <span className="text-[9px] font-semibold leading-none" style={{ color: isSelected ? "rgba(255,255,255,0.65)" : "#737373" }}>{dayName}</span>
                        <span className="text-[13px] font-extrabold leading-tight" style={{ color: isSelected ? "#ffffff" : "#1a1a1a" }}>{day}</span>
                        <span className="text-[10px] font-bold leading-none" style={{ color: isSelected ? "#ffffff" : color }}>{pct}%</span>
                        <div className="w-4/5 h-1.5 rounded-full overflow-hidden mt-0.5" style={{ backgroundColor: isSelected ? "rgba(255,255,255,0.25)" : "#ddd" }}>
                          <div className="h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: isSelected ? "#ffffff" : color }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

        </div>{/* end sticky wrapper */}

        {/* ── KPI Cards ── */}
        <div className={cn(
          "transition-all duration-300 overflow-hidden",
          headerCollapsed ? "opacity-0 max-h-0 !m-0 pointer-events-none" : "opacity-100 max-h-[500px]"
        )}>

        {/* Breadcrumb drill-down trail */}
        {drillPath.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap mb-2 bg-neutral-50 rounded-xl px-3 py-2 border border-neutral-100">
            <button onClick={() => setDrillPath([])}
              className="text-[11px] font-semibold text-[#B21063] hover:underline shrink-0 transition-colors">
              الفريق
            </button>
            {drillPath.map((crumb, i) => (
              <React.Fragment key={i}>
                <ChevronLeft className="w-3 h-3 text-neutral-300 shrink-0" />
                {i < drillPath.length - 1 ? (
                  <button onClick={() => drillTo(i + 1)}
                    className="text-[11px] font-semibold text-[#B21063] hover:underline shrink-0 transition-colors truncate max-w-[120px]">
                    {crumb.name}
                  </button>
                ) : (
                  <span className="text-[11px] font-bold text-neutral-700 shrink-0 truncate max-w-[140px]">{crumb.name}</span>
                )}
              </React.Fragment>
            ))}
            <button onClick={() => setDrillPath([])}
              className="mr-auto text-[10px] text-neutral-400 hover:text-neutral-600 px-2 py-0.5 rounded-lg hover:bg-neutral-200 transition-colors">
              إعادة ضبط
            </button>
          </div>
        )}

                {viewMode !== "table" && <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 sm:gap-2.5 pb-1 overflow-visible">
          <KpiCard title="إجمالي المبيعات" value={formatNum(totalSales)} sub={`الهدف: ${formatNum(totalTarget)}`} icon={ShoppingBag} color="#00C9A7" progress={achievementPct} />
          <KpiCard title="نسبة التحقيق" value={`${achievementPct}%`} sub={`نمو: ${growthPct >= 0 ? "+" : ""}${growthPct}%`} icon={TrendingUp} color={pctColor(achievementPct)} />
          <KpiCard title="الفواتير" value={formatFull(totalInvoices)} sub={`متوسط: ${formatFull(avgInvoice)}`} icon={FileText} color="#4D8AFF" />
          <KpiCard title="القطع" value={formatFull(totalPieces)} sub={`م.قطعة: ${Math.round(totalPieces / Math.max(totalInvoices, 1))}`} icon={ShoppingBag} color="#F9A825" />
          <KpiCard title="المعارض" value={formatFull(totalCustomers)} sub={`بائعين: ${filteredSellers.length}`} icon={MapPin} color="#845EC2" />
          <KpiCard title="مبيعات سابق" value={formatNum(totalPrevSales)} sub={`الفرق: ${formatNum(Math.abs(totalSales - totalPrevSales))}`} icon={BarChart2} color="#E91E8C" />
        </div>}
        </div>

        {/* ── ANALYTICS VIEW ── */}
        <AnimatePresence mode="wait">
          {viewMode === "analytics" && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
              className="space-y-4">

              {/* Row: bar charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                {/* Team/Showrooms/Sellers bar chart */}
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-neutral-800">
                      {{ team: "أداء الفريق", areas: "أداء المناطق", supervisors: "أداء المشرفين", showrooms: "أداء المعارض", sellers: "أداء البائعين" }[filterType]}
                    </h3>
                    <span className={cn("text-xs font-bold px-2.5 py-0.5 rounded-full", pctBg(achievementPct))}>
                      متوسط {achievementPct}%
                    </span>
                  </div>
                  <TeamSummary data={barData} />
                </div>

                {/* Category bar chart */}
                <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-neutral-800">تحقيق الفئات</h3>
                    <span className="text-xs bg-neutral-100 text-neutral-600 px-2.5 py-0.5 rounded-full font-medium">توزيع المبيعات</span>
                  </div>
                  {(() => {
                    const maxPct = Math.max(...CATEGORIES.map(c => c.pct), 1);
                    const BAR_AREA_H = 90;
                    return (
                      <div className="flex items-end gap-1.5 px-1">
                        {CATEGORIES.map((cat, i) => {
                          const barH = Math.max((cat.pct / maxPct) * BAR_AREA_H, 6);
                          return (
                            <div key={i} className="flex flex-col items-center flex-1 min-w-0" style={{ gap: 3 }}>
                              <span className="text-[11px] font-bold" style={{ color: cat.color }}>{cat.pct}%</span>
                              <div className="w-full flex justify-center items-end" style={{ height: BAR_AREA_H }}>
                                <div className="rounded-t-lg transition-all duration-500 w-full max-w-[32px]"
                                  style={{ height: barH, backgroundColor: cat.color }} />
                              </div>
                              <span className="text-[10px] text-neutral-500 text-center leading-tight font-medium">{cat.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                  <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-neutral-50">
                    {CATEGORIES.map((cat, i) => (
                      <div key={i} className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-[11px] text-neutral-500 font-medium">{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sales trend chart */}
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="text-sm font-bold text-neutral-800">
                    {period === "day" ? `مبيعات يوم ${selectedDay} ${MONTHS_AR[month]}` :
                     period === "year" ? `مبيعات سنة ${year}` :
                     `مبيعات ${MONTHS_AR[month]} ${year}`}
                  </h3>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 rounded bg-emerald-400 inline-block" />
                      <span className="text-neutral-500 font-medium">حالي</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-0.5 rounded bg-amber-400 inline-block" style={{ borderBottom: "2px dashed" }} />
                      <span className="text-neutral-500 font-medium">سابق</span>
                    </span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <AreaChart data={chartData} height={130} />
                </div>
                <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t border-neutral-50">
                  <div className="text-center">
                    <div className="text-xs text-neutral-400 font-medium">حالي</div>
                    <div className="text-sm font-bold text-emerald-600">{formatNum(currentSales)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-neutral-400 font-medium">سابق</div>
                    <div className="text-sm font-bold text-amber-600">{formatNum(prevSalesChart)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-neutral-400 font-medium">النمو</div>
                    <div className={cn("text-sm font-bold", growthPct >= 0 ? "text-emerald-600" : "text-rose-500")}>
                      {growthPct >= 0 ? "+" : ""}{growthPct}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Target achievement — filter + drill aware mini cards */}
              <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-neutral-800">
                    {(() => {
                      if (drillPath.length > 0) {
                        if (currentDrillLevel === "areas") return "أداء المناطق";
                        if (currentDrillLevel === "supervisors") return "أداء المشرفين";
                        if (currentDrillLevel === "showrooms") return "أداء المعارض";
                        if (currentDrillLevel === "sellers") return "أداء البائعين";
                        return "تفصيل الأداء";
                      }
                      if (filterType === "areas") return selectedAreas.size > 0 ? "أداء المناطق المحددة" : "أداء جميع المناطق";
                      if (filterType === "supervisors") return selectedSupervisors.size > 0 ? "أداء المشرفين المحددين" : "أداء جميع المشرفين";
                      if (filterType === "showrooms") return selectedShowrooms.size > 0 ? "أداء المعارض المحددة" : "أداء جميع المعارض";
                      if (filterType === "sellers") return selectedSellers.size > 0 ? "أداء البائعين المحددين" : "أداء جميع البائعين";
                      if (selectedSellers.size > 0) return "أداء البائعين المحددين";
                      if (selectedShowrooms.size > 0) return "أداء بائعي المعارض المحددة";
                      if (selectedSupervisors.size > 0) return "أداء معارض المشرفين المحددين";
                      if (selectedAreas.size > 0) return "أداء مشرفي المناطق المحددة";
                      if (selectedRegions.size > 0) return "أداء مناطق الأقاليم المحددة";
                      return "أداء الأقاليم";
                    })()}
                  </h3>
                  <span className="text-[10px] text-neutral-400 font-medium">انقر للتفصيل</span>
                </div>
                <div className="space-y-2">
                  {(() => {
                    // Helper: compute period-aware sales/target for a group of sellers
                    function miniCard(id: string, name: string, sellers: typeof SELLERS[number][], onDrill?: () => void, noChevron = false) {
                      const idxs = sellers.map(s => SELLERS.indexOf(s));
                      const sales  = idxs.reduce((a, si) => a + sellerPeriodSales(si, year, month, period, selectedDay), 0);
                      const target = idxs.reduce((a, si) => a + sellerPeriodTarget(si, year, month, period), 0);
                      const pct = target > 0 ? Math.min(Math.round((sales / target) * 100), 130) : 0;
                      if (sales === 0 && target === 0) return null;
                      return noChevron ? (
                        <div key={id} className="flex items-center gap-3 px-2 py-1.5">
                          <div className="w-32 shrink-0">
                            <span className="text-xs font-semibold text-neutral-700 truncate block">{name}</span>
                            <span className="text-[11px] text-neutral-400 font-medium">{formatNum(sales)}</span>
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pctColor(pct) }} />
                          </div>
                          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 w-14 text-center", pctBg(pct))}>{pct}%</span>
                        </div>
                      ) : (
                        <button key={id} onClick={onDrill}
                          className="flex items-center gap-3 w-full text-right hover:bg-neutral-50 rounded-xl px-2 py-1.5 transition-colors group">
                          <div className="w-32 shrink-0">
                            <span className="text-xs font-semibold text-neutral-700 truncate block group-hover:text-[#B21063] transition-colors">{name}</span>
                            <span className="text-[11px] text-neutral-400 font-medium">{formatNum(sales)}</span>
                          </div>
                          <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: pctColor(pct) }} />
                          </div>
                          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-lg shrink-0 w-14 text-center", pctBg(pct))}>{pct}%</span>
                          <ChevronLeft className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#B21063] shrink-0 transition-colors" />
                        </button>
                      );
                    }

                    // Drill path takes priority
                    if (drillPath.length > 0) {
                      const last = drillPath[drillPath.length - 1];
                      if (currentDrillLevel === "areas") {
                        return AREAS.filter(a => a.regionId === last.id && filteredSellers.some(s => s.areaId === a.id))
                          .map(a => miniCard(a.id, a.name, filteredSellers.filter(s => s.areaId === a.id), () => drillInto("areas", a.id, a.name)));
                      }
                      if (currentDrillLevel === "supervisors") {
                        return SUPERVISORS.filter(sup => sup.areaId === last.id && filteredSellers.some(s => s.supervisorId === sup.id))
                          .map(sup => miniCard(sup.id, sup.name, filteredSellers.filter(s => s.supervisorId === sup.id), () => drillInto("supervisors", sup.id, sup.name)));
                      }
                      if (currentDrillLevel === "showrooms") {
                        return SHOWROOMS.filter(sh => sh.supervisorId === last.id && filteredSellers.some(s => s.showroomId === sh.id))
                          .map(sh => miniCard(sh.id, sh.name, filteredSellers.filter(s => s.showroomId === sh.id), () => drillInto("showrooms", sh.id, sh.name)));
                      }
                      if (currentDrillLevel === "sellers") {
                        return filteredSellers.filter(s => s.showroomId === last.id)
                          .map(s => miniCard(s.id, s.name, [s], () => drillInto("sellers", s.id, s.name)));
                      }
                      if (currentDrillLevel === "days") {
                        return filteredSellers.map(s => miniCard(s.id, s.name, [s], undefined, true));
                      }
                    }

                    // No drill path — filterType is primary
                    if (filterType === "areas") {
                      return AREAS.filter(a => filteredSellers.some(s => s.areaId === a.id))
                        .map(a => miniCard(a.id, a.name, filteredSellers.filter(s => s.areaId === a.id), () => drillInto("areas", a.id, a.name)));
                    }
                    if (filterType === "supervisors") {
                      return SUPERVISORS.filter(sup => filteredSellers.some(s => s.supervisorId === sup.id))
                        .map(sup => miniCard(sup.id, sup.name, filteredSellers.filter(s => s.supervisorId === sup.id), () => drillInto("supervisors", sup.id, sup.name)));
                    }
                    if (filterType === "showrooms") {
                      return SHOWROOMS.filter(sh => filteredSellers.some(s => s.showroomId === sh.id))
                        .map(sh => miniCard(sh.id, sh.name, filteredSellers.filter(s => s.showroomId === sh.id), () => drillInto("showrooms", sh.id, sh.name)));
                    }
                    if (filterType === "sellers") {
                      return filteredSellers.map(s => miniCard(s.id, s.name, [s], () => drillInto("sellers", s.id, s.name)));
                    }
                    // team tab — drill by most specific active filter
                    if (selectedSellers.size > 0) {
                      return filteredSellers.map(s => miniCard(s.id, s.name, [s], () => drillInto("sellers", s.id, s.name)));
                    }
                    if (selectedShowrooms.size > 0) {
                      return filteredSellers.map(s => miniCard(s.id, s.name, [s], () => drillInto("sellers", s.id, s.name)));
                    }
                    if (selectedSupervisors.size > 0) {
                      return SHOWROOMS.filter(sh => filteredSellers.some(s => s.showroomId === sh.id))
                        .map(sh => miniCard(sh.id, sh.name, filteredSellers.filter(s => s.showroomId === sh.id), () => drillInto("showrooms", sh.id, sh.name)));
                    }
                    if (selectedAreas.size > 0) {
                      return SUPERVISORS.filter(sup => filteredSellers.some(s => s.supervisorId === sup.id))
                        .map(sup => miniCard(sup.id, sup.name, filteredSellers.filter(s => s.supervisorId === sup.id), () => drillInto("supervisors", sup.id, sup.name)));
                    }
                    if (selectedRegions.size > 0) {
                      return AREAS.filter(a => filteredSellers.some(s => s.areaId === a.id))
                        .map(a => miniCard(a.id, a.name, filteredSellers.filter(s => s.areaId === a.id), () => drillInto("areas", a.id, a.name)));
                    }
                    // Default: all regions
                    return REGIONS.filter(r => filteredSellers.some(s => s.regionId === r.id))
                      .map(r => miniCard(r.id, r.name, filteredSellers.filter(s => s.regionId === r.id), () => drillInto("regions", r.id, r.name)));
                  })()}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TABLE VIEW ── */}
          {viewMode === "table" && (
            <motion.div key="table" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}
              className="space-y-4">

              {/* ── DAYS view (leaf level: show seller daily breakdown) ── */}
              {currentDrillLevel === "days" && drillPath.length > 0 && (() => {
                const selId = drillPath[drillPath.length - 1].id;
                const selIdx = SELLERS.findIndex(s => s.id === selId);
                const daysCount = getDaysInMonth(year, month);
                const dayRows = Array.from({ length: daysCount }, (_, i) => {
                  const d = i + 1;
                  const dayData = genSellerDayData(selIdx, year, month, d);
                  const daySales = dayData.reduce((s, h) => s + h.current, 0);
                  const prevDaySales = dayData.reduce((s, h) => s + h.prev, 0);
                  const dayTarget = sellerPeriodTarget(selIdx, year, month, "day");
                  const pct = dayTarget > 0 ? Math.round((daySales / dayTarget) * 100) : 0;
                  const dayName = DAYS_SHORT_AR[new Date(year, month, d).getDay()];
                  return { day: d, dayName, sales: daySales, prevSales: prevDaySales, target: dayTarget, pct };
                });
                return (
                  <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                      <h3 className="text-sm font-bold text-neutral-800">
                        تقرير الأيام — {drillPath[drillPath.length - 1].name}
                      </h3>
                      <span className="text-xs text-neutral-500 font-medium">{MONTHS_AR[month]} {year}</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px] sm:text-[13px]" style={{ minWidth: 520 }}>
                        <thead>
                          <tr className="bg-neutral-50 border-b border-neutral-100">
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 whitespace-nowrap text-xs sm:text-sm">اليوم</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 whitespace-nowrap text-xs sm:text-sm">التاريخ</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 whitespace-nowrap text-xs sm:text-sm">المبيعات</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 whitespace-nowrap text-xs sm:text-sm">الهدف</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 whitespace-nowrap text-xs sm:text-sm">السابق</th>
                            <th className="px-2 sm:px-3 py-2 sm:py-3 text-right font-bold text-neutral-600 whitespace-nowrap text-xs sm:text-sm">التحقيق</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dayRows.map((row, idx) => (
                            <tr key={row.day} className={cn("border-b border-neutral-50 transition-colors", idx % 2 === 0 ? "bg-white" : "bg-neutral-50/30")}>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 font-medium text-neutral-700 whitespace-nowrap text-xs sm:text-sm">{row.dayName}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-500 tabular-nums whitespace-nowrap text-xs sm:text-sm">{row.day}/{month + 1}/{year}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-700 font-semibold tabular-nums text-xs sm:text-sm">{formatFull(Math.round(row.sales))}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-500 tabular-nums text-xs sm:text-sm">{formatFull(row.target)}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2.5 text-neutral-500 tabular-nums text-xs sm:text-sm">{formatFull(Math.round(row.prevSales))}</td>
                              <td className="px-2 sm:px-3 py-2 sm:py-2">
                                <span className={cn("text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg", pctBg(row.pct))}>{row.pct}%</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="bg-neutral-50 border-t-2 border-neutral-200 font-bold">
                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-neutral-800 text-xs sm:text-sm" colSpan={2}>الإجمالي</td>
                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-neutral-800 tabular-nums text-xs sm:text-sm">{formatFull(Math.round(dayRows.reduce((s, r) => s + r.sales, 0)))}</td>
                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-neutral-700 tabular-nums text-xs sm:text-sm">{formatFull(dayRows.reduce((s, r) => s + r.target, 0))}</td>
                            <td className="px-2 sm:px-3 py-2 sm:py-3 text-neutral-700 tabular-nums text-xs sm:text-sm">{formatFull(Math.round(dayRows.reduce((s, r) => s + r.prevSales, 0)))}</td>
                            <td className="px-2 sm:px-3 py-2 sm:py-2.5">
                              <span className={cn("text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-lg", pctBg(achievementPct))}>{achievementPct}%</span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                );
              })()}

              {/* ── Smart table: determined by most specific active filter ── */}
              {(() => {
                // Helper: aggregate period-aware KPIs for a set of seller indices
                function aggRows<T extends { id: string; name: string }>(
                  items: T[],
                  getSellers: (item: T) => typeof SELLERS[number][],
                  nextLevel: DrillLevel
                ): DrillRow[] {
                  return items.map(item => {
                    const ss = getSellers(item);
                    const idxs = ss.map(s => SELLERS.indexOf(s));
                    const sales     = idxs.reduce((a, si) => a + sellerPeriodSales(si, year, month, period, selectedDay), 0);
                    const target    = idxs.reduce((a, si) => a + sellerPeriodTarget(si, year, month, period), 0);
                    const prevSales = idxs.reduce((a, si) => a + sellerPeriodPrevSales(si, year, month, period, selectedDay), 0);
                    const invoices  = idxs.reduce((a, si) => a + scalePeriodCount(SELLERS[si].invoices, year, month, period), 0);
                    const pieces    = idxs.reduce((a, si) => a + scalePeriodCount(SELLERS[si].pieces, year, month, period), 0);
                    const customers = idxs.reduce((a, si) => a + scalePeriodCount(SELLERS[si].customers, year, month, period), 0);
                    const avgInvoice = invoices > 0 ? Math.round(sales / invoices) : 0;
                    const avgPiece   = invoices > 0 ? Math.round(pieces / invoices) : 0;
                    // Hierarchy context — infer from first seller
                    const rep = ss[0] as (typeof SELLERS[number]) | undefined;
                    const regionName     = nextLevel === "areas"       ? REGIONS.find(r => r.id === (rep as any).regionId)?.name     : undefined;
                    const areaName       = (nextLevel === "supervisors" || nextLevel === "areas") ? AREAS.find(a => a.id === (rep as any).areaId)?.name : undefined;
                    const supervisorName = (nextLevel === "showrooms")  ? SUPERVISORS.find(s => s.id === (rep as any).supervisorId)?.name : undefined;
                    const showroomName   = (nextLevel === "sellers")    ? SHOWROOMS.find(s => s.id === (rep as any).showroomId)?.name    : undefined;
                    return { id: item.id, name: item.name, regionName, areaName, supervisorName, showroomName, sales, target, prevSales, invoices, pieces, customers, avgInvoice, avgPiece, nextLevel };
                  }).filter(r => r.sales > 0 || r.target > 0);
                }

                const commonProps = {
                  totalSales, totalTarget, totalPrevSales,
                  totalInvoices, totalPieces, totalCustomers,
                  achievementPct, sortKey, sortDir, toggleSort,
                  tablePage, setTablePage, totalPages,
                  mobileTableMode, setMobileTableMode,
                };

                // Drill path takes priority
                if (drillPath.length > 0) {
                  const last = drillPath[drillPath.length - 1];

                  if (last.level === "sellers" || currentDrillLevel === "days") return null; // handled above

                  if (currentDrillLevel === "areas") {
                    const items = AREAS.filter(a => a.regionId === last.id && filteredSellers.some(s => s.areaId === a.id));
                    return <DrillTable key="areas" title={`تقرير المناطق | ${last.name}`} rowCount={items.length}
                      rows={aggRows(items, a => filteredSellers.filter(s => s.areaId === a.id), "areas")}
                      onDrill={(id, name) => drillInto("areas", id, name)} {...commonProps} nameLabel="المنطقة" />;
                  }
                  if (currentDrillLevel === "supervisors") {
                    const items = SUPERVISORS.filter(sup => sup.areaId === last.id && filteredSellers.some(s => s.supervisorId === sup.id));
                    return <DrillTable key="supervisors" title={`تقرير المشرفين | ${last.name}`} rowCount={items.length}
                      rows={aggRows(items, sup => filteredSellers.filter(s => s.supervisorId === sup.id), "supervisors")}
                      onDrill={(id, name) => drillInto("supervisors", id, name)} {...commonProps} nameLabel="المشرف" />;
                  }
                  if (currentDrillLevel === "showrooms") {
                    const items = SHOWROOMS.filter(sh => sh.supervisorId === last.id && filteredSellers.some(s => s.showroomId === sh.id));
                    return <DrillTable key="showrooms" title={`تقرير المعارض | ${last.name}`} rowCount={items.length}
                      rows={aggRows(items, sh => filteredSellers.filter(s => s.showroomId === sh.id), "showrooms")}
                      onDrill={(id, name) => drillInto("showrooms", id, name)} {...commonProps} nameLabel="المعرض" />;
                  }
                  if (currentDrillLevel === "sellers") {
                    const items = filteredSellers.filter(s => s.showroomId === last.id);
                    return <DrillTable key="sellers" title={`تقرير البائعين | ${last.name}`} rowCount={items.length}
                      rows={aggRows(items, s => [s], "sellers")}
                      onDrill={(id, name) => drillInto("sellers", id, name)} {...commonProps} nameLabel="البائع" drillLabel="الأيام" />;
                  }
                }

                // No drill path — filterType is primary
                if (filterType === "areas") {
                  const areaItems = AREAS.filter(a => filteredSellers.some(s => s.areaId === a.id));
                  return <DrillTable key="all-areas" title={`تقرير المناطق | ${MONTHS_AR[month]} ${year}`} rowCount={areaItems.length}
                    rows={aggRows(areaItems, a => filteredSellers.filter(s => s.areaId === a.id), "areas")}
                    onDrill={(id, name) => drillInto("areas", id, name)} {...commonProps} nameLabel="المنطقة" />;
                }
                if (filterType === "supervisors") {
                  const supItems = SUPERVISORS.filter(sup => filteredSellers.some(s => s.supervisorId === sup.id));
                  return <DrillTable key="all-supervisors" title={`تقرير المشرفين | ${MONTHS_AR[month]} ${year}`} rowCount={supItems.length}
                    rows={aggRows(supItems, sup => filteredSellers.filter(s => s.supervisorId === sup.id), "supervisors")}
                    onDrill={(id, name) => drillInto("supervisors", id, name)} {...commonProps} nameLabel="المشرف" />;
                }
                if (filterType === "sellers") {
                  return <DrillTable key="all-sellers" title={`تقرير البائعين | ${MONTHS_AR[month]} ${year}`} rowCount={filteredSellers.length}
                    rows={aggRows(filteredSellers, s => [s], "sellers")}
                    onDrill={(id, name) => drillInto("sellers", id, name)} {...commonProps} nameLabel="البائع" drillLabel="الأيام" />;
                }
                if (filterType === "showrooms") {
                  const showroomItems = SHOWROOMS.filter(sh => filteredSellers.some(s => s.showroomId === sh.id));
                  return <DrillTable key="all-showrooms" title={`تقرير المعارض | ${MONTHS_AR[month]} ${year}`} rowCount={showroomItems.length}
                    rows={aggRows(showroomItems, sh => filteredSellers.filter(s => s.showroomId === sh.id), "showrooms")}
                    onDrill={(id, name) => drillInto("showrooms", id, name)} {...commonProps} nameLabel="المعرض" />;
                }

                // team tab: cascade by most specific active multi-filter
                if (selectedSellers.size > 0 || selectedShowrooms.size > 0) {
                  return <DrillTable key="filtered-sellers" title="تقرير البائعين المحددين" rowCount={filteredSellers.length}
                    rows={aggRows(filteredSellers, s => [s], "sellers")}
                    onDrill={(id, name) => drillInto("sellers", id, name)} {...commonProps} nameLabel="البائع" drillLabel="الأيام" />;
                }
                if (selectedSupervisors.size > 0) {
                  const showroomItems = SHOWROOMS.filter(sh => filteredSellers.some(s => s.showroomId === sh.id));
                  return <DrillTable key="sup-showrooms" title="تقرير معارض المشرفين المحددين" rowCount={showroomItems.length}
                    rows={aggRows(showroomItems, sh => filteredSellers.filter(s => s.showroomId === sh.id), "showrooms")}
                    onDrill={(id, name) => drillInto("showrooms", id, name)} {...commonProps} nameLabel="المعرض" />;
                }
                if (selectedAreas.size > 0) {
                  const supItems = SUPERVISORS.filter(sup => filteredSellers.some(s => s.supervisorId === sup.id));
                  return <DrillTable key="area-supervisors" title="تقرير مشرفي المناطق المحددة" rowCount={supItems.length}
                    rows={aggRows(supItems, sup => filteredSellers.filter(s => s.supervisorId === sup.id), "supervisors")}
                    onDrill={(id, name) => drillInto("supervisors", id, name)} {...commonProps} nameLabel="المشرف" />;
                }
                if (selectedRegions.size > 0) {
                  const areaItems = AREAS.filter(a => filteredSellers.some(s => s.areaId === a.id));
                  return <DrillTable key="region-areas" title="تقرير مناطق الأقاليم المحددة" rowCount={areaItems.length}
                    rows={aggRows(areaItems, a => filteredSellers.filter(s => s.areaId === a.id), "areas")}
                    onDrill={(id, name) => drillInto("areas", id, name)} {...commonProps} nameLabel="المنطقة" />;
                }

                // team default: all regions
                const regionItems = REGIONS.filter(r => filteredSellers.some(s => s.regionId === r.id));
                return <DrillTable key="regions" title={`تقرير الأقاليم | ${MONTHS_AR[month]} ${year}`} rowCount={regionItems.length}
                  rows={aggRows(regionItems, r => filteredSellers.filter(s => s.regionId === r.id), "regions")}
                  onDrill={(id, name) => drillInto("regions", id, name)} {...commonProps} nameLabel="الإقليم" />;
              })()}

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
