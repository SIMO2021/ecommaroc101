
const CFG = window.ECOM_CONFIG || {};
const LIVE = Boolean(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY);
const sb = LIVE
  ? (await import("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm")).createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY)
  : null;

const $main = document.getElementById("main");
const $nav = document.getElementById("nav");
document.getElementById("yr").textContent = new Date().getFullYear();

const TRACKS = {
  ecommerce: "التجارة الإلكترونية",
  ai: "الذكاء الاصطناعي",
  claude: "Claude Skills",
};

/* ---------- بيانات تجريبية (كتبان غير قبل ما نربطو Supabase) ---------- */
const DEMO = {
  courses: [
    { id: "d1", slug: "ecommerce-maroc-0", title: "التجارة الإلكترونية فالمغرب من الصفر", summary: "من اختيار المنتج حتى أول طلبية بالدفع عند الاستلام.", description: "كتعلم كيفاش تختار منتج رابح، تدير متجر، تطلق إعلانات فيسبوك وتيكتوك، وتنظم التوصيل والدفع عند الاستلام فالمغرب.", track: "ecommerce", level: "مبتدئ", price_mad: 299, old_price_mad: 499, cover_word: "متجر", badge: "الأكثر طلباً", in_plus: true, published: true },
    { id: "d2", slug: "ai-for-ecommerce", title: "الذكاء الاصطناعي للتجارة والإعلانات", summary: "صور وفيديوهات إعلانية وكتابة إعلانات بالذكاء الاصطناعي.", description: "كتعلم تصاوب صور المنتجات، فيديوهات UGC، وسكريبتات الإعلانات بأدوات الذكاء الاصطناعي، بلا مصور وبلا ممثلين.", track: "ai", level: "مبتدئ", price_mad: 249, cover_word: "إعلان", badge: "جديد", in_plus: true, published: true },
    { id: "d3", slug: "claude-skills", title: "Claude Skills: خدّم الذكاء الاصطناعي فمشروعك", summary: "بني skills جاهزة كتخدم بلاصتك: بحث المنتجات، المحتوى، والتقارير.", description: "كتعلم تستعمل Claude وتبني Skills خاصة بيك، وتربطها بأدوات بحال Apify باش تأتمت البحث على المنتجات الرابحة وكتابة المحتوى.", track: "claude", level: "مبتدئ", price_mad: 349, cover_word: "Claude", in_plus: true, published: true },
  ],
  lessons: [
    { id: "l1", course_id: "d1", title: "مرحبا: شنو هي التجارة الإلكترونية فالمغرب؟", position: 1, is_free: true, duration_min: 8 },
    { id: "l2", course_id: "d1", title: "كيفاش تلقى منتج رابح", position: 2, is_free: false, duration_min: 15 },
    { id: "l3", course_id: "d1", title: "الدفع عند الاستلام والتوصيل", position: 3, is_free: false, duration_min: 12 },
    { id: "l4", course_id: "d2", title: "الأدوات اللي غادي نخدمو بيها", position: 1, is_free: true, duration_min: 7 },
    { id: "l5", course_id: "d2", title: "صور منتجات احترافية بالذكاء الاصطناعي", position: 2, is_free: false, duration_min: 18 },
    { id: "l6", course_id: "d3", title: "شنو هي Claude Skill؟", position: 1, is_free: true, duration_min: 9 },
    { id: "l7", course_id: "d3", title: "بني أول Skill ديالك", position: 2, is_free: false, duration_min: 20 },
  ],
};

/* ---------- أدوات صغيرة ---------- */
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const mad = (n) => (Number(n) > 0 ? `${Number(n).toLocaleString("fr-MA")} درهم` : "مجاني");
const fmtDate = (d) => new Date(d).toLocaleDateString("ar-MA", { year: "numeric", month: "short", day: "numeric" });
const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-+|-+$/g, "") || "course-" + Date.now();

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2600);
}
function view(html) { $main.innerHTML = html; $main.focus({ preventScroll: true }); window.scrollTo(0, 0); }
function loading() { $main.innerHTML = `<div class="spinner">كنحمّل…</div>`; }
function go(path) { location.hash = "#" + path; }

function embed(url) {
  if (!url) return `<div class="player-empty">الفيديو باقي ما تزادش</div>`;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/);
  if (yt) return `<div class="player"><iframe src="https://www.youtube-nocookie.com/embed/${esc(yt[1])}?rel=0" title="الفيديو" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `<div class="player"><iframe src="https://player.vimeo.com/video/${esc(vm[1])}" title="الفيديو" allow="fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  if (/^https:\/\//.test(url)) return `<div class="player"><video src="${esc(url)}" controls controlsList="nodownload" preload="metadata"></video></div>`;
  return `<div class="player-empty">رابط الفيديو ماشي صحيح</div>`;
}

/* ---------- الحساب الحالي ---------- */
let session = null, profile = null;
async function loadAuth() {
  if (!LIVE) return;
  const { data } = await sb.auth.getSession();
  session = data.session;
  profile = null;
  if (session) {
    const { data: p } = await sb.from("profiles").select("*").eq("id", session.user.id).maybeSingle();
    profile = p;
  }
}
const isAdmin = () => profile?.role === "admin";

function renderNav(route) {
  const on = (r) => (r === "/" ? route === "/" : route.startsWith(r)) ? ' class="on"' : "";
  document.getElementById("mainnav").innerHTML =
    `<a href="#/"${on("/")}>الرئيسية</a><a href="#/courses"${on("/course")}>الكورسات</a><a href="#/tracks"${on("/tracks")}>المسارات</a><a href="#/pricing"${on("/pricing")}>الاشتراك</a>` +
    (session ? `<a href="#/account"${on("/account")}>دوراتي</a>` : "") +
    (isAdmin() ? `<a href="#/admin"${on("/admin")}>لوحة الأدمن</a>` : "");
  $nav.innerHTML = session
    ? `${hasPlus() ? `<span class="pill plus">بلس</span>` : ""}<a class="link" href="#/account">حسابي</a><a class="btn btn-ghost-d btn-sm" href="#/logout">خروج</a>`
    : `<a class="link" href="#/login">تسجيل الدخول</a><a class="btn btn-red btn-sm" href="#/signup">ابدأ مجاناً</a>`;
}
const hasPlus = () => profile?.plus_until && new Date(profile.plus_until) > new Date();

