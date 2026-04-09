const navbar = document.getElementById("navbar");
const backToTop = document.getElementById("backToTop");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileOverlay = document.getElementById("mobileOverlay");
const mobileClose = document.getElementById("mobileClose");
const mobileBreakpoint = window.matchMedia("(max-width: 900px)");

const imageFallbackOrder = [".avif", ".webp", ".jpeg", ".jpg", ".png"];

function splitImageUrl(src) {
  const hashIndex = src.indexOf("#");
  const hash = hashIndex >= 0 ? src.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? src.slice(0, hashIndex) : src;
  const queryIndex = withoutHash.indexOf("?");
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";
  const path = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

  return { path, query, hash };
}

function getImageExtension(path) {
  const extMatch = path.match(/\.([a-z0-9]+)$/i);
  return extMatch ? `.${extMatch[1].toLowerCase()}` : "";
}

function buildFallbackCandidates(src) {
  const { path, query, hash } = splitImageUrl(src);
  const currentExt = getImageExtension(path);
  if (!currentExt) {
    return [];
  }

  const basePath = path.slice(0, -currentExt.length);
  const prioritizedExts = [];

  if (currentExt === ".heic" || currentExt === ".heif") {
    prioritizedExts.push(...imageFallbackOrder);
  } else if (currentExt === ".avif") {
    prioritizedExts.push(".webp", ".jpeg", ".jpg", ".png");
  } else {
    prioritizedExts.push(...imageFallbackOrder.filter((ext) => ext !== currentExt));
  }

  const deduped = Array.from(new Set(prioritizedExts));
  return deduped.map((ext) => `${basePath}${ext}${query}${hash}`);
}

function installImageFallbacks() {
  document.querySelectorAll("img[src]").forEach((img) => {
    const originalSrc = img.getAttribute("src");
    if (!originalSrc) {
      return;
    }

    const fallbackQueue = buildFallbackCandidates(originalSrc);
    let fallbackIndex = 0;

    img.addEventListener("error", () => {
      while (fallbackIndex < fallbackQueue.length) {
        const nextSrc = fallbackQueue[fallbackIndex];
        fallbackIndex += 1;

        if (nextSrc && img.getAttribute("src") !== nextSrc) {
          img.setAttribute("src", nextSrc);
          return;
        }
      }

      if (img.getAttribute("src") !== "Pictures/logo.png") {
        img.setAttribute("src", "Pictures/logo.png");
      }
    });
  });
}

installImageFallbacks();

function toggleMenu(forceClose = false) {
  if (!mobileBreakpoint.matches && !forceClose) {
    return;
  }

  const shouldOpen = forceClose ? false : mobileMenu.hidden;
  mobileMenu.hidden = !shouldOpen;
  mobileOverlay.hidden = !shouldOpen;
  document.body.classList.toggle("menu-open", shouldOpen);
  menuToggle.setAttribute("aria-expanded", String(shouldOpen));
}

menuToggle.addEventListener("click", () => toggleMenu());
mobileOverlay.addEventListener("click", () => toggleMenu(true));
if (mobileClose) {
  mobileClose.addEventListener("click", () => toggleMenu(true));
}

document.querySelectorAll(".mobile-menu a").forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href") || "";
    toggleMenu(true);

    if (!href.startsWith("#") || href === "#") {
      return;
    }

    const target = document.querySelector(href);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

window.addEventListener("resize", () => {
  if (!mobileBreakpoint.matches) {
    toggleMenu(true);
  }
});

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 40);
  if (backToTop) {
    backToTop.classList.toggle("visible", window.scrollY > 500);
  }
});

if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const targetId = anchor.getAttribute("href");
    if (!targetId || targetId === "#") {
      return;
    }

    const target = document.querySelector(targetId);
    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".nav-links a:not(.nav-cta)");

window.addEventListener("scroll", () => {
  let current = "home";
  sections.forEach((section) => {
    const top = section.offsetTop - 140;
    if (window.scrollY >= top) {
      current = section.id;
    }
  });

  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal, .reveal-left, .reveal-right").forEach((node) => {
  revealObserver.observe(node);
});

