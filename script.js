
"use strict";

/* ================= SELECTORS ================= */

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const reduceMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;


/* ================= CURRENT YEAR ================= */

const year = $("#yr");

if (year) {
  year.textContent = new Date().getFullYear();
}


/* ================= MOBILE NAVIGATION ================= */

const burger = $("#burger");
const menu = $("#menu");

function setMenu(open) {
  if (!burger || !menu) return;

  menu.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute(
    "aria-label",
    open ? "Close navigation menu" : "Open navigation menu"
  );
}

if (burger && menu) {
  burger.addEventListener("click", () => {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    setMenu(!isOpen);
  });

  // Close the menu after selecting a navigation link.
  $$("#menu a").forEach(link => {
    link.addEventListener("click", () => setMenu(false));
  });

  // Close when clicking outside the navigation.
  document.addEventListener("click", event => {
    if (
      !menu.contains(event.target) &&
      !burger.contains(event.target)
    ) {
      setMenu(false);
    }
  });

  // Close with Escape.
  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      setMenu(false);
    }
  });

  // Close the mobile menu when returning to desktop width.
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) {
      setMenu(false);
    }
  });
}


/* ================= SCROLL REVEAL ================= */

const revealElements = $$(".reveal");

if ("IntersectionObserver" in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

} else {
  revealElements.forEach(element => {
    element.classList.add("in");
  });
}


/* ================= 3D POINTER EFFECTS ================= */

const finePointer = window.matchMedia("(pointer: fine)").matches;

if (!reduceMotion && finePointer) {

  // Move the 3D sculpture according to pointer position.
  document.addEventListener("pointermove", event => {
    const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
    const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);

    document.documentElement.style.setProperty("--mx", x);
    document.documentElement.style.setProperty("--my", y);
  });

  // Give service cards a subtle 3D tilt.
  $$(".card").forEach(card => {

    card.addEventListener("pointermove", event => {
      const rect = card.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 7;
      const rotateX = (y - 0.5) * -7;

      card.style.setProperty("--ry", `${rotateY}deg`);
      card.style.setProperty("--rx", `${rotateX}deg`);
    });

    card.addEventListener("pointerleave", () => {
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
    });

  });

}


/* ================= SUBTLE SCROLL PARALLAX ================= */

if (!reduceMotion) {
  const stages = $$(".stage");
  let ticking = false;

  function updateParallax() {
    const scrollPosition = window.scrollY;

    stages.forEach(stage => {
      const depth = Number(stage.dataset.depth) || 1;
      stage.style.translate = `0 ${scrollPosition * -0.035 * depth}px`;
    });

    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });
}


/* ================= SERVICE BOOKING LINKS ================= */

const serviceSelect = $('select[name="service"]');

$$("[data-service]").forEach(link => {
  link.addEventListener("click", () => {
    if (serviceSelect) {
      serviceSelect.value = link.dataset.service;
    }
  });
});


/* ================= GALLERY LIGHTBOX ================= */

const lightbox = $("#lb");
const lightboxImage = $("#lbimg");
const lightboxCaption = $("#lbcap");
const closeLightbox = $("#lbx");

function openLightbox(button) {
  if (!lightbox || !lightboxImage) return;

  const image = $("img", button);

  if (!image) return;

  lightboxImage.src = image.currentSrc || image.src;
  lightboxImage.alt = image.alt;

  if (lightboxCaption) {
    lightboxCaption.textContent =
      button.dataset.caption || image.alt;
  }

  if (typeof lightbox.showModal === "function") {
    lightbox.showModal();
  }
}

$$(".gallery-item").forEach(button => {
  button.addEventListener("click", () => {
    openLightbox(button);
  });
});

if (closeLightbox && lightbox) {
  closeLightbox.addEventListener("click", () => {
    lightbox.close();
  });

  // Clicking the dark backdrop closes the viewer.
  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) {
      lightbox.close();
    }
  });
}


/* ================= TESTIMONIAL SLIDER ================= */