/* ---------- جلب البيانات ---------- */
async function getCourses({ all = false } = {}) {
  if (!LIVE) return DEMO.courses;
  let q = sb.from("courses").select("*").order("position").order("created_at");
  if (!all) q = q.eq("published", true);
  const { data, error } = await q;
  if (error) throw error;
  return data;
}
async function getCourseBySlug(slug) {
  if (!LIVE) return DEMO.courses.find((c) => c.slug === slug);
  const { data } = await sb.from("courses").select("*").eq("slug", slug).maybeSingle();
  return data;
}
async function getOutline(courseId) {
  if (!LIVE) return DEMO.lessons.filter((l) => l.course_id === courseId);
  const src = isAdmin() ? "lessons" : "lesson_outline";
  const { data } = await sb.from(src).select("id,course_id,title,duration_min,position,is_free").eq("course_id", courseId).order("position");
  return data || [];
}
async function lessonStats() {
  const rows = LIVE ? ((await sb.from("lesson_outline").select("course_id,duration_min")).data || []) : DEMO.lessons;
  const st = {};
  rows.forEach((l) => { const o = (st[l.course_id] ||= { n: 0, min: 0 }); o.n++; o.min += l.duration_min || 0; });
  return st;
}
async function myEnrollment(courseId) {
  if (!LIVE || !session) return null;
  const { data } = await sb.from("enrollments").select("*").eq("course_id", courseId).eq("user_id", session.user.id).maybeSingle();
  return data;
}

/* ================= الصفحات ================= */

function trackGlyph(t) {
  const g = {
    ecommerce: `<svg class="glyph" viewBox="0 0 44 44" aria-hidden="true"><rect x="4" y="12" width="36" height="26" rx="4" fill="#2E31B8"/><path d="M14 12a8 8 0 0 1 16 0" stroke="#2E31B8" stroke-width="3" fill="none"/><path d="M22 18l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#F2B53A"/></svg>`,
    ai: `<svg class="glyph" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="#146B4E"/><path d="M22 9l3.5 9.5L35 22l-9.5 3.5L22 35l-3.5-9.5L9 22l9.5-3.5z" fill="#F2B53A"/></svg>`,
    claude: `<svg class="glyph" viewBox="0 0 44 44" aria-hidden="true"><rect x="4" y="4" width="36" height="36" rx="8" fill="#16163A"/><path d="M14 16l-5 6 5 6M30 16l5 6-5 6M25 12l-6 20" stroke="#F2B53A" stroke-width="3" fill="none" stroke-linecap="round"/></svg>`,
  };
  return g[t] || "";
}

const SPARK = `<svg viewBox="0 0 40 40" fill="currentColor"><path d="M20 0l4.2 15.8L40 20l-15.8 4.2L20 40l-4.2-15.8L0 20l15.8-4.2z"/></svg>`;
function tile(c) {
  const word = c.cover_word || (c.title || "").split(/\s+/)[0];
  return `<div class="tile" data-track="${esc(c.track)}">
    ${c.badge ? `<span class="badge ${/جديد/.test(c.badge) ? "new" : ""}">${esc(c.badge)}</span>` : ""}
    ${c.cover_url ? `<img src="${esc(c.cover_url)}" alt="" loading="lazy">` : `<span class="spark">${SPARK}</span><span class="spark s2">${SPARK}</span><span class="word">${esc(word)}</span>`}
  </div>`;
}
function courseCard(c, st = {}) {
  const s = st[c.id] || { n: 0, min: 0 };
  const hrs = s.min ? (s.min >= 60 ? `${Math.round(s.min / 60)} ساعة` : `${s.min} دقيقة`) : "";
  return `<a class="course" href="#/course/${encodeURIComponent(c.slug)}">
    ${tile(c)}
    <div class="body">
      <span class="cat">${esc(TRACKS[c.track] || "")}</span>
      <h3>${esc(c.title)}</h3>
      <span class="by"><i aria-hidden="true"></i>ecommaroc101</span>
      <span class="facts">${hrs ? `<span>${hrs}</span>` : ""}${s.n ? `<span>${s.n} دروس</span>` : ""}<span>${esc(c.level || "مبتدئ")}</span></span>
      <div class="meta"><span class="price">${mad(c.price_mad)}${c.old_price_mad ? `<s>${mad(c.old_price_mad)}</s>` : ""}</span>${c.in_plus !== false ? `<span class="in-plus">ضمن بلس</span>` : ""}</div>
    </div>
  </a>`;
}

function plansHTML(cycle) {
  const m = Number(CFG.PLUS_MONTHLY || 99), y = Number(CFG.PLUS_YEARLY || 790), t = Number(CFG.TEAM_PER_USER || 79);
  const yearly = cycle === "yearly";
  const save = Math.max(0, Math.round((1 - y / (m * 12)) * 100));
  const plusAmount = yearly ? Math.round(y / 12) : m;
  return `
  <div class="toggle" role="group" aria-label="مدة الاشتراك">
    <button data-cycle="monthly" aria-pressed="${!yearly}">شهري</button>
    <button data-cycle="yearly" aria-pressed="${yearly}">سنوي ${save ? `<span class="save">وفّر ${save}%</span>` : ""}</button>
  </div>
  <div class="plans">
    <div class="plan plan-solo">
      <h3>شراء فردي</h3><span class="sub">خلّص غير على الكورس اللي محتاج</span>
      <div class="amount"><small>كيبدا من</small>${Number(CFG.SOLO_FROM || 249)}<small>درهم</small></div>
      <span class="note">للكورس الواحد، خلصة وحدة</span>
      <a class="btn btn-ghost-d btn-block" href="#/courses">تصفّح الكورسات</a>
      <ul><li>الكورس كيبقى عندك ديما</li><li>دروس بالدارجة خطوة بخطوة</li><li>تتبّع التقدم ديالك</li></ul>
    </div>
    <div class="plan plan-plus">
      <h3>ecommaroc بلس <span class="tag-pop">الأكثر اختياراً</span></h3><span class="sub">جميع الكورسات والمسارات</span>
      <div class="amount">${plusAmount}<small>درهم / شهرياً</small></div>
      <span class="note">${yearly ? `كتخلص ${y} درهم للعام بلاصة ${m * 12}` : "كتقدر توقف وقتما بغيتي"}</span>
      <button class="btn btn-white btn-block" data-plus="${yearly ? "yearly" : "monthly"}">اشترك فبلس</button>
      <ul><li>جميع الكورسات الحالية</li><li>كل كورس جديد كيتزاد</li><li>التجارة الإلكترونية + الذكاء الاصطناعي + Claude Skills</li></ul>
    </div>
    <div class="plan plan-team">
      <h3>للفرق</h3><span class="sub">للوكالات وفرق المحتوى</span>
      <div class="amount">${t}<small>درهم / شخص شهرياً</small></div>
      <span class="note">من 3 أشخاص وفوق</span>
      <button class="btn btn-dark btn-block" data-plus="team">تواصل معانا</button>
      <ul><li>كل مزايا بلس</li><li>حساب لكل واحد فالفريق</li><li>فاتورة وحدة</li></ul>
    </div>
  </div>`;
}
function bindPlans(container) {
  container.querySelectorAll("[data-cycle]").forEach((b) => b.addEventListener("click", () => {
    container.querySelector(".plans-host").innerHTML = plansHTML(b.dataset.cycle);
    bindPlans(container);
  }));
  container.querySelectorAll("[data-plus]").forEach((b) => b.addEventListener("click", async () => {
    if (!LIVE) return toast("الاشتراك غادي يتفعّل قريباً");
    if (!session) return go("/signup?next=/pricing");
    const { error } = await sb.from("profiles").update({ plus_request: b.dataset.plus }).eq("id", session.user.id);
    if (error) return toast("وقع مشكل، عاود جرّب");
    await loadAuth();
    toast("توصلنا بالطلب ديالك، غادي نتواصلو معاك");
    if (CFG.WHATSAPP) window.open(`https://wa.me/${CFG.WHATSAPP}?text=${encodeURIComponent("سلام، بغيت نشترك فـ ecommaroc بلس (" + b.dataset.plus + ")")}`, "_blank", "noopener");
  }));
}

