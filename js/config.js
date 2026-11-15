/**
 * Config link theo domain + support / admin.
 * Key domain: hostname không có www.
 */
window.SITE_CONFIG = {
  defaultLink: "",

  // Support contacts (fallback nếu domain không khớp)
  telegramUrl: "",
  zaloUrl: "", // bỏ Zalo

  // Admin login (local)
  admin: {
    username: "admin",
    password: "admin123",
  },

  linksByDomain: {
    "www.xoamagame.pro": "https://www.mm88q.com/register?affiliateCode=mm88e2e23qc",
    "xoamagame.pro": "https://www.mm88q.com/register?affiliateCode=mm88e2e23qc",
  },

  telegramByDomain: {
    "www.xoamagame.pro": "https://www.mm88q.com/register?affiliateCode=mm88e2e23qc",
    "xoamagame.pro": "https://www.mm88q.com/register?affiliateCode=mm88e2e23qc",
  },

  titleByDomain: {},

  featuredPlatform: "MM88",

  // Thứ tự cổng đang tối ưu (thay danh sách từ API). Cổng featured nhận link CTA.
  platforms: [
    { name: "MM88", ratio: 99 },
    { name: "MB66", ratio: 85 },
    { name: "OPEN88", ratio: 72 },
    { name: "JUN88", ratio: 70 },
    { name: "CM88", ratio: 68 },
    { name: "FLY88", ratio: 60 },
    { name: "GK88", ratio: 58 },
    { name: "F168", ratio: 55 },
    { name: "SC88", ratio: 53 },
    { name: "QH88", ratio: 50 },
  ],
};

function currentHost() {
  return (location.hostname || "").toLowerCase().replace(/^www\./, "");
}

window.getCtaLink = function getCtaLink() {
  const host = currentHost();
  const map = window.SITE_CONFIG.linksByDomain || {};
  const fromDomain = map[host];
  if (fromDomain) return fromDomain;
  return window.SITE_CONFIG.defaultLink || "";
};

window.getTelegramUrl = function getTelegramUrl() {
  const host = currentHost();
  const map = (window.SITE_CONFIG && window.SITE_CONFIG.telegramByDomain) || {};
  if (map[host]) return map[host];
  return (window.SITE_CONFIG && window.SITE_CONFIG.telegramUrl) || "";
};

window.getZaloUrl = function getZaloUrl() {
  // Luôn trả về chuỗi rỗng nếu muốn ẩn Zalo
  if (window.SITE_CONFIG && Object.prototype.hasOwnProperty.call(window.SITE_CONFIG, "zaloUrl")) {
    return window.SITE_CONFIG.zaloUrl || "";
  }
  return "";
};

window.getPageTitle = function getPageTitle() {
  const host = currentHost();
  const map = (window.SITE_CONFIG && window.SITE_CONFIG.titleByDomain) || {};
  if (map[host]) return map[host];
  if (!host || host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return "xoamagame";
  }
  const name = host.split(".")[0];
  return name || "xoamagame";
};

(function applyPageTitle() {
  if (location.pathname.indexOf("/admin") === 0) return;
  document.title = window.getPageTitle();
})();

window.rewritePlatforms = function rewritePlatforms(list) {
  const featured = (window.SITE_CONFIG && window.SITE_CONFIG.featuredPlatform) || "GG88";
  const cta = typeof window.getCtaLink === "function" ? window.getCtaLink() : "";
  const fixed = window.SITE_CONFIG && window.SITE_CONFIG.platforms;
  if (Array.isArray(fixed) && fixed.length) {
    return fixed.map(function (p, i) {
      const isFeatured = p.name.toUpperCase() === featured.toUpperCase();
      return {
        id: i + 1,
        name: p.name,
        rank: String(i + 1),
        ratio: p.ratio,
        registerUrl: isFeatured && cta ? cta : null,
      };
    });
  }
  if (!Array.isArray(list)) return list;
  const mapped = list.map(function (p) {
    if (!p) return p;
    if (String(p.name || "").toUpperCase() === "U888") {
      return Object.assign({}, p, { name: featured, registerUrl: cta || p.registerUrl });
    }
    if (String(p.name || "").toUpperCase() === featured.toUpperCase() && cta) {
      return Object.assign({}, p, { registerUrl: cta });
    }
    return p;
  });
  const seen = {};
  return mapped.filter(function (p) {
    const key = String((p && p.name) || "").toUpperCase();
    if (!key || seen[key]) return false;
    seen[key] = true;
    return true;
  });
};


// Universal domains.json real-time synchronization
(function() {
  try {
    fetch('/domains.json')
      .then(function(r) { return r.json(); })
      .then(function(dj) {
        if (!dj) return;
        var h = (window.location.hostname || '').toLowerCase();
        var normH = h.replace(/^www\./, '');
        var entry = dj[h] || dj[normH] || dj['www.' + normH];
        if (entry) {
          var target = entry.main_url || entry.url || entry.link || (typeof entry === 'string' ? entry : '');
          if (target) {
            window.REDIRECT_URL = target;
            if (window.SITE_CONFIG) {
              window.SITE_CONFIG.defaultLink = target;
              window.SITE_CONFIG.registerUrl = target;
              if (window.SITE_CONFIG.linksByDomain) {
                window.SITE_CONFIG.linksByDomain[normH] = target;
                window.SITE_CONFIG.linksByDomain[h] = target;
              }
            }
            if (window.LINK_CONFIG) {
              window.LINK_CONFIG.default = target;
              if (window.LINK_CONFIG.domains) {
                window.LINK_CONFIG.domains[normH] = target;
                window.LINK_CONFIG.domains[h] = target;
              }
            }
            if (window.LP_CONFIG) {
              window.LP_CONFIG.gameUrl = target;
            }
            var links = document.querySelectorAll('a.redirect-link, a.btn-register, a.cta-btn');
            for (var i = 0; i < links.length; i++) {
              links[i].href = target;
            }
          }
        }
      })
      .catch(function() {});
  } catch(e) {}
})();