const statNumbers = document.querySelectorAll(".stat-number");
let countersStarted = false;

function runCounters() {
  if (countersStarted) {
    return;
  }
  countersStarted = true;

  statNumbers.forEach((item) => {
    const target = Number(item.dataset.target || 0);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 70));

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      item.textContent = `${current.toLocaleString()}+`;
    }, 22);
  });
}

const kathaSection = document.getElementById("katha");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCounters();
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.35 }
);

if (kathaSection) {
  counterObserver.observe(kathaSection);
}

const visitorCountNode = document.getElementById("visitorCount");
const visitorCountSection = document.getElementById("visitorCountSection");

async function getWebsiteVisitorCount() {
  const baseCount = 1081;
  const fallbackKey = "dcWebsiteVisitorCountFallback";
  const sessionKey = "dcWebsiteVisitorCountSession";
  const apiNamespace = "divyachetna-in";
  const apiKey = "website-visitors";
  const hitEndpoint = `https://api.countapi.xyz/hit/${apiNamespace}/${apiKey}`;
  const getEndpoint = `https://api.countapi.xyz/get/${apiNamespace}/${apiKey}`;

  try {
    const shouldIncrement = !sessionStorage.getItem(sessionKey);
    const endpoint = shouldIncrement ? hitEndpoint : getEndpoint;
    const response = await fetch(endpoint, { method: "GET", cache: "no-store" });

    if (!response.ok) {
      throw new Error("Failed to fetch visitor count");
    }

    const data = await response.json();
    const count = Number(data.value);
    if (!Number.isFinite(count) || count <= 0) {
      throw new Error("Invalid visitor count value");
    }

    if (shouldIncrement) {
      sessionStorage.setItem(sessionKey, "1");
    }

    localStorage.setItem(fallbackKey, String(count));
    return count;
  } catch (_error) {
    try {
      const stored = Number(localStorage.getItem(fallbackKey));
      const fallback = Number.isFinite(stored) && stored > 0 ? stored : baseCount;

      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "1");
        const nextValue = fallback + 1;
        localStorage.setItem(fallbackKey, String(nextValue));
        return nextValue;
      }

      return fallback;
    } catch (_nestedError) {
      return baseCount;
    }
  }
}

function animateVisitorCount(element, target) {
  const safeTarget = Number.isFinite(target) && target > 0 ? Math.round(target) : 0;
  let current = 0;
  const increment = safeTarget / 60;

  const timer = window.setInterval(() => {
    current += increment;
    if (current >= safeTarget) {
      current = safeTarget;
      window.clearInterval(timer);
    }
    element.textContent = Math.floor(current).toLocaleString();
  }, 30);
}

if (visitorCountNode && visitorCountSection) {
  let totalVisitors = 0;
  let canAnimate = false;
  let hasAnimated = false;

  const maybeAnimateVisitorCount = () => {
    if (!canAnimate || hasAnimated || totalVisitors <= 0) {
      return;
    }

    animateVisitorCount(visitorCountNode, totalVisitors);
    hasAnimated = true;
  };

  const visitorObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          canAnimate = true;
          maybeAnimateVisitorCount();
          visitorObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.45 }
  );

  visitorObserver.observe(visitorCountSection);

  getWebsiteVisitorCount().then((count) => {
    totalVisitors = count;
    visitorCountNode.dataset.target = String(totalVisitors);

    maybeAnimateVisitorCount();
  });
}

