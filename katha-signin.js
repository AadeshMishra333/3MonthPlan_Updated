const signInForm = document.getElementById("kathaSignInForm");
const signInStatus = document.getElementById("kathaSignInStatus");
const signedInState = document.getElementById("kathaSignedInState");
const signedInSummary = document.getElementById("signedInSummary");
const signOutBtn = document.getElementById("signOutBtn");

const USERS_KEY = "dcKathaUsers";
const USERS_TEXT_KEY = "dcKathaUsersText";
const SESSION_KEY = "dcKathaSignedInUser";

function normalizeName(value) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeMobile(value) {
  return value.replace(/\D/g, "");
}

function maskMobile(mobile) {
  if (mobile.length <= 4) {
    return mobile;
  }
  return `${"*".repeat(Math.max(0, mobile.length - 4))}${mobile.slice(-4)}`;
}

function showStatus(message, type) {
  if (!signInStatus) {
    return;
  }

  signInStatus.textContent = message;
  signInStatus.classList.remove("success", "error");
  signInStatus.classList.add(type);
}

function getStoredUsers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function syncTextSnapshot(users) {
  const text = users
    .map((user, index) => {
      const emailText = user.email ? user.email : "N/A";
      return `${index + 1}. Name: ${user.name} | Mobile: ${user.mobile} | Email: ${emailText}`;
    })
    .join("\n");

  localStorage.setItem(USERS_TEXT_KEY, text);
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  syncTextSnapshot(users);
}

function setSignedInState(user) {
  if (!signInForm || !signedInState || !signedInSummary) {
    return;
  }

  signInForm.hidden = true;
  signedInState.hidden = false;
  signedInSummary.textContent = `Welcome ${user.name}. Mobile: ${maskMobile(user.mobile)}`;
}

function setSignedOutState() {
  if (!signInForm || !signedInState || !signInStatus) {
    return;
  }

  signInForm.hidden = false;
  signedInState.hidden = true;
  signInStatus.textContent = "";
  signInStatus.classList.remove("success", "error");
}

function restoreSession() {
  try {
    const sessionUser = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (!sessionUser || !sessionUser.name || !sessionUser.mobile) {
      setSignedOutState();
      return;
    }
    setSignedInState(sessionUser);
  } catch (_error) {
    setSignedOutState();
  }
}

if (signInForm && signInStatus && signedInState && signedInSummary) {
  signInForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const nameInput = document.getElementById("signInName");
    const mobileInput = document.getElementById("signInMobile");
    const emailInput = document.getElementById("signInEmail");

    if (!nameInput || !mobileInput || !emailInput) {
      showStatus("Sign-in form is not ready. Please refresh and try again.", "error");
      return;
    }

    const normalizedName = normalizeName(nameInput.value);
    const normalizedMobile = normalizeMobile(mobileInput.value);
    const normalizedEmail = emailInput.value.trim().toLowerCase();

    if (!normalizedName) {
      showStatus("Please enter your full name.", "error");
      nameInput.focus();
      return;
    }

    if (normalizedMobile.length < 10) {
      showStatus("Please enter a valid mobile number.", "error");
      mobileInput.focus();
      return;
    }

    if (normalizedEmail && !emailInput.checkValidity()) {
      showStatus("Please enter a valid email address or leave it empty.", "error");
      emailInput.reportValidity();
      return;
    }

    const users = getStoredUsers();
    const now = new Date().toISOString();
    const existingUser = users.find(
      (user) => normalizeName(user.name) === normalizedName && normalizeMobile(user.mobile) === normalizedMobile
    );

    if (existingUser) {
      existingUser.updatedAt = now;
      if (normalizedEmail) {
        existingUser.email = normalizedEmail;
      }
      saveUsers(users);

      const sessionUser = {
        name: existingUser.name,
        mobile: normalizeMobile(existingUser.mobile),
        email: existingUser.email || "",
        signedInAt: now,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

      showStatus("Welcome back. You are signed in.", "success");
      setSignedInState(sessionUser);
      return;
    }

    const newUser = {
      name: normalizedName,
      mobile: normalizedMobile,
      email: normalizedEmail,
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    saveUsers(users);

    const sessionUser = {
      name: newUser.name,
      mobile: newUser.mobile,
      email: newUser.email,
      signedInAt: now,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));

    showStatus("New account created. You are signed in.", "success");
    setSignedInState(sessionUser);
  });

  restoreSession();
}

if (signOutBtn) {
  signOutBtn.addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    setSignedOutState();

    if (signInForm) {
      signInForm.reset();
    }

    showStatus("You have signed out.", "success");
  });
}
