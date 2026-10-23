
/* ========================================
   GitVerse Portfolio — Main JavaScript
   ======================================== */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) =>
        Array.from(parent.querySelectorAll(selector));

    // ----------------------------------------
    // Mobile navigation
    // ----------------------------------------

    const menuToggle = $("#menuToggle");
    const navLinks = $("#navLinks");
    const navItems = $$(".nav-link");

    function closeMenu() {
        if (!menuToggle || !navLinks) return;

        navLinks.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    }

    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isOpen = navLinks.classList.toggle("open");

            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation menu" : "Open navigation menu"
            );
        });

        navItems.forEach((link) => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", (event) => {
            if (
                navLinks.classList.contains("open") &&
                !navLinks.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMenu();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 680) closeMenu();
        });
    }

    // ----------------------------------------
    // Dark and light theme
    // ----------------------------------------

    const themeToggle = $("#themeToggle");
    const themeIcon = $("#themeIcon");
    const themeMeta = $('meta[name="theme-color"]');

    function setTheme(theme) {
        const isLight = theme === "light";

        document.body.classList.toggle("light-theme", isLight);

        if (themeIcon) {
            themeIcon.textContent = isLight ? "☾" : "☀";
        }

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-label",
                isLight ? "Switch to dark theme" : "Switch to light theme"
            );
            themeToggle.title = isLight ? "Switch to dark theme" : "Switch to light theme";
        }

        if (themeMeta) {
            themeMeta.setAttribute("content", isLight ? "#f7f8fc" : "#0b1020");
        }

        try {
            localStorage.setItem("gitverse-theme", theme);
        } catch {
            // The page still works if browser storage is unavailable.
        }
    }

    let savedTheme = "dark";

    try {
        savedTheme = localStorage.getItem("gitverse-theme") || "dark";
    } catch {
        // Use dark theme if browser storage is unavailable.
    }

    setTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const isLight = document.body.classList.contains("light-theme");
            setTheme(isLight ? "dark" : "light");
        });
    }

    // ----------------------------------------
    // Rotating hero role
    // ----------------------------------------

    const typingText = $("#typingText");
    const roles = [
        "Developer",
        "Problem Solver",
        "Full Stack Learner",
        "Creative Thinker"
    ];

    let roleIndex = 0;
    let characterIndex = roles[0].length;
    let deleting = true;

    function typeRole() {
        if (!typingText || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            if (typingText) typingText.textContent = roles[0];
            return;
        }

        const currentRole = roles[roleIndex];

        if (deleting) {
            characterIndex--;
        } else {
            characterIndex++;
        }

        typingText.textContent = currentRole.substring(0, characterIndex);

        let delay = deleting ? 45 : 85;

        if (!deleting && characterIndex === currentRole.length) {
            deleting = true;
            delay = 1400;
        } else if (deleting && characterIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            delay = 350;
        }

        window.setTimeout(typeRole, delay);
    }

    if (typingText && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        window.setTimeout(typeRole, 1500);
    }

    // ----------------------------------------
    // Reveal elements on scroll
    // ----------------------------------------

    const revealElements = $$(".reveal");

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach((element) => revealObserver.observe(element));
    } else {
        revealElements.forEach((element) => element.classList.add("visible"));
    }

    // ----------------------------------------
    // Scroll progress, header, and back to top
    // ----------------------------------------

    const header = $("#header");
    const scrollProgress = $("#scrollProgress");
    const backToTop = $("#backToTop");

    let scrollTicking = false;

    function updateScrollUI() {
        const scrollTop = window.scrollY;
        const maxScroll =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

        if (scrollProgress) {
            scrollProgress.style.width = `${progress}%`;
        }

        if (header) {
            header.classList.toggle("scrolled", scrollTop > 20);
        }

        if (backToTop) {
            backToTop.classList.toggle("visible", scrollTop > 500);
        }

        scrollTicking = false;
    }

    window.addEventListener(
        "scroll",
        () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(updateScrollUI);
                scrollTicking = true;
            }
        },
        { passive: true }
    );

    updateScrollUI();

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    ? "auto"
                    : "smooth"
            });
        });
    }

    // ----------------------------------------
    // Active navigation section
    // ----------------------------------------

    const sections = $$("main section[id]");

    if ("IntersectionObserver" in window) {
        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;

                    navItems.forEach((link) => {
                        const matches = link.getAttribute("href") === `#${entry.target.id}`;

                        link.classList.toggle("active", matches);

                        if (matches) {
                            link.setAttribute("aria-current", "location");
                        } else {
                            link.removeAttribute("aria-current");
                        }
                    });
                });
            },
            {
                rootMargin: "-30% 0px -60% 0px",
                threshold: 0
            }
        );

        sections.forEach((section) => sectionObserver.observe(section));
    }

    // ----------------------------------------
    // Project category filters
    // ----------------------------------------

    const filterButtons = $$(".filter-btn");
    const projectCards = $$(".project-card");
    const projectCount = $("#projectCount");

    function filterProjects(category) {
        let visibleCount = 0;

        projectCards.forEach((card) => {
            const matches =
                category === "all" || card.dataset.category === category;

            card.classList.toggle("is-hidden", !matches);

            if (matches) visibleCount++;
        });

        if (projectCount) {
            projectCount.textContent =
                `${String(visibleCount).padStart(2, "0")} project${visibleCount === 1 ? "" : "s"}`;
        }
    }

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            filterButtons.forEach((item) => {
                const isActive = item === button;

                item.classList.toggle("active", isActive);
                item.setAttribute("aria-pressed", String(isActive));
            });

            filterProjects(button.dataset.filter || "all");
        });

        button.setAttribute(
            "aria-pressed",
            String(button.classList.contains("active"))
        );
    });

    filterProjects("all");

    // ----------------------------------------
    // Copy email address
    // ----------------------------------------

    const copyEmailButton = $("#copyEmail");
    const toast = $("#toast");
    let toastTimeout;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("visible");

        window.clearTimeout(toastTimeout);

        toastTimeout = window.setTimeout(() => {
            toast.classList.remove("visible");
        }, 2600);
    }

    if (copyEmailButton) {
        copyEmailButton.addEventListener("click", async () => {
            const email = copyEmailButton.dataset.email;

            if (!email) {
                showToast("Please configure your email address first.");
                return;
            }

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(email);
                } else {
                    const input = document.createElement("textarea");

                    input.value = email;
                    input.setAttribute("readonly", "");
                    input.style.position = "fixed";
                    input.style.opacity = "0";

                    document.body.appendChild(input);
                    input.select();

                    const successful = document.execCommand("copy");
                    input.remove();

                    if (!successful) throw new Error("Copy failed");
                }

                showToast("Email address copied to clipboard!");
            } catch {
                showToast(`Email: ${email}`);
            }
        });
    }

    // ----------------------------------------
    // Footer year
    // ----------------------------------------

    const currentYear = $("#currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }
});
