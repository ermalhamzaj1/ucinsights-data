// Canonical list of items the apps show "Community Discussions" for.
// `query`   -> the phrase used to search r/UlcerativeColitis
// `aliases` -> every string the iOS / Android apps may pass when looking up
//              this item. The query itself is also used as a key.
// The fetch script writes the same posts under the normalized form of every
// key (query + aliases), so both apps resolve regardless of which string they
// pass (iOS uses display names, Android uses the search phrase).

module.exports = [
  // ---------------- Symptoms ----------------
  { query: "diarrhea frequency bowel movements", aliases: ["Diarrhea"] },
  { query: "urgency bathroom emergency", aliases: ["Urgency"] },
  { query: "abdominal pain cramping", aliases: ["Abdominal Pain"] },
  { query: "blood in stool rectal bleeding", aliases: ["Rectal Bleeding"] },
  { query: "fatigue tired exhausted remission", aliases: ["Fatigue"] },
  { query: "mucus in stool", aliases: ["Mucus in Stool"] },
  { query: "bloating gas distension", aliases: ["Bloating"] },
  { query: "nausea vomiting medication", aliases: ["Nausea"] },

  // ---------------- Trigger / avoid foods ----------------
  { query: "coffee UC symptoms urgency", aliases: ["Coffee"] },
  { query: "spicy food UC flare", aliases: ["Spicy Foods", "Spicy food"] },
  { query: "alcohol ulcerative colitis", aliases: ["Alcohol"] },
  { query: "dairy milk UC symptoms", aliases: ["Dairy"] },
  { query: "raw vegetables UC flare", aliases: ["Raw Vegetables"] },
  { query: "fried food IBD symptoms", aliases: ["Fried Foods", "Fried food"] },
  { query: "red meat UC inflammation", aliases: ["Red Meat"] },
  { query: "carbonated drinks IBD gas bloating", aliases: ["Carbonated Drinks"] },
  { query: "fast food IBD symptoms", aliases: ["Fast Food"] },
  { query: "pizza UC flare", aliases: ["Pizza"] },

  // ---------------- Safe foods ----------------
  { query: "banana UC safe food flare", aliases: ["Banana"] },
  { query: "white rice UC diet flare", aliases: ["White Rice"] },
  { query: "chicken UC safe protein", aliases: ["Chicken Breast", "Chicken"] },
  { query: "salmon omega3 UC inflammation", aliases: ["Salmon"] },
  { query: "toast BRAT diet UC", aliases: ["White Toast", "Toast"] },
  { query: "avocado UC diet", aliases: ["Avocado"] },
  { query: "eggs UC safe tolerate", aliases: ["Eggs"] },
  { query: "oatmeal UC diet safe", aliases: ["Oatmeal"] },
  { query: "sweet potato UC diet", aliases: ["Sweet Potato"] },
  { query: "zucchini squash UC diet", aliases: ["Squash"] },
  { query: "applesauce BRAT diet UC", aliases: ["Applesauce"] },
  { query: "turkey lean protein UC diet", aliases: ["Turkey"] },

  // ---------------- Drinks ----------------
  { query: "hydration UC flare electrolytes", aliases: ["Water"] },
  { query: "bone broth gut healing UC", aliases: ["Bone Broth"] },
  { query: "ginger tea inflammation IBD", aliases: ["Ginger Tea"] },
  { query: "peppermint cramping IBD", aliases: ["Peppermint Tea"] },
  { query: "coconut water electrolytes UC", aliases: ["Coconut Water"] },
  { query: "chamomile tea inflammation IBD", aliases: ["Chamomile Tea"] },
  { query: "aloe vera IBD mucosa", aliases: ["Aloe Vera Juice"] },
  { query: "green tea EGCG UC inflammation", aliases: ["Green Tea"] },

  // ---------------- Medications ----------------
  { query: "mesalamine 5-ASA side effects experience", aliases: ["Mesalamine", "Mesalamine (5-ASA)"] },
  { query: "Entyvio vedolizumab experience results", aliases: ["Entyvio", "Entyvio (vedolizumab)"] },
  { query: "Humira adalimumab UC experience", aliases: ["Humira", "Humira (adalimumab)"] },
  { query: "prednisone taper side effects UC", aliases: ["Prednisone"] },
  { query: "azathioprine imuran UC experience results", aliases: ["Azathioprine", "Azathioprine (Imuran)"] },
  { query: "Remicade infliximab infusion experience", aliases: ["Remicade", "Remicade (infliximab)"] },
  { query: "Xeljanz tofacitinib JAK inhibitor UC", aliases: ["Xeljanz", "Xeljanz (tofacitinib)"] },
  { query: "Rinvoq upadacitinib UC experience", aliases: ["Rinvoq", "Rinvoq (upadacitinib)"] },
  { query: "Stelara ustekinumab UC experience", aliases: ["Stelara", "Stelara (ustekinumab)"] },

  // ---------------- Generic fallback (home / hot / top) ----------------
  { query: "ulcerative colitis", aliases: ["ulcerative colitis"] },
];
