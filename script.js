/* ==========================================================================
   Taste & Explore Brunei - JavaScript interactions
   Features: custom cursor, theme switch, slideshow, lightbox,
             weekend planner, event filters and enquiry-form validation.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function () {
  // Feature 1: Dark / light theme. The visitor's choice is saved in this browser.
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
  }

  function updateThemeButton() {
    if (!themeToggle) return;
    const darkModeOn = document.body.classList.contains("dark-theme");
    themeToggle.textContent = darkModeOn ? "☀️ Light Mode" : "🌙 Dark Mode";
    themeToggle.setAttribute(
      "aria-label",
      darkModeOn ? "Switch to light mode" : "Switch to dark mode"
    );
    themeToggle.setAttribute("aria-pressed", String(darkModeOn));
  }

  updateThemeButton();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      document.body.classList.toggle("dark-theme");
      const selectedTheme = document.body.classList.contains("dark-theme")
        ? "dark"
        : "light";
      localStorage.setItem("theme", selectedTheme);
      updateThemeButton();
    });
  }

  // Decorative cursor: only enabled for devices with a fine pointer.
  const cursorDot = document.getElementById("cursorDot");
  const cursorOutline = document.getElementById("cursorOutline");
  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (cursorDot && cursorOutline && hasFinePointer) {
    document.body.classList.add("custom-cursor-enabled");

    window.addEventListener("pointermove", function (event) {
      cursorDot.style.left = event.clientX + "px";
      cursorDot.style.top = event.clientY + "px";
      cursorOutline.style.left = event.clientX + "px";
      cursorOutline.style.top = event.clientY + "px";
    });

    document.querySelectorAll("a, button, .gallery-card").forEach(function (item) {
      item.addEventListener("pointerenter", function () {
        document.body.classList.add("hovered");
      });
      item.addEventListener("pointerleave", function () {
        document.body.classList.remove("hovered");
      });
    });
  }

  // Feature 2: Image slideshow with previous, next and automatic controls.
  const slides = Array.from(document.querySelectorAll(".slide"));
  const previousSlideButton = document.getElementById("prevSlide");
  const nextSlideButton = document.getElementById("nextSlide");
  let currentSlide = Math.max(0, slides.findIndex(slide => slide.classList.contains("active")));
  let slideshowTimer = null;

  function showSlide(index) {
    if (slides.length === 0) return;

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      const isActive = slideIndex === currentSlide;
      slide.classList.toggle("active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  }

  if (slides.length > 0) {
    showSlide(currentSlide);

    if (previousSlideButton) {
      previousSlideButton.addEventListener("click", function () {
        showSlide(currentSlide - 1);
      });
    }

    if (nextSlideButton) {
      nextSlideButton.addEventListener("click", function () {
        showSlide(currentSlide + 1);
      });
    }

    // Do not auto-animate when the visitor has requested reduced motion.
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      slideshowTimer = window.setInterval(function () {
        showSlide(currentSlide + 1);
      }, 5000);
    }
  }

  // Feature 3: Accessible lightbox gallery.
  const galleryCards = document.querySelectorAll(".gallery-card");
  const lightbox = document.getElementById("lightboxModal");
  const lightboxImage = document.getElementById("modalImg");
  const lightboxCaption = document.getElementById("modalCaption");
  const closeLightboxButton = document.getElementById("closeModal");
  let lastFocusedElement = null;

  function openLightbox(card) {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;

    lastFocusedElement = card;
    lightboxImage.src = card.getAttribute("data-img");
    lightboxImage.alt = card.getAttribute("data-title") || "Enlarged destination photograph";
    lightboxCaption.textContent = card.getAttribute("data-title") || "";
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    if (closeLightboxButton) closeLightboxButton.focus();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    if (lastFocusedElement) lastFocusedElement.focus();
  }

  galleryCards.forEach(function (card) {
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-haspopup", "dialog");

    card.addEventListener("click", function () {
      openLightbox(card);
    });

    card.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(card);
      }
    });
  });

  if (closeLightboxButton) {
    closeLightboxButton.addEventListener("click", closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) closeLightbox();
    });
  }

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && lightbox && lightbox.classList.contains("is-open")) {
      closeLightbox();
    }
  });

  // Feature 4: Weekend planner score. Each selected activity adds 25 points.
  const plannerForm = document.getElementById("bucketListForm");
  const plannerItems = document.querySelectorAll(".bucket-item");
  const scoreText = document.getElementById("scoreText");
  const progressBar = document.getElementById("progressBar");
  const scoreMessage = document.getElementById("scoreMessage");

  function updatePlannerScore() {
    if (!plannerForm || !scoreText || !progressBar || !scoreMessage) return;

    const selectedItems = Array.from(plannerItems).filter(item => item.checked);
    const score = selectedItems.reduce(function (total, item) {
      return total + Number(item.value || 0);
    }, 0);

    scoreText.textContent = score + "%";
    progressBar.style.width = score + "%";
    progressBar.setAttribute("role", "progressbar");
    progressBar.setAttribute("aria-valuemin", "0");
    progressBar.setAttribute("aria-valuemax", "100");
    progressBar.setAttribute("aria-valuenow", String(score));

    if (score === 0) {
      scoreMessage.textContent = "Choose activities above to start building your weekend plan.";
    } else if (score < 100) {
      scoreMessage.textContent = selectedItems.length + " of 4 activities selected. Keep exploring!";
    } else {
      scoreMessage.textContent = "Your weekend plan is complete. Enjoy exploring Brunei!";
    }
  }

  plannerItems.forEach(function (item) {
    item.addEventListener("change", updatePlannerScore);
  });
  if (plannerItems.length > 0) updatePlannerScore();

  // Feature 5: Event category filters.
  const filterButtons = document.querySelectorAll(".filter-btn");
  const eventCards = document.querySelectorAll(".event-box");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const selectedCategory = button.getAttribute("data-category");

      filterButtons.forEach(function (filterButton) {
        const isSelected = filterButton === button;
        filterButton.classList.toggle("active", isSelected);
        filterButton.setAttribute("aria-pressed", String(isSelected));
      });

      eventCards.forEach(function (card) {
        const matches = selectedCategory === "all" ||
          card.getAttribute("data-category") === selectedCategory;
        card.hidden = !matches;
      });
    });
  });

  // Enquiry form: client-side validation only. It does not send/store submissions.
  const enquiryForm = document.getElementById("enquiryForm");
  const formFeedback = document.getElementById("formFeedback");

  if (enquiryForm && formFeedback) {
    enquiryForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const name = document.getElementById("fullname");
      const email = document.getElementById("email");
      const topic = document.getElementById("topic");
      const message = document.getElementById("message");

      const missingField = [name, email, topic, message].find(function (field) {
        return !field || !field.value.trim();
      });

      const emailIsValid = email &&
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());

      formFeedback.className = "feedback-msg";

      if (missingField) {
        formFeedback.textContent = "Please complete all fields before submitting.";
        formFeedback.classList.add("error");
        missingField.focus();
        return;
      }

      if (!emailIsValid) {
        formFeedback.textContent = "Please enter a valid email address.";
        formFeedback.classList.add("error");
        email.focus();
        return;
      }

      formFeedback.textContent =
        "Your form has passed the demo validation. This student website does not send or store enquiries.";
      formFeedback.classList.add("success");
      enquiryForm.reset();
    });
  }
});
