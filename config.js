// ====== إعدادات الموقع ======
// حط هنا المعلومات ديال Supabase (Project Settings ← API)
window.ECOM_CONFIG = {
  SUPABASE_URL: "https://qjixioecffsozerxikmc.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_BghdQaZRp7mjIw7haPisAg_DLCcIEM6",

  // طريقة الخلاص اللي كتبان للطالب منين يطلب دورة ولا اشتراك
  PAYMENT_INFO: "من بعد الطلب، غادي نتواصلو معاك باش تخلص بالتحويل البنكي ولا CashPlus، ومن بعد كنفتحو ليك الدورة.",

  // رقم واتساب بالصيغة الدولية بلا + (مثال: 2126XXXXXXXX). خليه خاوي إلى ما بغيتيش
  WHATSAPP: "",

  // أثمنة الاشتراك (بالدرهم) — بدلهم كيف بغيتي
  PLUS_MONTHLY: 99,
  PLUS_YEARLY: 790,      // للعام كامل
  TEAM_PER_USER: 79,     // للفرق: لكل شخص فالشهر
  SOLO_FROM: 249         // "كيبدا من" فالشراء الفردي
};