async function pageHome() {
  const [courses, st] = await Promise.all([getCourses().catch(() => []), lessonStats().catch(() => ({}))]);
  view(`
  <section class="dark hero"><div class="wrap">
    <span class="pill-badge"><i></i>ecommaroc بلس</span>
    <h1>تعلّم تبيع أونلاين.<span class="l2">بالدارجة، من الصفر.</span></h1>
    <p class="lead">اختار الطريقة اللي كتناسبك: اشري كورس بوحدو، ولا اشترك فبلس وتعلّم التجارة الإلكترونية، الذكاء الاصطناعي، وClaude Skills كاملين.</p>
    <div class="cta"><a class="btn btn-red" href="#/courses">تصفّح الكورسات</a><a class="btn btn-ghost-d" href="#/pricing">شوف الاشتراك</a></div>
  </div></section>

  <section class="sand section"><div class="wrap">
    <div class="sec-head">
      <div><span class="kicker">الأكثر طلباً</span><h2>كورسات كتعلّم منها دابا</h2></div>
      <a class="more" href="#/courses">كل الكورسات</a>
    </div>
    <div class="filters" role="group" aria-label="فلتر حسب المسار">
      ${[["", "الكل"], ...Object.entries(TRACKS)].map(([k, v], i) => `<button class="chip" data-t="${k}" aria-pressed="${i === 0}">${v}</button>`).join("")}
    </div>
    <div class="courses" id="hc">${courses.slice(0, 8).map((c) => courseCard(c, st)).join("") || `<div class="empty">الكورسات جايين قريباً.</div>`}</div>
  </div></section>

  <section class="dark section split"><div class="wrap">
    <span class="kicker" style="justify-content:center">جوج طرق باش تتعلّم</span>
    <h2>خلّص على كل كورس… ولا حل المكتبة كاملة</h2>
    <p class="muted" style="max-width:56ch;margin:0 auto 2.5rem">اشري الكورس اللي محتاج دابا ويبقى عندك ديما، ولا اشترك فبلس وتعلّم كلشي بثمن واحد.</p>
    <div class="plans-host">${plansHTML("yearly")}</div>
  </div></section>

  <section class="section"><div class="wrap">
    <span class="kicker">كيفاش كتخدم المنصة</span>
    <h2>من التسجيل حتى أول بيعة</h2>
    <ol class="steps">
      <li><h3>دير حساب مجاني</h3><p class="muted">بالإيميل ديالك، فدقيقة.</p></li>
      <li><h3>جرّب الدرس المجاني</h3><p class="muted">كل كورس فيه درس مفتوح باش تعرف واش كيناسبك.</p></li>
      <li><h3>اشري ولا اشترك</h3><p class="muted">كتخلص بالتحويل ولا CashPlus، وكنفتحو ليك الكورس.</p></li>
      <li><h3>تعلّم وطبّق</h3><p class="muted">الدروس كتبقى عندك، وكتتبّع التقدم ديالك.</p></li>
    </ol>
  </div></section>
  `);
  bindPlans($main.querySelector(".split"));
  $main.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => {
    $main.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === b));
    const list = b.dataset.t ? courses.filter((c) => c.track === b.dataset.t) : courses;
    document.getElementById("hc").innerHTML = list.slice(0, 8).map((c) => courseCard(c, st)).join("") || `<div class="empty">ما كاين حتى كورس فهاد المسار دابا.</div>`;
  }));
}

function pagePricing() {
  view(`<section class="dark hero" style="padding-bottom:5rem"><div class="wrap">
    <span class="pill-badge"><i></i>ecommaroc بلس</span>
    <h1>تعلّم كلشي.<span class="l2">باشتراك واحد.</span></h1>
    <p class="lead">${esc(CFG.PAYMENT_INFO || "")}</p>
    <div class="plans-host">${plansHTML("yearly")}</div>
  </div></section>`);
  bindPlans($main.querySelector(".hero"));
}

async function pageTracks() {
  const courses = await getCourses().catch(() => []);
  const desc = { ecommerce: "اختيار المنتج، المتجر، الدفع عند الاستلام، والإعلانات.", ai: "صور وفيديوهات وإعلانات بالذكاء الاصطناعي، بلا مصور.", claude: "بني Skills كتخدم بلاصتك وأتمت البحث والمحتوى." };
  const words = { ecommerce: "متجر", ai: "AI", claude: "Claude" };
  view(`<section class="section"><div class="wrap">
    <span class="kicker">المسارات</span><h1 style="font-size:clamp(2rem,4vw,3rem)">اختار المسار ديالك</h1>
    <div class="courses" style="margin-top:2rem">${Object.entries(TRACKS).map(([k, v]) => `<a class="course" href="#/courses?track=${k}">
      ${tile({ track: k, cover_word: words[k] })}
      <div class="body"><h3>${v}</h3><p class="muted" style="margin:0">${desc[k]}</p>
      <div class="meta"><span>${courses.filter((c) => c.track === k).length} كورسات</span><span class="more">شوف</span></div></div></a>`).join("")}</div>
  </div></section>`);
}

async function pageCourses(params) {
  loading();
  const track = params.get("track") || "";
  const [courses, st] = await Promise.all([getCourses().catch(() => []), lessonStats().catch(() => ({}))]);
  const list = track ? courses.filter((c) => c.track === track) : courses;
  const chips = [["", "الكل"], ...Object.entries(TRACKS)]
    .map(([k, v]) => `<button class="chip" data-t="${k}" aria-pressed="${k === track}">${v}</button>`).join("");
  view(`<section class="section sand"><div class="wrap">
    <span class="kicker">المكتبة</span><h1 style="font-size:clamp(2rem,4vw,3rem)">كل الكورسات</h1>
    <div class="filters" role="group" aria-label="فلتر حسب المسار">${chips}</div>
    <div class="courses">${list.map((c) => courseCard(c, st)).join("") || `<div class="empty">ما كاين حتى دورة فهاد المسار دابا.</div>`}</div>
  </div></section>`);
  $main.querySelectorAll(".chip").forEach((b) => b.addEventListener("click", () => go("/courses" + (b.dataset.t ? "?track=" + b.dataset.t : ""))));
}

