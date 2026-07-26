const intro = document.querySelector("[data-intro]");
const circles = [...document.querySelectorAll(".intro__circle")];
const logoMask = document.querySelector(".intro__logo-mask");
const tagline = document.querySelector(".intro__tagline");
const ingredients = [...document.querySelectorAll(".intro__ingredient")];
const introImages = [...intro.querySelectorAll("img")];
const skipButton = document.querySelector("[data-skip-intro]");
const replayButton = document.querySelector("[data-replay-intro]");

const easeOut = "cubic-bezier(0.23, 1, 0.32, 1)";
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const requestedTimeScale = Number.parseFloat(
  new URLSearchParams(window.location.search).get("slowIntro") ?? "1",
);
const debugTimeScale =
  Number.isFinite(requestedTimeScale) && requestedTimeScale > 1
    ? Math.min(requestedTimeScale, 10)
    : 1;
const scaled = (milliseconds) => milliseconds * debugTimeScale;

let animations = [];
let exitTimer;
let finishTimer;

function cancelSequence() {
  animations.forEach((animation) => animation.cancel());
  animations = [];
  window.clearTimeout(exitTimer);
  window.clearTimeout(finishTimer);
}

function completeIntro() {
  intro.classList.add("is-finished");
  intro.classList.remove("is-exiting");
  document.body.classList.remove("intro-is-playing");
  document.body.classList.add("site-is-ready");
}

function resetInlineStates() {
  [logoMask, tagline, ...ingredients].forEach((element) => {
    element.style.removeProperty("opacity");
    element.style.removeProperty("transform");
  });
  logoMask.style.removeProperty("clip-path");
}

function exitIntro() {
  intro.classList.add("is-exiting");
  finishTimer = window.setTimeout(completeIntro, reduceMotion.matches ? 220 : 720);
}

function playIntro() {
  cancelSequence();
  resetInlineStates();

  intro.classList.remove("is-finished", "is-exiting");
  document.body.classList.add("intro-is-playing");
  document.body.classList.remove("site-is-ready");

  if (reduceMotion.matches) {
    logoMask.style.opacity = "1";
    logoMask.style.clipPath = "inset(0)";
    tagline.style.opacity = "1";
    ingredients.forEach((ingredient) => {
      ingredient.style.opacity = "0.72";
    });
    exitTimer = window.setTimeout(exitIntro, 1100);
    return;
  }

  circles.forEach((circle, index) => {
    const animation = circle.animate(
      [
        { transform: "translate3d(-50%, -50%, 0) scale(0.02)" },
        { transform: "translate3d(-50%, -50%, 0) scale(1)" },
      ],
      {
        duration: scaled(820),
        delay: scaled(index * 130),
        easing: easeOut,
        fill: "both",
      },
    );

    animations.push(animation);
  });

  animations.push(
    logoMask.animate(
      [
        {
          clipPath: "inset(0 50% 0 50%)",
          opacity: 0,
          transform: "scale(0.92)",
        },
        {
          clipPath: "inset(0 0 0 0)",
          opacity: 1,
          transform: "scale(1)",
        },
      ],
      {
        duration: scaled(680),
        delay: scaled(480),
        easing: easeOut,
        fill: "both",
      },
    ),
  );

  animations.push(
    tagline.animate(
      [
        { opacity: 0, transform: "translateY(8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      {
        duration: scaled(420),
        delay: scaled(760),
        easing: easeOut,
        fill: "both",
      },
    ),
  );

  ingredients.forEach((ingredient, index) => {
    const {
      enterX,
      enterY,
      driftX,
      driftY,
      exitX,
      exitY,
      startRotate,
      endRotate,
      delay,
      duration,
      midScale,
      returnScale,
    } = ingredient.dataset;
    const base = "translate3d(-50%, -50%, 0)";

    animations.push(
      ingredient.animate(
        [
          {
            opacity: 0,
            transform: `${base} translate3d(${enterX}px, ${enterY}px, 0) rotate(${startRotate}deg) scale(0.84)`,
          },
          {
            offset: 0.1,
            opacity: 1,
            transform: `${base} translate3d(0, 0, 0) rotate(0deg) scale(1)`,
          },
          {
            offset: 0.5,
            opacity: 1,
            transform: `${base} translate3d(${driftX}px, ${driftY}px, 0) rotate(${Number(endRotate) * 0.35}deg) scale(${midScale})`,
          },
          {
            offset: 0.78,
            opacity: 1,
            transform: `${base} translate3d(${Number(driftX) * -0.6}px, ${Number(driftY) * -0.55}px, 0) rotate(${Number(endRotate) * 0.7}deg) scale(${returnScale})`,
          },
          {
            opacity: 0,
            transform: `${base} translate3d(${exitX}px, ${exitY}px, 0) rotate(${endRotate}deg) scale(1.12)`,
          },
        ],
        {
          duration: scaled(Number(duration)),
          delay: scaled(700 + Number(delay) + index * 32),
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          fill: "both",
        },
      ),
    );
  });

  animations.push(
    logoMask.animate(
      [
        { opacity: 1, transform: "scale(1)", filter: "blur(0)" },
        { opacity: 0, transform: "scale(1.12)", filter: "blur(2px)" },
      ],
      {
        duration: scaled(440),
        delay: scaled(3000),
        easing: easeOut,
        fill: "both",
      },
    ),
  );

  animations.push(
    tagline.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-6px)" },
      ],
      {
        duration: scaled(300),
        delay: scaled(2960),
        easing: easeOut,
        fill: "both",
      },
    ),
  );

  exitTimer = window.setTimeout(exitIntro, scaled(3150));
}