document.querySelectorAll(".slider-frame").forEach((frame) => {
  const slides = Array.from(frame.querySelectorAll(".slide"));
  const nextBtn = frame.querySelector(".next");
  const prevBtn = frame.querySelector(".prev");
  let currentSlide = 0;
  let sliderTimer;

  const showSlide = (index) => {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentSlide);
    });
  };

  const startSlider = () => {
    if (slides.length < 2) {
      return;
    }

    sliderTimer = window.setInterval(() => {
      showSlide(currentSlide + 1);
    }, 4200);
  };

  const resetSlider = () => {
    window.clearInterval(sliderTimer);
    startSlider();
  };

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener("click", () => {
      showSlide(currentSlide + 1);
      resetSlider();
    });

    prevBtn.addEventListener("click", () => {
      showSlide(currentSlide - 1);
      resetSlider();
    });
  }

  showSlide(0);
  startSlider();
});

const aboutTabsRoot = document.querySelector("[data-about-tabs]");

if (aboutTabsRoot) {
  const aboutTabs = Array.from(aboutTabsRoot.querySelectorAll('[role="tab"]'));
  const aboutPanels = Array.from(aboutTabsRoot.querySelectorAll('[role="tabpanel"]'));
  const panelPhotoIndex = new Map();
  const eventSegmentPhotoIndex = new Map();
  let activeTabIndex = Math.max(
    0,
    aboutTabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true")
  );
  let tabAutoTimer;
  let imageAutoTimer;
  let eventSegmentTimer;

  const getPanelByTab = (tab) => {
    const panelId = tab.getAttribute("aria-controls");
    return panelId ? document.getElementById(panelId) : null;
  };

  const showPanelPhoto = (panel, nextPhotoIndex) => {
    if (!panel) {
      return;
    }

    const photos = Array.from(panel.querySelectorAll(".about-photo"));
    if (!photos.length) {
      return;
    }

    const safeIndex = (nextPhotoIndex + photos.length) % photos.length;
    photos.forEach((photo, index) => {
      photo.classList.toggle("active", index === safeIndex);
    });

    panelPhotoIndex.set(panel.id, safeIndex);
  };

  const restartImageRotation = () => {
    window.clearInterval(imageAutoTimer);

    const activeTab = aboutTabs[activeTabIndex];
    const activePanel = activeTab ? getPanelByTab(activeTab) : null;

    if (!activePanel) {
      return;
    }

    const photos = Array.from(activePanel.querySelectorAll(".about-photo"));
    if (!photos.length) {
      return;
    }

    const currentIndex = panelPhotoIndex.has(activePanel.id)
      ? panelPhotoIndex.get(activePanel.id)
      : Math.max(
          0,
          photos.findIndex((photo) => photo.classList.contains("active"))
        );

    showPanelPhoto(activePanel, currentIndex);

    if (photos.length < 2) {
      return;
    }

    imageAutoTimer = window.setInterval(() => {
      const latest = panelPhotoIndex.get(activePanel.id) || 0;
      showPanelPhoto(activePanel, latest + 1);
    }, 4000);
  };

  const showEventSegmentPhoto = (gallery, nextPhotoIndex) => {
    if (!gallery) {
      return;
    }

    const photos = Array.from(gallery.querySelectorAll(".event-segment-photo"));
    if (!photos.length) {
      return;
    }

    const safeIndex = (nextPhotoIndex + photos.length) % photos.length;
    photos.forEach((photo, index) => {
      photo.classList.toggle("active", index === safeIndex);
    });

    eventSegmentPhotoIndex.set(gallery, safeIndex);
  };

  const restartEventSegmentRotation = () => {
    window.clearInterval(eventSegmentTimer);

    const activeTab = aboutTabs[activeTabIndex];
    const activePanel = activeTab ? getPanelByTab(activeTab) : null;

    if (!activePanel || activePanel.id !== "about-panel-events") {
      return;
    }

    const galleries = Array.from(activePanel.querySelectorAll(".event-segment-gallery"));
    if (!galleries.length) {
      return;
    }

    galleries.forEach((gallery) => {
      const photos = Array.from(gallery.querySelectorAll(".event-segment-photo"));
      if (!photos.length) {
        return;
      }

      const currentIndex = eventSegmentPhotoIndex.has(gallery)
        ? eventSegmentPhotoIndex.get(gallery)
        : Math.max(
            0,
            photos.findIndex((photo) => photo.classList.contains("active"))
          );

      showEventSegmentPhoto(gallery, currentIndex);
    });

    const hasRotatingGallery = galleries.some(
      (gallery) => gallery.querySelectorAll(".event-segment-photo").length > 1
    );

    if (!hasRotatingGallery) {
      return;
    }

    eventSegmentTimer = window.setInterval(() => {
      galleries.forEach((gallery) => {
        const photoCount = gallery.querySelectorAll(".event-segment-photo").length;
        if (photoCount < 2) {
          return;
        }

        const latest = eventSegmentPhotoIndex.get(gallery) || 0;
        showEventSegmentPhoto(gallery, latest + 1);
      });
    }, 4000);
  };

  const startTabAutoRotation = () => {
    window.clearInterval(tabAutoTimer);

    if (aboutTabs.length < 2) {
      return;
    }

    tabAutoTimer = window.setInterval(() => {
      activateTab(activeTabIndex + 1, false);
    }, 20000);
  };

  const activateTab = (nextIndex, isManual) => {
    if (!aboutTabs.length) {
      return;
    }

    activeTabIndex = (nextIndex + aboutTabs.length) % aboutTabs.length;

    aboutTabs.forEach((tab, index) => {
      const isActive = index === activeTabIndex;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      tab.classList.toggle("is-active", isActive);

      const panel = getPanelByTab(tab);
      if (panel) {
        panel.hidden = !isActive;
        panel.classList.toggle("is-active", isActive);
      }
    });

    restartImageRotation();
    restartEventSegmentRotation();

    if (isManual) {
      startTabAutoRotation();
    }
  };

  aboutTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => {
      activateTab(index, true);
    });

    tab.addEventListener("keydown", (event) => {
      let targetIndex = null;

      if (event.key === "ArrowRight") {
        targetIndex = index + 1;
      } else if (event.key === "ArrowLeft") {
        targetIndex = index - 1;
      } else if (event.key === "Home") {
        targetIndex = 0;
      } else if (event.key === "End") {
        targetIndex = aboutTabs.length - 1;
      }

      if (targetIndex === null) {
        return;
      }

      event.preventDefault();
      const safeIndex = (targetIndex + aboutTabs.length) % aboutTabs.length;
      activateTab(safeIndex, true);
      aboutTabs[safeIndex].focus();
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearInterval(tabAutoTimer);
      window.clearInterval(imageAutoTimer);
      window.clearInterval(eventSegmentTimer);
      return;
    }

    restartImageRotation();
    restartEventSegmentRotation();
    startTabAutoRotation();
  });

  activateTab(activeTabIndex, false);
  startTabAutoRotation();
}