async function pageCourse(slug) {
  loading();
  const c = await getCourseBySlug(slug);
  if (!c) return view(`<div class="section narrow"><div class="empty">هاد الدورة ما كايناش. <a href="#/courses">رجع للدورات</a></div></div>`);
  const [lessons, enr] = await Promise.all([getOutline(c.id), myEnrollment(c.id)]);
  const access = isAdmin() || enr?.status === "active" || (hasPlus() && c.in_plus !== false);
  let done = new Set();
  if (LIVE && session && lessons.length) {
    const { data } = await sb.from("progress").select("lesson_id").in("lesson_id", lessons.map((l) => l.id));
    done = new Set((data || []).map((r) => r.lesson_id));
  }

  let box;
  if (access) box = `<p class="free">${hasPlus() && enr?.status !== "active" ? "مفتوحة ليك ببلس ✓" : "الكورس مفتوح ليك ✓"}</p>${lessons[0] ? `<a class="btn btn-red btn-block" href="#/lesson/${lessons[0].id}">بدا التعلم</a>` : ""}`;
  else if (enr?.status === "pending") box = `<p><span class="pill pending">الطلب ديالك كيتراجع</span></p><p class="muted">${esc(CFG.PAYMENT_INFO || "")}</p>${waLink(`سلام، طلبت الدورة: ${c.title}`)}`;
  else if (!session) box = `<a class="btn btn-red btn-block" href="#/signup?next=/course/${encodeURIComponent(c.slug)}">سجّل باش تطلب الدورة</a><p class="muted" style="margin-top:.8rem">عندك حساب؟ <a href="#/login?next=/course/${encodeURIComponent(c.slug)}">دخول</a></p>`;
  else box = `<button class="btn btn-red btn-block" id="enroll">${Number(c.price_mad) > 0 ? "اطلب الدورة" : "سجّل فالدورة مجاناً"}</button><p class="muted" style="margin-top:.8rem;font-size:.92rem">${esc(CFG.PAYMENT_INFO || "")}</p>`;

  view(`
  <div class="course-head dark"><div class="wrap">
    <p class="kicker"><a href="#/courses?track=${esc(c.track)}" style="text-decoration:none">${esc(TRACKS[c.track] || "")}</a></p>
    <h1 style="font-size:clamp(1.8rem,4vw,2.7rem);max-width:24ch">${esc(c.title)}</h1>
    <p class="muted" style="max-width:62ch;font-size:1.1rem">${esc(c.summary || "")}</p>
  </div></div>
  <section class="section" style="padding-top:2.5rem"><div class="wrap course-grid">
    <div>
      <h2>على هاد الدورة</h2>
      <p style="max-width:65ch;white-space:pre-line">${esc(c.description || "")}</p>
      <h2 style="margin-top:2rem">الدروس (${lessons.length})</h2>
      <ol class="lessons">${lessons.map((l, i) => {
        const open = access || l.is_free;
        return `<li><span class="n">${i + 1}</span><span class="t">${open ? `<a href="#/lesson/${l.id}">${esc(l.title)}</a>` : esc(l.title)}</span>
          ${done.has(l.id) ? `<span class="done" aria-label="مكمّل">✓</span>` : ""}
          ${l.duration_min ? `<span class="tag">${l.duration_min} د</span>` : ""}
          ${l.is_free && !access ? `<span class="free">مجاني</span>` : open ? "" : `<span class="lock">مقفول</span>`}</li>`;
      }).join("") || `<li class="muted">الدروس جايين قريباً.</li>`}</ol>
    </div>
    <aside class="buybox">${tile(c)}<div class="inner"><span class="price">${mad(c.price_mad)}${c.old_price_mad ? `<s>${mad(c.old_price_mad)}</s>` : ""}</span>${box}${!access && c.in_plus !== false ? `<p class="muted" style="margin:1rem 0 0;font-size:.92rem">ولا حل كاع الكورسات مع <a href="#/pricing">ecommaroc بلس</a>.</p>` : ""}</div></aside>
  </div></section>`);

  document.getElementById("enroll")?.addEventListener("click", async (e) => {
    e.target.disabled = true;
    const { error } = await sb.from("enrollments").insert({ user_id: session.user.id, course_id: c.id });
    if (error) { toast("وقع مشكل، عاود جرّب"); e.target.disabled = false; return; }
    toast("توصلنا بالطلب ديالك");
    pageCourse(slug);
  });
}

function waLink(text) {
  if (!CFG.WHATSAPP) return "";
  return `<a class="btn btn-ghost" style="width:100%;margin-top:.6rem" target="_blank" rel="noopener" href="https://wa.me/${esc(CFG.WHATSAPP)}?text=${encodeURIComponent(text)}">راسلنا فواتساب</a>`;
}

async function pageLesson(id) {
  loading();
  if (!LIVE) {
    const l = DEMO.lessons.find((x) => x.id === id);
    return view(`<section class="section narrow">${embed(null)}<h1 style="margin-top:1.5rem;font-size:1.8rem">${esc(l?.title || "")}</h1><p class="notice">هادي نسخة تجريبية. الفيديوهات غادي يبانو منين نربطو قاعدة البيانات.</p></section>`);
  }
  const { data: l } = await sb.from("lessons").select("*").eq("id", id).maybeSingle();
  if (!l) {
    return view(`<section class="section narrow"><div class="empty">هاد الدرس مقفول. ${session ? "اطلب الدورة باش يتفتح ليك." : `<a href="#/login">دخل لحسابك</a> ولا سجّل باش تطلب الدورة.`}</div></section>`);
  }
  const [{ data: c }, outline] = await Promise.all([
    sb.from("courses").select("slug,title").eq("id", l.course_id).maybeSingle(),
    getOutline(l.course_id),
  ]);
  const idx = outline.findIndex((x) => x.id === l.id);
  const next = outline[idx + 1];
  let isDone = false;
  if (session) {
    const { data } = await sb.from("progress").select("lesson_id").eq("lesson_id", l.id).maybeSingle();
    isDone = Boolean(data);
  }
  view(`<section class="section" style="padding-top:2rem"><div class="wrap" style="max-width:960px">
    <p class="tag"><a href="#/course/${encodeURIComponent(c?.slug || "")}">${esc(c?.title || "")}</a> · الدرس ${idx + 1} من ${outline.length}</p>
    ${embed(l.video_url)}
    <h1 style="margin-top:1.5rem;font-size:clamp(1.5rem,3vw,2rem)">${esc(l.title)}</h1>
    ${l.content ? `<div style="max-width:68ch;white-space:pre-line">${esc(l.content)}</div>` : ""}
    <div class="actions" style="margin-top:1.5rem">
      ${session ? `<button class="btn ${isDone ? "btn-ghost" : "btn-red"}" id="mark">${isDone ? "مكمّل ✓" : "كمّلت هاد الدرس"}</button>` : ""}
      ${next ? `<a class="btn btn-ghost" href="#/lesson/${next.id}">الدرس الجاي</a>` : ""}
    </div>
  </div></section>`);
  document.getElementById("mark")?.addEventListener("click", async () => {
    if (isDone) await sb.from("progress").delete().eq("lesson_id", l.id).eq("user_id", session.user.id);
    else await sb.from("progress").insert({ user_id: session.user.id, lesson_id: l.id });
    toast(isDone ? "تحيّد" : "برافو! كمّلتي الدرس");
    pageLesson(id);
  });
}