skipButton.addEventListener("click", () => {
  cancelSequence();
  intro.animate([{ opacity: 1 }, { opacity: 0 }], {
    duration: 180,
    easing: easeOut,
    fill: "forwards",
  }).finished.then(completeIntro);
});

replayButton.addEventListener("click", playIntro);
reduceMotion.addEventListener("change", playIntro);

Promise.allSettled(
  introImages.map((image) => {
    if (image.complete) {
      return Promise.resolve();
    }

    return image.decode();
  }),
).finally(playIntro);

const revealElements = [...document.querySelectorAll("[data-reveal]")];
const brandCards = [...document.querySelectorAll("[data-brand-card]")];

brandCards.forEach((card, index) => {
  card.style.setProperty("--card-offset", `${index * 3.35}rem`);
  card.style.setProperty("--card-offset-mobile", `${index * 3}rem`);
  card.style.setProperty("--card-layer", index + 1);
});

function revealOnScroll() {
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-revealed"));
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.08,
    },
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

revealOnScroll();

const panelRoots = [...document.querySelectorAll("[data-panel-root]")];
const floatingPanels = [...document.querySelectorAll("[data-panel]")];
const panelTriggers = [...document.querySelectorAll("[data-panel-trigger]")];
let panelCloseTimer;

function getPanel(name) {
  return document.querySelector(`[data-panel="${name}"]`);
}

function setPanel(name, shouldOpen) {
  const panel = getPanel(name);
  const root = document.querySelector(`[data-panel-root="${name}"]`);
  const trigger = root?.querySelector("[data-panel-trigger]");

  if (!panel || !trigger) {
    return;
  }

  panel.classList.toggle("is-open", shouldOpen);
  panel.setAttribute("aria-hidden", String(!shouldOpen));
  trigger.setAttribute("aria-expanded", String(shouldOpen));
}

function closePanels(exceptName) {
  panelRoots.forEach((root) => {
    if (root.dataset.panelRoot !== exceptName) {
      setPanel(root.dataset.panelRoot, false);
    }
  });
}

function openPanel(name) {
  window.clearTimeout(panelCloseTimer);
  closePanels(name);
  setPanel(name, true);
}

function schedulePanelClose(name) {
  window.clearTimeout(panelCloseTimer);
  panelCloseTimer = window.setTimeout(() => setPanel(name, false), 130);
}

panelRoots.forEach((root) => {
  const name = root.dataset.panelRoot;
  const trigger = root.querySelector("[data-panel-trigger]");
  const panel = getPanel(name);

  trigger.addEventListener("click", () => {
    const isOpen = trigger.getAttribute("aria-expanded") === "true";
    if (isOpen) {
      setPanel(name, false);
    } else {
      openPanel(name);
    }
  });

  root.addEventListener("pointerenter", () => {
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      openPanel(name);
    }
  });
  root.addEventListener("pointerleave", () => schedulePanelClose(name));

  panel.addEventListener("pointerenter", () => window.clearTimeout(panelCloseTimer));
  panel.addEventListener("pointerleave", () => schedulePanelClose(name));
  panel.querySelector("[data-panel-close]").addEventListener("click", () => {
    setPanel(name, false);
    trigger.focus();
  });
  panel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setPanel(name, false));
  });
});

document.addEventListener("pointerdown", (event) => {
  const clickedPanel = event.target.closest("[data-panel]");
  const clickedControl = event.target.closest("[data-panel-root]");
  if (!clickedPanel && !clickedControl) {
    closePanels();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") {
    return;
  }

  const openTrigger = panelTriggers.find(
    (trigger) => trigger.getAttribute("aria-expanded") === "true",
  );
  closePanels();
  openTrigger?.focus();
});