const registerForm = document.getElementById("registerForm");
const registerStatus = document.getElementById("registerStatus");
const newsletterForm = document.getElementById("newsletterForm");
const newsletterStatus = document.getElementById("newsletterStatus");
const donateForm = document.getElementById("donateForm");
const donateStatus = document.getElementById("donateStatus");
const customAmountInput = document.getElementById("customAmount");
const heroBellButton = document.getElementById("heroBellButton");
const heroBellStream = document.getElementById("heroBellStream");

function playBellRing() {
  const candidates = ["bell_ring.mp3", "Pictures/bell_ring.mp3"];

  const attemptPlay = (index) => {
    if (index >= candidates.length) {
      return;
    }

    const ringAudio = new Audio(candidates[index]);
    ringAudio.preload = "auto";
    const playPromise = ringAudio.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => attemptPlay(index + 1));
    }
  };

  attemptPlay(0);
}

function triggerBellBlessing() {
  if (!heroBellStream) {
    return;
  }

  const greetings = ["Jai Shree Ram", "Ram Ram", "Sita Ram"];
  const blessing = greetings[Math.floor(Math.random() * greetings.length)];
  const flyText = document.createElement("span");

  flyText.className = "bell-fly";
  flyText.textContent = `${blessing} 🙏`;
  flyText.style.left = `${Math.round(10 + Math.random() * 80)}%`;
  flyText.style.bottom = `${Math.round(4 + Math.random() * 15)}%`;
  flyText.style.setProperty("--drift-x", `${Math.round(-130 + Math.random() * 260)}px`);
  flyText.style.setProperty("--rise-y", `${Math.round(130 + Math.random() * 180)}px`);
  flyText.style.setProperty("--flight-duration", `${(1.3 + Math.random() * 1.0).toFixed(2)}s`);

  playBellRing();
  heroBellStream.appendChild(flyText);

  flyText.addEventListener("animationend", () => {
    flyText.remove();
  });
}

