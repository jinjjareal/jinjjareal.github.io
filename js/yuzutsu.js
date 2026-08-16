document.addEventListener("DOMContentLoaded", () => {
    const previewButton = document.querySelector(".gallery-preview");
    const previewImage = document.querySelector("#gallery-preview-image");

    const galleryItems = Array.from(
        document.querySelectorAll(".gallery-item")
    );

    const lightbox = document.querySelector(".lightbox");
    const lightboxImage = document.querySelector(".lightbox__image");
    const lightboxClose = document.querySelector(".lightbox__close");

    // Stop if the gallery does not exist on the page.
    if (!previewButton || !previewImage || galleryItems.length === 0) {
        return;
    }

    // Find the initially selected thumbnail.
    let selectedIndex = galleryItems.findIndex((item) =>
        item.classList.contains("is-active")
    );

    if (selectedIndex === -1) {
        selectedIndex = 0;
    }


    /* =====================================================
       SELECT SCREENSHOT
       ===================================================== */

    function selectScreenshot(index) {
        const item = galleryItems[index];

        if (!item) {
            return;
        }

        const imagePath = item.dataset.fullImage;

        const imageAlt =
            item.dataset.alt ||
            `Yuzutsu gameplay screenshot ${index + 1}`;

        if (!imagePath) {
            return;
        }

        selectedIndex = index;

        // Update active thumbnail.
        galleryItems.forEach((galleryItem, galleryIndex) => {
            const isActive = galleryIndex === selectedIndex;

            galleryItem.classList.toggle(
                "is-active",
                isActive
            );

            galleryItem.setAttribute(
                "aria-pressed",
                isActive ? "true" : "false"
            );
        });

        // Brief transition before changing the preview.
        previewButton.classList.add("is-changing");

        window.setTimeout(() => {
            previewImage.src = imagePath;
            previewImage.alt = imageAlt;

            previewButton.dataset.fullImage = imagePath;

            previewButton.classList.remove("is-changing");
        }, 120);
    }


    /* =====================================================
       LIGHTBOX
       ===================================================== */

    function openLightbox() {
        if (!lightbox || !lightboxImage) {
            return;
        }

        const imagePath =
            previewButton.dataset.fullImage;

        if (!imagePath) {
            return;
        }

        lightboxImage.src = imagePath;
        lightboxImage.alt = previewImage.alt;

        lightbox.classList.add("is-open");

        lightbox.setAttribute(
            "aria-hidden",
            "false"
        );

        // Prevent page scrolling behind the lightbox.
        document.body.style.overflow = "hidden";

        if (lightboxClose) {
            lightboxClose.focus();
        }
    }


    function closeLightbox() {
        if (!lightbox) {
            return;
        }

        lightbox.classList.remove("is-open");

        lightbox.setAttribute(
            "aria-hidden",
            "true"
        );

        // Restore page scrolling.
        document.body.style.overflow = "";

        previewButton.focus();
    }


    /* =====================================================
       THUMBNAIL CONTROLS
       ===================================================== */

    galleryItems.forEach((item, index) => {
        item.addEventListener("click", () => {
            selectScreenshot(index);
        });
    });


    /* =====================================================
       PREVIEW CONTROL
       ===================================================== */

    previewButton.addEventListener(
        "click",
        openLightbox
    );


    /* =====================================================
       LIGHTBOX CONTROLS
       ===================================================== */

    if (lightboxClose) {
        lightboxClose.addEventListener(
            "click",
            closeLightbox
        );
    }

    // Clicking the dark area outside the image closes it.
    if (lightbox) {
        lightbox.addEventListener("click", (event) => {
            if (event.target === lightbox) {
                closeLightbox();
            }
        });
    }


    /* =====================================================
       KEYBOARD CONTROLS
       ===================================================== */

    document.addEventListener("keydown", (event) => {

        // ESC closes the lightbox.
        if (
            event.key === "Escape" &&
            lightbox?.classList.contains("is-open")
        ) {
            closeLightbox();
            return;
        }

        // Don't change gallery selection while
        // the fullscreen lightbox is open.
        if (lightbox?.classList.contains("is-open")) {
            return;
        }

        // Previous screenshot.
        if (event.key === "ArrowLeft") {
            const nextIndex =
                (
                    selectedIndex -
                    1 +
                    galleryItems.length
                ) %
                galleryItems.length;

            selectScreenshot(nextIndex);
        }

        // Next screenshot.
        if (event.key === "ArrowRight") {
            const nextIndex =
                (
                    selectedIndex +
                    1
                ) %
                galleryItems.length;

            selectScreenshot(nextIndex);
        }
    });


    /* =====================================================
       INITIALIZE
       ===================================================== */

    selectScreenshot(selectedIndex);
});