const menuPreview = document.querySelector("[data-menu-preview]");
const menuPreviewLinks = [...document.querySelectorAll("[data-preview]")];
let previewTimer;

menuPreviewLinks.forEach((link) => {
  const preload = new Image();
  preload.src = link.dataset.preview;

  const showPreview = () => {
    if (menuPreview.src.endsWith(link.dataset.preview)) {
      return;
    }

    window.clearTimeout(previewTimer);
    menuPreview.classList.add("is-changing");
    previewTimer = window.setTimeout(() => {
      menuPreview.src = link.dataset.preview;
      menuPreview.classList.remove("is-changing");
    }, 110);
  };

  link.addEventListener("pointerenter", showPreview);
  link.addEventListener("focus", showPreview);
});

const spotlight = document.querySelector("[data-spotlight]");
const spotlightSlides = [...document.querySelectorAll("[data-spotlight-slide]")];
const spotlightPrevious = document.querySelector("[data-spotlight-prev]");
const spotlightNext = document.querySelector("[data-spotlight-next]");
const primaryNavigation = document.querySelector("[data-primary-nav]");
const discoveryActions = document.querySelector("[data-discovery-actions]");
const qualityOrbit = document.querySelector("[data-quality-orbit]");
const qualityPoints = [...document.querySelectorAll("[data-quality-point]")];
const bestSellers = document.querySelector("[data-best-sellers]");
const bestSellerEditorials = [
  ...document.querySelectorAll("[data-best-seller-editorial]"),
];
const bestSellerCards = [
  ...document.querySelectorAll("[data-best-seller-card]"),
];
const bestSellerPrevious = document.querySelector(
  "[data-best-seller-previous]",
);
const bestSellerNext = document.querySelector("[data-best-seller-next]");
const bestSellerCurrent = document.querySelector(
  "[data-best-seller-current]",
);
const addToCartButtons = [
  ...document.querySelectorAll("[data-add-to-cart]"),
];
const cartCountBadge = document.querySelector("[data-cart-count]");
const cartPanel = document.querySelector('[data-panel="cart"]');
const cartEyebrow = document.querySelector("[data-cart-eyebrow]");
const cartStatus = document.querySelector("[data-cart-status]");
const cartCta = document.querySelector("[data-cart-cta]");
const cartTrigger = document.querySelector(
  '[data-panel-root="cart"] [data-panel-trigger]',
);
const testimonialTrack = document.querySelector("[data-testimonial-track]");
const testimonialGroup = document.querySelector("[data-testimonial-group]");
let activeSpotlightIndex = 0;
let activeBestSellerIndex = 0;
let cartItemCount = 0;
let headerModeFrame;
let qualityOrbitFrame;
let spotlightTransitionTimer;
let bestSellerTransitionTimer;
let bestSellerAnimations = [];

function clamp(value, minimum = 0, maximum = 1) {
  return Math.min(Math.max(value, minimum), maximum);
}

function setActiveSpotlight(index) {
  const nextIndex = clamp(index, 0, spotlightSlides.length - 1);
  const previousIndex = activeSpotlightIndex;
  const isChanging = nextIndex !== previousIndex;

  window.clearTimeout(spotlightTransitionTimer);
  spotlightSlides.forEach((slide) => {
    slide.classList.remove("is-entering", "is-leaving");
  });

  if (isChanging) {
    spotlightSlides[previousIndex].classList.add("is-leaving");
    spotlightSlides[nextIndex].classList.add("is-entering");
  }

  activeSpotlightIndex = nextIndex;

  spotlightSlides.forEach((slide, slideIndex) => {
    const isActive = slideIndex === activeSpotlightIndex;
    const position =
      slideIndex < activeSpotlightIndex
        ? "before"
        : slideIndex > activeSpotlightIndex
          ? "after"
          : "active";

    slide.dataset.position = position;
    slide.classList.toggle("is-active", isActive);
    slide.setAttribute("aria-hidden", String(!isActive));
  });

  spotlightPrevious.disabled = activeSpotlightIndex === 0;
  spotlightNext.disabled =
    activeSpotlightIndex === spotlightSlides.length - 1;

  if (isChanging) {
    spotlightTransitionTimer = window.setTimeout(() => {
      spotlightSlides.forEach((slide) => {
        slide.classList.remove("is-entering", "is-leaving");
      });
    }, 680);
  }
}

spotlightPrevious.addEventListener("click", () => {
  setActiveSpotlight(activeSpotlightIndex - 1);
});

spotlightNext.addEventListener("click", () => {
  setActiveSpotlight(activeSpotlightIndex + 1);
});