/* ---------- الدخول والتسجيل ---------- */
function notLive() {
  return `<p class="notice">الحسابات غادي يتفعّلو منين نربطو الموقع بقاعدة البيانات (Supabase).</p>`;
}

function pageLogin(params) {
  const next = params.get("next") || "/account";
  view(`<section class="section"><div class="narrow" style="max-width:460px">
    <h1 style="font-size:2rem">دخول</h1>
    ${LIVE ? "" : notLive()}
    <form class="card form" id="f">
      <div class="field"><label for="em">الإيميل</label><input id="em" type="email" required autocomplete="email"></div>
      <div class="field"><label for="pw">كلمة السر</label><input id="pw" type="password" required autocomplete="current-password" minlength="6"></div>
      <p class="err" id="e" hidden></p>
      <button class="btn btn-red" ${LIVE ? "" : "disabled"}>دخول</button>
      <p class="muted" style="margin:0">ما عندكش حساب؟ <a href="#/signup?next=${encodeURIComponent(next)}">سجّل مجاناً</a> · <a href="#/reset">نسيتي كلمة السر؟</a></p>
    </form>
  </div></section>`);
  document.getElementById("f").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const $e = document.getElementById("e");
    const { error } = await sb.auth.signInWithPassword({ email: em.value.trim(), password: pw.value });
    if (error) { $e.hidden = false; $e.textContent = "الإيميل ولا كلمة السر غالطين."; return; }
    await loadAuth(); go(next);
  });
}

function pageSignup(params) {
  const next = params.get("next") || "/account";
  view(`<section class="section"><div class="narrow" style="max-width:460px">
    <h1 style="font-size:2rem">دير حساب مجاني</h1>
    ${LIVE ? "" : notLive()}
    <form class="card form" id="f">
      <div class="field"><label for="fn">الاسم الكامل</label><input id="fn" required autocomplete="name"></div>
      <div class="field"><label for="ph">رقم الهاتف (واتساب)</label><input id="ph" type="tel" autocomplete="tel" placeholder="06XXXXXXXX"></div>
      <div class="field"><label for="em">الإيميل</label><input id="em" type="email" required autocomplete="email"></div>
      <div class="field"><label for="pw">كلمة السر (8 حروف على الأقل، فيها حروف وأرقام)</label><input id="pw" type="password" required minlength="8" pattern="(?=.*[A-Za-z])(?=.*\d).{8,}" title="8 حروف على الأقل، فيها حروف وأرقام" autocomplete="new-password"></div>
      <p class="err" id="e" hidden></p>
      <button class="btn btn-red" ${LIVE ? "" : "disabled"}>دير الحساب</button>
      <p class="muted" style="margin:0">عندك حساب؟ <a href="#/login?next=${encodeURIComponent(next)}">دخول</a></p>
    </form>
  </div></section>`);
  document.getElementById("f").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const $e = document.getElementById("e");
    const { data, error } = await sb.auth.signUp({
      email: em.value.trim(), password: pw.value,
      options: { data: { full_name: fn.value.trim(), phone: ph.value.trim() }, emailRedirectTo: location.origin + "/#" + next },
    });
    if (error) { $e.hidden = false; $e.textContent = error.message.includes("registered") ? "هاد الإيميل عندو حساب من قبل." : "وقع مشكل: " + error.message; return; }
    if (!data.session) {
      return view(`<section class="section narrow" style="max-width:520px"><div class="card"><h2>شوف الإيميل ديالك 📩</h2><p>صيفطنا ليك رابط التأكيد لـ <b>${esc(em.value)}</b>. ضغط عليه باش يتفعّل الحساب.</p></div></section>`);
    }
    await loadAuth(); go(next);
  });
}

function pageReset() {
  view(`<section class="section"><div class="narrow" style="max-width:460px">
    <h1 style="font-size:2rem">نسيتي كلمة السر؟</h1>
    <form class="card form" id="f">
      <div class="field"><label for="em">الإيميل</label><input id="em" type="email" required></div>
      <button class="btn btn-red" ${LIVE ? "" : "disabled"}>صيفط ليا رابط جديد</button>
    </form></div></section>`);
  document.getElementById("f").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    await sb.auth.resetPasswordForEmail(em.value.trim(), { redirectTo: location.origin + "/#/new-password" });
    toast("إلى كان عندك حساب، غادي يوصلك رابط فالإيميل");
  });
}

function pageNewPassword() {
  view(`<section class="section"><div class="narrow" style="max-width:460px">
    <h1 style="font-size:2rem">كلمة سر جديدة</h1>
    <form class="card form" id="f">
      <div class="field"><label for="pw">كلمة السر الجديدة (8 حروف على الأقل، فيها حروف وأرقام)</label><input id="pw" type="password" required minlength="8" pattern="(?=.*[A-Za-z])(?=.*\d).{8,}" title="8 حروف على الأقل، فيها حروف وأرقام" autocomplete="new-password"></div>
      <button class="btn btn-red">حفظ</button>
    </form></div></section>`);
  document.getElementById("f").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const { error } = await sb.auth.updateUser({ password: pw.value });
    toast(error ? "وقع مشكل، عاود طلب رابط جديد" : "تبدلات كلمة السر");
    if (!error) go("/account");
  });
}

