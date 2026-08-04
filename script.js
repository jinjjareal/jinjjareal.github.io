document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector(".game-carousel");
    const cards = Array.from(document.querySelectorAll(".game-card"));

    const previousButton = document.querySelector(
        ".carousel-button--previous"
    );

    const nextButton = document.querySelector(
        ".carousel-button--next"
    );

    const pagination = document.querySelector(
        ".carousel-pagination"
    );

    const description = document.querySelector(
        ".game-description"
    );

    const descriptionTitle = document.querySelector(
        ".game-description__title"
    );

    const descriptionText = document.querySelector(
        ".game-description__text"
    );

    if (!carousel || cards.length === 0) {
        return;
    }

    let activeIndex = cards.findIndex((card) =>
        card.classList.contains("game-card--active")
    );

    if (activeIndex === -1) {
        activeIndex = 0;
    }

    let isDragging = false;
    let didDrag = false;
    let pointerStartX = 0;
    let pointerCurrentX = 0;

    const dragThreshold = 8;
    const swipeThreshold = 50;

    function wrapIndex(index) {
        return (index + cards.length) % cards.length;
    }

    function getCircularDistance(index, currentIndex) {
        let distance = index - currentIndex;
        const halfwayPoint = cards.length / 2;

        if (distance > halfwayPoint) {
            distance -= cards.length;
        }

        if (distance < -halfwayPoint) {
            distance += cards.length;
        }

        return distance;
    }

    function updateDescription(card) {
        if (
            !description ||
            !descriptionTitle ||
            !descriptionText
        ) {
            return;
        }

        const title =
            card.dataset.gameTitle || "Unannounced Game";

        const text =
            card.dataset.gameDescription ||
            "A future JINJJA project.";

        description.classList.remove("is-changing");

        // Restart the CSS animation.
        void description.offsetWidth;

        description.classList.add("is-changing");

        window.setTimeout(() => {
            descriptionTitle.textContent = title;
            descriptionText.textContent = text;
        }, 160);
    }

    function updatePagination() {
        if (!pagination) {
            return;
        }

        const dots = pagination.querySelectorAll(".carousel-dot");

        dots.forEach((dot, index) => {
            const isActive = index === activeIndex;

            dot.classList.toggle("is-active", isActive);
            dot.classList.toggle(
                "carousel-dot--active",
                isActive
            );

            if (isActive) {
                dot.setAttribute("aria-current", "true");
            } else {
                dot.removeAttribute("aria-current");
            }
        });
    }

    function updateCarousel() {
        cards.forEach((card, index) => {
            card.classList.remove(
                "game-card--active",
                "is-active",
                "is-previous",
                "is-next",
                "is-hidden-left",
                "is-hidden-right"
            );

            const distance = getCircularDistance(
                index,
                activeIndex
            );

            if (distance === 0) {
                card.classList.add(
                    "game-card--active",
                    "is-active"
                );

                card.setAttribute("aria-hidden", "false");
            } else if (distance === -1) {
                card.classList.add("is-previous");
                card.setAttribute("aria-hidden", "false");
            } else if (distance === 1) {
                card.classList.add("is-next");
                card.setAttribute("aria-hidden", "false");
            } else if (distance < 0) {
                card.classList.add("is-hidden-left");
                card.setAttribute("aria-hidden", "true");
            } else {
                card.classList.add("is-hidden-right");
                card.setAttribute("aria-hidden", "true");
            }

            const link = card.querySelector(".game-card__link");

            if (link) {
                const isActive = index === activeIndex;

                link.tabIndex = isActive ? 0 : -1;
            }
        });

        updatePagination();
        updateDescription(cards[activeIndex]);
    }

    function goToSlide(index) {
        activeIndex = wrapIndex(index);
        updateCarousel();
    }

    function showPrevious() {
        goToSlide(activeIndex - 1);
    }

    function showNext() {
        goToSlide(activeIndex + 1);
    }

    function createPagination() {
        if (!pagination) {
            return;
        }

        pagination.innerHTML = "";

        cards.forEach((card, index) => {
            const dot = document.createElement("button");

            dot.type = "button";
            dot.className = "carousel-dot";

            const title =
                card.dataset.gameTitle ||
                `Game ${index + 1}`;

            dot.setAttribute(
                "aria-label",
                `Show ${title}`
            );

            dot.addEventListener("click", () => {
                goToSlide(index);
            });

            pagination.appendChild(dot);
        });
    }

    previousButton?.addEventListener(
        "click",
        showPrevious
    );

    nextButton?.addEventListener(
        "click",
        showNext
    );

    /*
     * Card clicks
     *
     * Side card:
     * Move it to the center.
     *
     * Active real game:
     * Allow its link to open normally.
     *
     * Active placeholder:
     * Do nothing.
     */
    cards.forEach((card, index) => {
        card.addEventListener("click", (event) => {
            if (didDrag) {
                event.preventDefault();
                return;
            }

            if (index !== activeIndex) {
                event.preventDefault();
                goToSlide(index);
                return;
            }

            if (
                card.classList.contains(
                    "game-card--placeholder"
                )
            ) {
                event.preventDefault();
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            showPrevious();
        }

        if (event.key === "ArrowRight") {
            showNext();
        }
    });

    carousel.addEventListener("pointerdown", (event) => {
        isDragging = true;
        didDrag = false;

        pointerStartX = event.clientX;
        pointerCurrentX = event.clientX;
    });

    window.addEventListener("pointermove", (event) => {
        if (!isDragging) {
            return;
        }

        pointerCurrentX = event.clientX;

        const distance = Math.abs(
            pointerCurrentX - pointerStartX
        );

        if (distance > dragThreshold) {
            didDrag = true;
        }
    });

    window.addEventListener("pointerup", () => {
        if (!isDragging) {
            return;
        }

        const distance =
            pointerCurrentX - pointerStartX;

        isDragging = false;

        if (Math.abs(distance) >= swipeThreshold) {
            if (distance > 0) {
                showPrevious();
            } else {
                showNext();
            }
        }

        // Wait until the browser's click event has finished.
        window.setTimeout(() => {
            didDrag = false;
        }, 0);
    });

    window.addEventListener("pointercancel", () => {
        isDragging = false;
        didDrag = false;
    });

    createPagination();
    updateCarousel();
});