function cancelBestSellerAnimations() {
  bestSellerAnimations.forEach((animation) => animation.cancel());
  bestSellerAnimations = [];
  window.clearTimeout(bestSellerTransitionTimer);
  [...bestSellerEditorials, ...bestSellerCards].forEach((slide) => {
    slide.classList.remove("is-leaving");
  });
}

function updateBestSellerCounter() {
  bestSellerCurrent.textContent = String(activeBestSellerIndex + 1).padStart(
    2,
    "0",
  );
}

function setActiveBestSeller(index, direction) {
  const total = bestSellerCards.length;
  const nextIndex = (index + total) % total;

  if (nextIndex === activeBestSellerIndex) {
    return;
  }

  cancelBestSellerAnimations();

  const previousEditorial = bestSellerEditorials[activeBestSellerIndex];
  const nextEditorial = bestSellerEditorials[nextIndex];
  const previousCard = bestSellerCards[activeBestSellerIndex];
  const nextCard = bestSellerCards[nextIndex];
  const travelDirection = direction >= 0 ? 1 : -1;

  previousEditorial.classList.add("is-leaving");
  previousCard.classList.add("is-leaving");
  previousEditorial.classList.remove("is-active");
  previousCard.classList.remove("is-active");
  nextEditorial.classList.add("is-active");
  nextCard.classList.add("is-active");

  bestSellerCards.forEach((card, cardIndex) => {
    card.setAttribute("aria-hidden", String(cardIndex !== nextIndex));
  });

  activeBestSellerIndex = nextIndex;
  bestSellers.dataset.direction =
    travelDirection > 0 ? "next" : "previous";
  updateBestSellerCounter();

  if (reduceMotion.matches) {
    previousEditorial.classList.remove("is-leaving");
    previousCard.classList.remove("is-leaving");
    return;
  }

  const outgoingX = `${travelDirection * -11}%`;
  const incomingX = `${travelDirection * 11}%`;
  const animationOptions = {
    duration: 720,
    easing: "cubic-bezier(0.77, 0, 0.175, 1)",
    fill: "both",
  };

  bestSellerAnimations = [
    previousEditorial.animate(
      [
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
        {
          opacity: 0,
          transform: `translate3d(${outgoingX}, 0, 0) scale(0.985)`,
        },
      ],
      animationOptions,
    ),
    nextEditorial.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${incomingX}, 0, 0) scale(1.035)`,
        },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
      ],
      animationOptions,
    ),
    previousCard.animate(
      [
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
        {
          opacity: 0,
          transform: `translate3d(${outgoingX}, 0, 0) scale(0.975)`,
        },
      ],
      animationOptions,
    ),
    nextCard.animate(
      [
        {
          opacity: 0,
          transform: `translate3d(${incomingX}, 0, 0) scale(1.025)`,
        },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
      ],
      animationOptions,
    ),
  ];

  bestSellerTransitionTimer = window.setTimeout(() => {
    previousEditorial.classList.remove("is-leaving");
    previousCard.classList.remove("is-leaving");
    bestSellerAnimations.forEach((animation) => animation.cancel());
    bestSellerAnimations = [];
  }, animationOptions.duration);
}

bestSellerPrevious.addEventListener("click", () => {
  setActiveBestSeller(activeBestSellerIndex - 1, -1);
});

bestSellerNext.addEventListener("click", () => {
  setActiveBestSeller(activeBestSellerIndex + 1, 1);
});

function updateCartDisplay() {
  const hasItems = cartItemCount > 0;
  const itemLabel = cartItemCount === 1 ? "bite" : "bites";

  cartCountBadge.hidden = !hasItems;
  cartCountBadge.textContent = String(cartItemCount);
  cartPanel.classList.toggle("has-items", hasItems);
  cartEyebrow.textContent = hasItems
    ? "Your EasyBites bag has…"
    : "Your EasyBites bag is…";
  cartStatus.textContent = hasItems
    ? `${cartItemCount} ${itemLabel} waiting`
    : "Empty";
  cartCta.textContent = hasItems ? "Keep adding bites" : "Add some bites";
  cartTrigger.setAttribute(
    "aria-label",
    hasItems
      ? `Open cart, ${cartItemCount} ${itemLabel}`
      : "Open cart",
  );
}

const addToCartTimers = new WeakMap();

addToCartButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const label = button.querySelector("span");
    const previousTimer = addToCartTimers.get(button);

    window.clearTimeout(previousTimer);
    cartItemCount += 1;
    updateCartDisplay();
    button.classList.add("is-added");
    label.textContent = "Added!";

    const resetTimer = window.setTimeout(() => {
      button.classList.remove("is-added");
      label.textContent = "Add to cart";
    }, 1100);

    addToCartTimers.set(button, resetTimer);
  });
});

if (testimonialTrack && testimonialGroup) {
  const testimonialClone = testimonialGroup.cloneNode(true);
  testimonialClone.removeAttribute("data-testimonial-group");
  testimonialClone.setAttribute("aria-hidden", "true");
  testimonialTrack.append(testimonialClone);
  testimonialTrack.classList.add("is-ready");
}

function updateHeaderMode() {
  headerModeFrame = undefined;
  document.body.classList.toggle("is-scrolled", window.scrollY > 48);

  const discoveryHeaderIsActive =
    spotlight.getBoundingClientRect().top <=
    Math.min(window.innerHeight * 0.18, 140);
  const wasActive = document.body.classList.contains(
    "is-discovery-header",
  );

  document.body.classList.toggle(
    "is-discovery-header",
    discoveryHeaderIsActive,
  );
  primaryNavigation.inert = discoveryHeaderIsActive;
  primaryNavigation.setAttribute(
    "aria-hidden",
    String(discoveryHeaderIsActive),
  );
  discoveryActions.inert = !discoveryHeaderIsActive;
  discoveryActions.setAttribute(
    "aria-hidden",
    String(!discoveryHeaderIsActive),
  );

  if (wasActive && !discoveryHeaderIsActive) {
    closePanels();
  }
}

function requestHeaderModeUpdate() {
  if (headerModeFrame !== undefined) {
    return;
  }

  headerModeFrame = window.requestAnimationFrame(updateHeaderMode);
}

function updateQualityOrbit() {
  qualityOrbitFrame = undefined;

  if (!qualityOrbit || qualityPoints.length === 0) {
    return;
  }

  if (reduceMotion.matches) {
    qualityPoints.forEach((point) => {
      point.style.removeProperty("opacity");
      point.style.removeProperty("transform");
      point.style.removeProperty("z-index");
      point.classList.remove("is-front");
    });
    return;
  }

  const orbitBounds = qualityOrbit.getBoundingClientRect();
  const orbitDistance = Math.max(
    qualityOrbit.offsetHeight - window.innerHeight,
    1,
  );
  const orbitProgress = clamp(-orbitBounds.top / orbitDistance);
  const isCompactOrbit = window.innerWidth <= 760;
  const chapterPosition = orbitProgress * qualityPoints.length;
  const activePointIndex = Math.min(
    Math.floor(chapterPosition),
    qualityPoints.length - 1,
  );
  const activePointProgress =
    orbitProgress === 1 ? 1 : chapterPosition - activePointIndex;
  const orbitTravelX =
    window.innerWidth * (isCompactOrbit ? 0.4 : 0.46);
  const orbitAxisY = window.innerHeight * 0.7;

  qualityPoints.forEach((point, index) => {
    const isActivePoint = index === activePointIndex;

    if (!isActivePoint) {
      point.style.opacity = "0";
      point.style.zIndex = "1";
      point.style.transform = `translate3d(-50%, calc(-50% + ${orbitAxisY.toFixed(
        2,
      )}px), 0)`;
      point.classList.remove("is-front");
      return;
    }

    const x = orbitTravelX - activePointProgress * orbitTravelX * 2;
    const centreCloseness =
      1 - clamp(Math.abs(x) / Math.max(orbitTravelX, 1));
    const scale = 0.96 + centreCloseness * 0.04;
    const tilt = (x / Math.max(orbitTravelX, 1)) * 5;

    point.style.transform = `translate3d(calc(-50% + ${x.toFixed(
      2,
    )}px), calc(-50% + ${orbitAxisY.toFixed(
      2,
    )}px), 0) rotate(${tilt.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
    point.style.opacity = "1";
    point.style.zIndex = "20";
    point.classList.toggle("is-front", centreCloseness > 0.62);
  });
}

function requestQualityOrbitUpdate() {
  if (qualityOrbitFrame !== undefined) {
    return;
  }

  qualityOrbitFrame = window.requestAnimationFrame(updateQualityOrbit);
}

window.addEventListener("scroll", requestHeaderModeUpdate, { passive: true });
window.addEventListener("resize", requestHeaderModeUpdate);
window.addEventListener("scroll", requestQualityOrbitUpdate, { passive: true });
window.addEventListener("resize", requestQualityOrbitUpdate);
reduceMotion.addEventListener("change", requestQualityOrbitUpdate);
setActiveSpotlight(0);
updateBestSellerCounter();
updateCartDisplay();
updateHeaderMode();
updateQualityOrbit();