/* ---------- حساب الطالب ---------- */
async function pageAccount() {
  if (!session) return go("/login?next=/account");
  loading();
  const { data: enr } = await sb.from("enrollments").select("status,created_at,courses(id,slug,title,summary,track,price_mad,old_price_mad,cover_url,cover_word,badge,in_plus,level)").eq("user_id", session.user.id).order("created_at", { ascending: false });
  const rows = (enr || []).filter((e) => e.courses);
  view(`<section class="section"><div class="wrap">
    <h1 style="font-size:2.2rem">مرحبا ${esc(profile?.full_name || "")} 👋</h1>
    <div class="card" style="margin-top:1rem;display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap">
      ${hasPlus() ? `<div><span class="pill plus">بلس</span> <b>الاشتراك ديالك خدّام</b> حتى ${fmtDate(profile.plus_until)}</div>`
        : profile?.plus_request ? `<div><span class="pill pending">طلب بلس كيتراجع</span> <span class="muted">${esc(CFG.PAYMENT_INFO || "")}</span></div>`
        : `<div><b>ecommaroc بلس</b><p class="muted" style="margin:0">حل جميع الكورسات باشتراك واحد.</p></div><a class="btn btn-red btn-sm" href="#/pricing">شوف الاشتراك</a>`}
    </div>
    <h2 style="margin-top:2rem">دوراتي</h2>
    ${rows.length ? `<div class="courses">${rows.map((e) => `<div>${courseCard(e.courses)}<p style="margin-top:.5rem"><span class="pill ${e.status}">${{ pending: "كيتراجع", active: "مفتوحة", rejected: "مرفوض" }[e.status]}</span></p></div>`).join("")}</div>`
      : `<div class="empty">باقي ما طلبتي حتى دورة. <a href="#/courses">شوف الدورات</a></div>`}
    <h2 style="margin-top:3rem">المعلومات ديالي</h2>
    <form class="card form" id="pf" style="max-width:520px">
      <div class="field"><label for="fn">الاسم</label><input id="fn" value="${esc(profile?.full_name || "")}"></div>
      <div class="field"><label for="ph">الهاتف</label><input id="ph" value="${esc(profile?.phone || "")}"></div>
      <p class="muted" style="margin:0">الإيميل: ${esc(session.user.email)}</p>
      <button class="btn btn-red">حفظ</button>
    </form>
  </div></section>`);
  document.getElementById("pf").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const { error } = await sb.from("profiles").update({ full_name: fn.value.trim(), phone: ph.value.trim() }).eq("id", session.user.id);
    toast(error ? "ما تحفظش" : "تحفظ");
    await loadAuth();
  });
}

/* ================= لوحة الأدمن ================= */
function adminTabs(on) {
  const t = [["requests", "الطلبات"], ["courses", "الدورات"], ["students", "الطلبة"]];
  return `<nav class="tabs">${t.map(([k, v]) => `<a href="#/admin/${k}" class="${on === k ? "on" : ""}">${v}</a>`).join("")}</nav>`;
}
function guardAdmin() {
  if (!LIVE) { view(`<section class="section narrow">${notLive()}</section>`); return false; }
  if (!session) { go("/login?next=/admin"); return false; }
  if (!isAdmin()) { view(`<section class="section narrow"><div class="empty">هاد الصفحة غير للأدمن.</div></section>`); return false; }
  return true;
}

async function pageAdmin(tab = "requests") {
  if (!guardAdmin()) return;
  loading();
  if (tab === "courses") return adminCourses();
  if (tab === "students") return adminStudents();

  const [{ data: enr }, { count: nStudents }, { count: nCourses }] = await Promise.all([
    sb.from("enrollments").select("id,status,created_at,user_id,course_id,courses(title,price_mad)").order("created_at", { ascending: false }).limit(200),
    sb.from("profiles").select("id", { count: "exact", head: true }),
    sb.from("courses").select("id", { count: "exact", head: true }),
  ]);
  const { count: plusReq } = await sb.from("profiles").select("id", { count: "exact", head: true }).not("plus_request", "is", null);
  const ids = [...new Set((enr || []).map((e) => e.user_id))];
  const { data: profs } = ids.length ? await sb.from("profiles").select("id,full_name,phone").in("id", ids) : { data: [] };
  const P = Object.fromEntries((profs || []).map((p) => [p.id, p]));
  const pending = (enr || []).filter((e) => e.status === "pending");
  const revenue = (enr || []).filter((e) => e.status === "active").reduce((s, e) => s + (e.courses?.price_mad || 0), 0);

  view(`<section class="section"><div class="wrap">
    <h1 style="font-size:2.2rem">لوحة الأدمن</h1>
    ${adminTabs("requests")}
    <div class="stats">
      <div class="stat"><b>${pending.length}</b>طلبات كيتسناو</div>
      <div class="stat"><b>${nStudents ?? 0}</b>حسابات</div>
      <div class="stat"><b>${nCourses ?? 0}</b>دورات</div>
      <div class="stat"><b>${plusReq ?? 0}</b>طلبات بلس (شوف "الطلبة")</div>
      <div class="stat"><b>${revenue.toLocaleString("fr-MA")}</b>درهم (دورات مفتوحة)</div>
    </div>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>الطالب</th><th>الهاتف</th><th>الدورة</th><th>الثمن</th><th>التاريخ</th><th>الحالة</th><th></th></tr></thead>
      <tbody>${(enr || []).map((e) => `<tr>
        <td>${esc(P[e.user_id]?.full_name || "—")}</td>
        <td dir="ltr" style="text-align:end">${esc(P[e.user_id]?.phone || "—")}</td>
        <td>${esc(e.courses?.title || "")}</td>
        <td>${mad(e.courses?.price_mad)}</td>
        <td>${fmtDate(e.created_at)}</td>
        <td><span class="pill ${e.status}">${{ pending: "كيتسنى", active: "مفتوح", rejected: "مرفوض" }[e.status]}</span></td>
        <td class="actions">
          ${e.status !== "active" ? `<button class="btn btn-red btn-sm" data-a="active" data-id="${e.id}">قبول</button>` : ""}
          ${e.status === "pending" ? `<button class="btn btn-danger btn-sm" data-a="rejected" data-id="${e.id}">رفض</button>` : ""}
          ${e.status === "active" ? `<button class="btn btn-ghost btn-sm" data-a="pending" data-id="${e.id}">سدّ</button>` : ""}
        </td></tr>`).join("") || `<tr><td colspan="7" class="muted">ما كاين حتى طلب دابا.</td></tr>`}</tbody>
    </table></div>
  </div></section>`);
  $main.querySelectorAll("[data-a]").forEach((b) => b.addEventListener("click", async () => {
    b.disabled = true;
    const { error } = await sb.from("enrollments").update({ status: b.dataset.a }).eq("id", b.dataset.id);
    toast(error ? "ما تبدلش" : "تبدّل");
    pageAdmin("requests");
  }));
}