const quotes = $$(".quote");
const previousButton = $("#prev");
const nextButton = $("#next");

let currentQuote = 0;

function showQuote(index) {
  if (!quotes.length) return;

  currentQuote = (index + quotes.length) % quotes.length;

  quotes.forEach((quote, i) => {
    const active = i === currentQuote;

    quote.classList.toggle("active", active);
    quote.setAttribute("aria-hidden", String(!active));
  });
}

if (previousButton) {
  previousButton.addEventListener("click", () => {
    showQuote(currentQuote - 1);
  });
}

if (nextButton) {
  nextButton.addEventListener("click", () => {
    showQuote(currentQuote + 1);
  });
}

showQuote(0);


/* ================= APPOINTMENT FORM ================= */

const form = $("#form");
const statusMessage = $("#status");

if (form && statusMessage) {

  const dateInput = $('input[name="date"]', form);

  // Prevent selecting a date in the past.
  if (dateInput) {
    const today = new Date();
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    dateInput.min = localDate;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    let valid = true;

    // Clear old error messages.
    $$("label small", form).forEach(message => {
      message.textContent = "";
    });

    statusMessage.textContent = "";

    // Check required fields.
    $$("[required]", form).forEach(field => {

      let error = "";

      if (!field.value.trim()) {
        error = "This field is required.";

      } else if (
        field.type === "tel" &&
        !/^[+\d\s().-]{7,}$/.test(field.value.trim())
      ) {
        error = "Please enter a valid phone number.";

      } else if (
        field.type === "date" &&
        field.value < dateInput.min
      ) {
        error = "Please select today or a future date.";
      }

      const message = field.parentElement.querySelector("small");

      if (message) {
        message.textContent = error;
      }

      if (error) {
        valid = false;
      }

    });

    if (!valid) {
      statusMessage.textContent =
        "Please check the highlighted fields.";

      const firstInvalid = form.querySelector(":invalid");

      if (firstInvalid) {
        firstInvalid.focus();
      }

      return;
    }

    // Collect information directly from the HTML form.
    const data = new FormData(form);

    const name = data.get("name");
    const phone = data.get("phone");
    const service = data.get("service");
    const date = data.get("date");
    const message = data.get("msg");

    // Read the WhatsApp number from the editable HTML link.
    const whatsappLink = $("#wa");

    if (!whatsappLink) {
      statusMessage.textContent =
        "The WhatsApp booking link is missing.";

      return;
    }

    let whatsappNumber;

    try {
      const whatsappURL = new URL(whatsappLink.href);
      whatsappNumber = whatsappURL.pathname.replace(/\D/g, "");
    } catch {
      statusMessage.textContent =
        "Please check the WhatsApp link in index.html.";

      return;
    }

    if (!whatsappNumber || whatsappNumber.length < 8) {
      statusMessage.textContent =
        "Please add the salon's correct WhatsApp number in index.html.";

      return;
    }

    // Prepare the appointment inquiry.
    const inquiry = [
      "Hello Lumière Beauty Studio!",
      "",
      "I would like to make an appointment inquiry.",
      "",
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Service: ${service}`,
      `Preferred date: ${date}`,
      `Additional message: ${message || "None"}`
    ].join("\n");

    const url =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(inquiry)}`;

    // Open WhatsApp without pretending the booking is confirmed.
    const whatsappWindow = window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

    if (whatsappWindow) {
      statusMessage.textContent =
        "Your inquiry is ready in WhatsApp. Send it there. Your appointment is not confirmed until the salon replies.";

      form.reset();

      if (dateInput) {
        const today = new Date();
        dateInput.min = new Date(
          today.getTime() - today.getTimezoneOffset() * 60000
        ).toISOString().split("T")[0];
      }

    } else {
      statusMessage.textContent =
        "WhatsApp could not open. Please check your browser's pop-up settings.";
    }

  });

}
// SMOOTH SCROLL REVEAL
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: "0px 0px -40px 0px"
});

document.querySelectorAll(".reveal").forEach(element => {
  revealObserver.observe(element);
});