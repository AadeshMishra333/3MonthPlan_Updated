const navbar = document.getElementById("navbar");
const backToTop = document.getElementById("backToTop");
const menuToggle = document.getElementById("menuToggle");
const mobileMenu = document.getElementById("mobileMenu");
const mobileOverlay = document.getElementById("mobileOverlay");
const mobileClose = document.getElementById("mobileClose");
const mobileBreakpoint = window.matchMedia("(max-width: 900px)");

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