function showStatus(element, message, type) {
  element.textContent = message;
  element.classList.remove("success", "error");
  element.classList.add(type);
}

if (registerForm && registerStatus) {
  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!registerForm.checkValidity()) {
      showStatus(registerStatus, "Please fill all required registration details correctly.", "error");
      registerForm.reportValidity();
      return;
    }

    showStatus(registerStatus, "Registration received. Trust team will contact you soon.", "success");
    registerForm.reset();
  });
}

if (newsletterForm && newsletterStatus) {
  newsletterForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!newsletterForm.checkValidity()) {
      showStatus(newsletterStatus, "Please enter a valid email for updates.", "error");
      newsletterForm.reportValidity();
      return;
    }

    showStatus(newsletterStatus, "Subscribed successfully for Katha updates.", "success");
    newsletterForm.reset();
  });
}

if (donateForm && donateStatus && customAmountInput) {
  const donationAmountInputs = donateForm.querySelectorAll('input[name="donationAmount"]');

  const syncCustomAmountState = () => {
    const selectedAmount = donateForm.querySelector('input[name="donationAmount"]:checked');
    const isCustom = selectedAmount && selectedAmount.value === "custom";

    customAmountInput.disabled = !isCustom;
    customAmountInput.required = !!isCustom;

    if (isCustom) {
      customAmountInput.focus();
      return;
    }

    customAmountInput.value = "";
    customAmountInput.setCustomValidity("");
  };

  donationAmountInputs.forEach((input) => {
    input.addEventListener("change", syncCustomAmountState);
  });

  donateForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const selectedAmount = donateForm.querySelector('input[name="donationAmount"]:checked');
    if (!selectedAmount) {
      showStatus(donateStatus, "Please select a donation amount.", "error");
      return;
    }

    let donationAmount = selectedAmount.value;
    if (donationAmount === "custom") {
      const parsed = Number(customAmountInput.value);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        showStatus(donateStatus, "Please enter a valid custom amount.", "error");
        customAmountInput.reportValidity();
        return;
      }
      donationAmount = String(parsed);
    }

    const donationMessageField = document.getElementById("donationMessage");
    const donationMessage = donationMessageField ? donationMessageField.value.trim() : "";
    const redirectUrl = new URL("https://example.com/donate");
    redirectUrl.searchParams.set("amount", donationAmount);
    if (donationMessage) {
      redirectUrl.searchParams.set("message", donationMessage);
    }

    showStatus(donateStatus, "Redirecting to payment page...", "success");
    window.open(redirectUrl.toString(), "_blank", "noopener,noreferrer");
  });

  syncCustomAmountState();
}

if (heroBellButton && heroBellStream) {
  heroBellButton.addEventListener("click", triggerBellBlessing);
}

window.addEventListener("load", () => {
  const loader = document.getElementById("loader");
  window.setTimeout(() => {
    loader.classList.add("hidden");
  }, 1300);

  const particles = document.getElementById("heroParticles");
  if (particles) {
    for (let index = 0; index < 24; index += 1) {
      const dot = document.createElement("span");
      dot.className = "particle";
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.bottom = `-${Math.random() * 20}px`;
      dot.style.setProperty("--duration", `${7 + Math.random() * 6}s`);
      dot.style.animationDelay = `${Math.random() * 4}s`;
      particles.appendChild(dot);
    }
  }
});
