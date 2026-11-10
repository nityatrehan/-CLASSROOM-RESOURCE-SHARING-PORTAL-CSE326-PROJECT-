
const KEYS = {
    resources: "campusShareResources",
    bookmarks: "campusShareBookmarks",
    ratings: "campusShareRatings"
};

const sampleResources = [
    {
        id: "sample-1",
        title: "Python Programming — Unit 1 Notes",
        subject: "Python Programming",
        type: "Notes",
        description: "Beginner-friendly overview of Python basics, variables, data types and operators.",
        url: "https://www.python.org/about/gettingstarted/",
        author: "Faculty Resource Desk",
        date: "2026-10-20",
        rating: 4.8,
        ratingCount: 12
    },
    {
        id: "sample-2",
        title: "Mathematics Formula Sheet",
        subject: "Mathematics",
        type: "Study Guide",
        description: "A quick revision resource for important formulas and problem-solving methods.",
        url: "https://www.khanacademy.org/math",
        author: "Student Contributor",
        date: "2026-10-19",
        rating: 4.6,
        ratingCount: 9
    },
    {
        id: "sample-3",
        title: "HTML and CSS — Getting Started",
        subject: "Web Development",
        type: "Useful Link",
        description: "Learn the foundations of web page structure, styling and responsive layouts.",
        url: "https://developer.mozilla.org/en-US/docs/Learn",
        author: "Faculty Resource Desk",
        date: "2026-10-18",
        rating: 4.9,
        ratingCount: 15
    },
    {
        id: "sample-4",
        title: "Digital Electronics Presentation",
        subject: "Electronics",
        type: "Presentation",
        description: "Introductory learning material for digital logic, binary numbers and logic gates.",
        url: "https://learn.sparkfun.com/tutorials/digital-logic/all",
        author: "Student Contributor",
        date: "2026-10-16",
        rating: 4.4,
        ratingCount: 7
    },
    {
        id: "sample-5",
        title: "Environmental Science Revision Guide",
        subject: "Environmental Science",
        type: "Study Guide",
        description: "Revision topics covering ecosystems, natural resources and environmental awareness.",
        url: "https://www.un.org/en/climatechange",
        author: "Faculty Resource Desk",
        date: "2026-10-15",
        rating: 4.7,
        ratingCount: 11
    },
    {
        id: "sample-6",
        title: "JavaScript Fundamentals",
        subject: "Web Development",
        type: "Notes",
        description: "Understand variables, functions, events and DOM updates for interactive websites.",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
        author: "Student Contributor",
        date: "2026-10-14",
        rating: 4.8,
        ratingCount: 10
    },
    {
        id: "sample-7",
        title: "Lab Report Template",
        subject: "Other",
        type: "Template",
        description: "A simple structure for recording the aim, requirements, procedure, observations and result.",
        url: "https://www.overleaf.com/learn/latex/Learn_LaTeX_in_30_minutes",
        author: "Student Contributor",
        date: "2026-10-12",
        rating: 4.2,
        ratingCount: 5
    },
    {
        id: "sample-8",
        title: "Python Practice and Examples",
        subject: "Python Programming",
        type: "Useful Link",
        description: "Practise core programming concepts with examples and beginner learning resources.",
        url: "https://www.w3schools.com/python/",
        author: "Faculty Resource Desk",
        date: "2026-10-10",
        rating: 4.6,
        ratingCount: 8
    },
    {
        id: "sample-9",
        title: "Electronics Learning Resources",
        subject: "Electronics",
        type: "Notes",
        description: "Reference material for understanding basic electronic components and circuits.",
        url: "https://www.electronics-tutorials.ws/",
        author: "Student Contributor",
        date: "2026-10-08",
        rating: 4.3,
        ratingCount: 6
    }
];

function loadData(key, fallback) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : fallback;
    } catch (error) {
        return fallback;
    }
}

function saveData(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        showToast("Browser storage is unavailable. Your change may not be saved.");
    }
}

let resources = loadData(KEYS.resources, sampleResources);
let bookmarks = loadData(KEYS.bookmarks, []);
let ratings = loadData(KEYS.ratings, {});
let showOnlyBookmarks = false;