async function adminCourses() {
  const courses = await getCourses({ all: true });
  view(`<section class="section"><div class="wrap">
    <h1 style="font-size:2.2rem">لوحة الأدمن</h1>
    ${adminTabs("courses")}
    <p><a class="btn btn-red" href="#/admin/course/new">زيد دورة جديدة</a></p>
    <div class="table-wrap"><table class="table">
      <thead><tr><th>الدورة</th><th>المسار</th><th>الثمن</th><th>الحالة</th><th></th></tr></thead>
      <tbody>${courses.map((c) => `<tr>
        <td><b>${esc(c.title)}</b></td><td>${esc(TRACKS[c.track] || "")}</td><td>${mad(c.price_mad)}</td>
        <td><span class="pill ${c.published ? "active" : "draft"}">${c.published ? "منشورة" : "مسودة"}</span></td>
        <td class="actions"><a class="btn btn-ghost btn-sm" href="#/admin/course/${c.id}">تعديل والدروس</a><a class="btn btn-ghost btn-sm" href="#/course/${encodeURIComponent(c.slug)}">شوف</a></td>
      </tr>`).join("") || `<tr><td colspan="5" class="muted">ما كاين حتى دورة.</td></tr>`}</tbody>
    </table></div>
  </div></section>`);
}

async function adminCourseEdit(id) {
  if (!guardAdmin()) return;
  loading();
  const isNew = id === "new";
  const c = isNew ? { title: "", slug: "", summary: "", description: "", track: "ecommerce", level: "مبتدئ", price_mad: 0, old_price_mad: null, cover_word: "", badge: "", in_plus: true, cover_url: "", published: false, position: 0 }
    : (await sb.from("courses").select("*").eq("id", id).maybeSingle()).data;
  if (!c) return view(`<section class="section narrow"><div class="empty">الدورة ما كايناش.</div></section>`);
  const lessons = isNew ? [] : ((await sb.from("lessons").select("*").eq("course_id", id).order("position")).data || []);

  const lessonForm = (l, i) => `<details class="lesson-edit" ${l.id ? "" : "open"}>
    <summary><span>${l.id ? `${i + 1}. ${esc(l.title)}` : "درس جديد"}</span>${l.is_free ? `<span class="free">مجاني</span>` : ""}</summary>
    <form class="form lf" data-id="${l.id || ""}" style="margin-top:1rem">
      <div class="field"><label>عنوان الدرس</label><input name="title" required value="${esc(l.title || "")}"></div>
      <div class="field"><label>رابط الفيديو (YouTube غير مُدرج، Vimeo، ولا رابط mp4)</label><input name="video_url" dir="ltr" value="${esc(l.video_url || "")}" placeholder="https://youtu.be/..."></div>
      <div class="field"><label>الشرح / الملاحظات</label><textarea name="content">${esc(l.content || "")}</textarea></div>
      <div class="row">
        <div class="field"><label>الترتيب</label><input name="position" type="number" value="${l.position ?? i + 1}"></div>
        <div class="field"><label>المدة (بالدقايق)</label><input name="duration_min" type="number" value="${l.duration_min ?? ""}"></div>
      </div>
      <label class="check"><input type="checkbox" name="is_free" ${l.is_free ? "checked" : ""}> درس مجاني (يبان للكل)</label>
      <div class="actions"><button class="btn btn-red btn-sm">حفظ الدرس</button>${l.id ? `<button type="button" class="btn btn-danger btn-sm" data-del="${l.id}">مسح</button>` : ""}</div>
    </form></details>`;

  view(`<section class="section"><div class="wrap" style="max-width:860px">
    <p><a href="#/admin/courses">رجوع للدورات</a></p>
    <h1 style="font-size:2rem">${isNew ? "دورة جديدة" : "تعديل: " + esc(c.title)}</h1>
    <form class="card form" id="cf">
      <div class="field"><label for="t">العنوان</label><input id="t" required value="${esc(c.title)}"></div>
      <div class="field"><label for="sl">الرابط (بالحروف اللاتينية)</label><input id="sl" dir="ltr" value="${esc(c.slug)}" placeholder="ecommerce-maroc-0"></div>
      <div class="field"><label for="su">وصف قصير</label><input id="su" value="${esc(c.summary || "")}"></div>
      <div class="field"><label for="de">الوصف الكامل</label><textarea id="de">${esc(c.description || "")}</textarea></div>
      <div class="row">
        <div class="field"><label for="tr">المسار</label><select id="tr">${Object.entries(TRACKS).map(([k, v]) => `<option value="${k}" ${c.track === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
        <div class="field"><label for="lv">المستوى</label><input id="lv" value="${esc(c.level || "")}"></div>
      </div>
      <div class="row">
        <div class="field"><label for="pr">الثمن (درهم، 0 = مجاني)</label><input id="pr" type="number" min="0" value="${c.price_mad}"></div>
        <div class="field"><label for="po">الترتيب</label><input id="po" type="number" value="${c.position || 0}"></div>
      </div>
      <div class="row">
        <div class="field"><label for="op">الثمن القديم (مشطّب، اختياري)</label><input id="op" type="number" min="0" value="${c.old_price_mad ?? ""}"></div>
        <div class="field"><label for="bd">شارة (مثال: الأكثر طلباً / جديد)</label><input id="bd" value="${esc(c.badge || "")}"></div>
      </div>
      <div class="field"><label for="cw">الكلمة الكبيرة فالكارت (كلمة وحدة)</label><input id="cw" value="${esc(c.cover_word || "")}" placeholder="متجر"></div>
      <div class="field"><label for="cv">رابط صورة الغلاف (اختياري، كتعوّض الكلمة)</label><input id="cv" dir="ltr" value="${esc(c.cover_url || "")}"></div>
      <label class="check"><input type="checkbox" id="pu" ${c.published ? "checked" : ""}> منشورة (تبان فالموقع)</label>
      <label class="check"><input type="checkbox" id="ip" ${c.in_plus !== false ? "checked" : ""}> داخلة فاشتراك بلس</label>
      <div class="actions"><button class="btn btn-red">${isNew ? "زيد الدورة" : "حفظ التغييرات"}</button>${isNew ? "" : `<button type="button" class="btn btn-danger" id="delc">مسح الدورة</button>`}</div>
    </form>
    ${isNew ? `<p class="muted" style="margin-top:1rem">من بعد ما تزيد الدورة، غادي تقدر تزيد الدروس ديالها.</p>` : `
      <h2 style="margin-top:2.5rem">الدروس</h2>
      <div id="ls">${lessons.map(lessonForm).join("")}</div>
      <button class="btn btn-ghost" id="addl">زيد درس</button>`}
  </div></section>`);

  document.getElementById("cf").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const row = { title: t.value.trim(), slug: slugify(sl.value || t.value), summary: su.value.trim(), description: de.value, track: tr.value, level: lv.value.trim(), price_mad: Number(pr.value) || 0, position: Number(po.value) || 0, cover_url: cv.value.trim() || null, published: pu.checked, old_price_mad: Number(op.value) || null, badge: bd.value.trim() || null, cover_word: cw.value.trim() || null, in_plus: ip.checked };
    const res = isNew ? await sb.from("courses").insert(row).select().single() : await sb.from("courses").update(row).eq("id", id).select().single();
    if (res.error) return toast(res.error.message.includes("duplicate") ? "هاد الرابط مستعمل، بدلو" : "ما تحفظش");
    toast("تحفظت الدورة");
    if (isNew) go("/admin/course/" + res.data.id);
  });
  document.getElementById("delc")?.addEventListener("click", async () => {
    if (!confirm("متأكد بغيتي تمسح هاد الدورة وكل الدروس ديالها؟")) return;
    await sb.from("courses").delete().eq("id", id);
    toast("تمسحات"); go("/admin/courses");
  });
  const bindLessons = () => {
    $main.querySelectorAll("form.lf").forEach((f) => f.onsubmit = async (ev) => {
      ev.preventDefault();
      const fd = new FormData(f);
      const row = { course_id: id, title: fd.get("title").trim(), video_url: fd.get("video_url").trim() || null, content: fd.get("content"), position: Number(fd.get("position")) || 0, duration_min: Number(fd.get("duration_min")) || null, is_free: fd.get("is_free") === "on" };
      const { error } = f.dataset.id ? await sb.from("lessons").update(row).eq("id", f.dataset.id) : await sb.from("lessons").insert(row);
      toast(error ? "ما تحفظش الدرس" : "تحفظ الدرس");
      if (!error) adminCourseEdit(id);
    });
    $main.querySelectorAll("[data-del]").forEach((b) => b.onclick = async () => {
      if (!confirm("نمسحو هاد الدرس؟")) return;
      await sb.from("lessons").delete().eq("id", b.dataset.del);
      toast("تمسح"); adminCourseEdit(id);
    });
  };
  bindLessons();
  document.getElementById("addl")?.addEventListener("click", (e) => {
    document.getElementById("ls").insertAdjacentHTML("beforeend", lessonForm({ position: lessons.length + 1 }, lessons.length));
    e.target.hidden = true;
    bindLessons();
  });
}

async function adminStudents() {
  const [{ data: profs }, { data: enr }] = await Promise.all([
    sb.from("profiles").select("*").order("created_at", { ascending: false }),
    sb.from("enrollments").select("user_id,status"),
  ]);
  const count = {};
  (enr || []).forEach((e) => { if (e.status === "active") count[e.user_id] = (count[e.user_id] || 0) + 1; });
  view(`<section class="section"><div class="wrap">
    <h1 style="font-size:2.2rem">لوحة الأدمن</h1>
    ${adminTabs("students")}
    <div class="table-wrap"><table class="table">
      <thead><tr><th>الاسم</th><th>الهاتف</th><th>الدور</th><th>دورات مفتوحة</th><th>بلس</th><th>تاريخ التسجيل</th><th></th></tr></thead>
      <tbody>${(profs || []).map((p) => `<tr><td>${esc(p.full_name || "—")}</td><td dir="ltr" style="text-align:end">${esc(p.phone || "—")}</td>
        <td>${p.role === "admin" ? `<span class="pill active">أدمن</span>` : "طالب"}</td><td>${count[p.id] || 0}</td>
        <td>${p.plus_until && new Date(p.plus_until) > new Date() ? `<span class="pill plus">حتى ${fmtDate(p.plus_until)}</span>` : p.plus_request ? `<span class="pill pending">طلب ${{ monthly: "شهري", yearly: "سنوي", team: "فريق" }[p.plus_request]}</span>` : "—"}</td>
        <td>${fmtDate(p.created_at)}</td>
        <td class="actions"><button class="btn btn-ghost btn-sm" data-plus="${p.id}" data-d="31">بلس شهر</button><button class="btn btn-ghost btn-sm" data-plus="${p.id}" data-d="366">بلس عام</button>${p.plus_until ? `<button class="btn btn-danger btn-sm" data-plus="${p.id}" data-d="0">وقّف</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="7" class="muted">ما كاين حتى طالب دابا.</td></tr>`}</tbody>
    </table></div>
    <p class="muted" style="margin-top:1rem">باش تفتح كورس لشي طالب، سير لـ "الطلبات" وضغط "قبول". باش تفعّل بلس، ضغط "بلس شهر" ولا "بلس عام".</p>
  </div></section>`);
  $main.querySelectorAll("[data-plus]").forEach((b) => b.addEventListener("click", async () => {
    const d = Number(b.dataset.d);
    const cur = (profs || []).find((x) => x.id === b.dataset.plus);
    const base = cur?.plus_until && new Date(cur.plus_until) > new Date() ? new Date(cur.plus_until) : new Date();
    const until = d ? new Date(base.getTime() + d * 864e5).toISOString() : null;
    const { error } = await sb.from("profiles").update({ plus_until: until, plus_request: null }).eq("id", b.dataset.plus);
    toast(error ? "ما تبدلش" : d ? "تفعّل بلس" : "توقف بلس");
    adminStudents();
  }));
}

/* ================= الموجّه (Router) ================= */
async function router() {
  const raw = location.hash.slice(1) || "/";
  // روابط Supabase (تأكيد الإيميل / استرجاع كلمة السر) كتجي فـ hash فيه access_token
  if (raw.includes("access_token") || raw.includes("type=recovery")) {
    await new Promise((r) => setTimeout(r, 300));
    await loadAuth();
    if (raw.includes("type=recovery")) return go("/new-password");
    return go("/account");
  }
  const [path, qs] = raw.split("?");
  const params = new URLSearchParams(qs || "");
  const parts = path.split("/").filter(Boolean);
  renderNav(path);
  try {
    if (!parts.length) return await pageHome();
    switch (parts[0]) {
      case "courses": return await pageCourses(params);
      case "pricing": return pagePricing();
      case "tracks": return await pageTracks();
      case "course": return await pageCourse(decodeURIComponent(parts[1] || ""));
      case "lesson": return await pageLesson(parts[1]);
      case "login": return pageLogin(params);
      case "signup": return pageSignup(params);
      case "reset": return pageReset();
      case "new-password": return pageNewPassword();
      case "account": return await pageAccount();
      case "logout": if (LIVE) await sb.auth.signOut(); session = null; profile = null; return go("/");
      case "admin":
        if (parts[1] === "course") return await adminCourseEdit(parts[2]);
        return await pageAdmin(parts[1] || "requests");
      default: return view(`<section class="section narrow"><div class="empty">هاد الصفحة ما كايناش. <a href="#/">رجع للرئيسية</a></div></section>`);
    }
  } catch (err) {
    console.error(err);
    view(`<section class="section narrow"><div class="empty">وقع مشكل فالتحميل. عاود جرّب من بعد شوية.</div></section>`);
  }
}

window.addEventListener("hashchange", router);
if (LIVE) sb.auth.onAuthStateChange((_e, s) => { session = s; });
loadAuth().then(router);
