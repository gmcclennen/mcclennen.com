// Hidden visit counter, backed by Supabase. Each page load records one
// row in `page_views`, then displays the total row count. Styled in
// styles.css to match the page background, so it's invisible unless
// selected/highlighted.
const SUPABASE_URL = "https://dsvjhmmnfjunkwabrtzz.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_oSZ_xUe6OELppmvK6UXjzA_fqvJZtv3";

(function () {
  const counterEl = document.getElementById("visit-counter");
  if (!counterEl) return;

  if (typeof supabase === "undefined") return;

  const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  async function recordVisitAndShowCount() {
    // Record this visit. Don't block showing a count on this succeeding.
    await client.from("page_views").insert({});

    const { count, error } = await client
      .from("page_views")
      .select("*", { count: "exact", head: true });

    if (error || typeof count !== "number") return;

    counterEl.textContent = String(count);
  }

  recordVisitAndShowCount();
})();