const resourceList = document.getElementById("resourceList");
const searchInput = document.getElementById("searchInput");
const subjectFilter = document.getElementById("subjectFilter");
const typeFilter = document.getElementById("typeFilter");
const sortFilter = document.getElementById("sortFilter");
const emptyState = document.getElementById("emptyState");
const resultsMessage = document.getElementById("resultsMessage");
const formMessage = document.getElementById("formMessage");
const toast = document.getElementById("toast");

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function validWebURL(value) {
    try {
        const url = new URL(value);
        return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch (error) {
        return "";
    }
}

function formatDate(value) {
    const date = new Date(value + "T12:00:00");

    if (Number.isNaN(date.getTime())) {
        return "Recently added";
    }

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function personalRating(id) {
    return Number(ratings[id] || 0);
}

function averageRating(item) {
    const ownRating = personalRating(item.id);
    const count = Number(item.ratingCount || 0);

    if (!ownRating) {
        return Number(item.rating || 0);
    }

    if (!count) {
        return ownRating;
    }

    return (
        (Number(item.rating || 0) * count + ownRating) /
        (count + 1)
    );
}

function updateSubjectOptions() {
    const previous = subjectFilter.value || "all";

    const subjects = [
        ...new Set(resources.map(item => item.subject))
    ].sort((a, b) => a.localeCompare(b));

    subjectFilter.innerHTML =
        '<option value="all">All subjects</option>' +
        subjects.map(subject =>
            `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`
        ).join("");

    subjectFilter.value = subjects.includes(previous) ? previous : "all";
}

function updateStatistics() {
    document.getElementById("totalResources").textContent = resources.length;

    document.getElementById("totalSubjects").textContent =
        new Set(resources.map(item => item.subject)).size;

    document.getElementById("totalBookmarks").textContent = bookmarks.length;
    document.getElementById("bookmarkCount").textContent = bookmarks.length;
}

function getVisibleResources() {
    const query = searchInput.value.trim().toLowerCase();

    let visible = resources.filter(item => {
        const allText = [
            item.title,
            item.subject,
            item.type,
            item.description,
            item.author
        ].join(" ").toLowerCase();

        return (
            (!query || allText.includes(query)) &&
            (subjectFilter.value === "all" ||
                item.subject === subjectFilter.value) &&
            (typeFilter.value === "all" ||
                item.type === typeFilter.value) &&
            (!showOnlyBookmarks || bookmarks.includes(item.id))
        );
    });

    if (sortFilter.value === "title") {
        visible.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortFilter.value === "rating") {
        visible.sort((a, b) => averageRating(b) - averageRating(a));
    } else {
        visible.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    return visible;
}

function typeClass(type) {
    return type.toLowerCase().replace(/\s+/g, "-");
}

function makeResourceCard(item) {
    const saved = bookmarks.includes(item.id);
    const ownRating = personalRating(item.id);
    const rating = averageRating(item);
    const url = validWebURL(item.url);

    return `
        <article class="resource-card">
            <div class="resource-top">
                <span class="type-badge ${typeClass(item.type)}">
                    ${escapeHTML(item.type)}
                </span>

                <button
                    class="bookmark-button ${saved ? "saved" : ""}"
                    data-bookmark="${escapeHTML(item.id)}"
                    type="button"
                    aria-label="${saved ? "Remove bookmark" : "Bookmark"} ${escapeHTML(item.title)}"
                >${saved ? "♥" : "♡"}</button>
            </div>

            <h3>${escapeHTML(item.title)}</h3>
            <p class="description">${escapeHTML(item.description)}</p>

            <div class="resource-meta">
                <span class="meta-chip">${escapeHTML(item.subject)}</span>
                <span class="meta-chip">${escapeHTML(formatDate(item.date))}</span>
            </div>

            <div class="resource-bottom">
                <span class="author">By ${escapeHTML(item.author || "Student Contributor")}</span>
                <span class="rating" title="Average rating">★ ${rating.toFixed(1)}</span>
            </div>

            <div class="resource-bottom rating-actions">
                <span class="author">${ownRating ? "Your rating" : "Rate this resource"}</span>
                <span class="rating">
                    ${[1, 2, 3, 4, 5].map(number =>
                        `<button
                            type="button"
                            data-rate="${number}"
                            data-id="${escapeHTML(item.id)}"
                            class="${ownRating >= number ? "rated" : ""}"
                            aria-label="Rate ${number} out of 5"
                        >${ownRating >= number ? "★" : "☆"}</button>`
                    ).join("")}
                </span>
            </div>

            ${url
                ? `<a class="open-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">Open resource ↗</a>`
                : `<span class="open-link">No valid resource link</span>`
            }
        </article>
    `;
}

function renderResources() {
    const visible = getVisibleResources();

    resourceList.innerHTML = visible.map(makeResourceCard).join("");

    emptyState.classList.toggle("hidden", visible.length > 0);
    resourceList.classList.toggle("hidden", visible.length === 0);

    resultsMessage.textContent =
        `Showing ${visible.length} of ${resources.length} resource${resources.length === 1 ? "" : "s"}`;

    document.getElementById("bookmarksOnly").textContent =
        showOnlyBookmarks ? "Show all resources" : "♡ Show bookmarks only";

    updateStatistics();
}

function refreshPage() {
    updateSubjectOptions();
    renderResources();
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        toast.classList.remove("show");
    }, 2400);
}

function clearAllFilters() {
    searchInput.value = "";
    subjectFilter.value = "all";
    typeFilter.value = "all";
    sortFilter.value = "newest";
    showOnlyBookmarks = false;

    renderResources();
}

function toggleBookmark(id) {
    if (bookmarks.includes(id)) {
        bookmarks = bookmarks.filter(bookmarkId => bookmarkId !== id);
    } else {
        bookmarks.push(id);
    }

    saveData(KEYS.bookmarks, bookmarks);
    renderResources();

    showToast(
        bookmarks.includes(id)
            ? "Resource bookmarked."
            : "Bookmark removed."
    );
}

searchInput.addEventListener("input", renderResources);
subjectFilter.addEventListener("change", renderResources);
typeFilter.addEventListener("change", renderResources);
sortFilter.addEventListener("change", renderResources);

document.getElementById("clearFilters")
    .addEventListener("click", clearAllFilters);

document.getElementById("emptyClear")
    .addEventListener("click", clearAllFilters);

document.getElementById("bookmarksOnly").addEventListener("click", () => {
    showOnlyBookmarks = !showOnlyBookmarks;
    renderResources();
});

document.getElementById("bookmarksNav").addEventListener("click", () => {
    showOnlyBookmarks = true;
    renderResources();

    document.getElementById("resources").scrollIntoView({
        behavior: "smooth"
    });
});

resourceList.addEventListener("click", event => {
    const bookmarkButton = event.target.closest("[data-bookmark]");

    if (bookmarkButton) {
        toggleBookmark(bookmarkButton.dataset.bookmark);
        return;
    }

    const ratingButton = event.target.closest("[data-rate]");

    if (ratingButton) {
        ratings[ratingButton.dataset.id] = Number(ratingButton.dataset.rate);

        saveData(KEYS.ratings, ratings);
        renderResources();

        showToast("Thank you for rating this resource!");
    }
});

document.getElementById("resourceForm").addEventListener("submit", event => {
    event.preventDefault();

    formMessage.textContent = "";
    formMessage.classList.remove("error");

    const title = document.getElementById("resourceTitle").value.trim();
    const subject = document.getElementById("resourceSubject").value;
    const type = document.getElementById("resourceType").value;
    const description = document.getElementById("resourceDescription").value.trim();
    const url = validWebURL(
        document.getElementById("resourceUrl").value.trim()
    );
    const author =
        document.getElementById("resourceAuthor").value.trim() ||
        "Student Contributor";

    if (!title || !subject || !type || !description || !url) {
        formMessage.textContent =
            "Complete all required fields and enter a valid http:// or https:// link.";

        formMessage.classList.add("error");
        return;
    }

    const newResource = {
        id: "user-" + Date.now().toString(36) +
            Math.random().toString(36).slice(2, 7),
        title,
        subject,
        type,
        description,
        url,
        author,
        date: new Date().toISOString().slice(0, 10),
        rating: 0,
        ratingCount: 0
    };

    resources.unshift(newResource);
    saveData(KEYS.resources, resources);

    event.target.reset();

    showOnlyBookmarks = false;
    searchInput.value = "";
    subjectFilter.value = "all";
    typeFilter.value = "all";
    sortFilter.value = "newest";

    formMessage.textContent =
        "Resource added to this browser's demo library.";

    refreshPage();
    showToast("Resource added successfully.");

    document.getElementById("resources").scrollIntoView({
        behavior: "smooth"
    });
});

refreshPage();