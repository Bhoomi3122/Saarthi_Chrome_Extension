document.addEventListener("DOMContentLoaded", function () {
    const siteCheckboxes = document.querySelectorAll(".site");
    const blockOneHour = document.getElementById("blockOneHour");
    const blockUntilNextVisit = document.getElementById("blockUntilNextVisit");

    // Load saved blocked sites and update UI
    chrome.storage.local.get(["blockedSites"], (data) => {
        if (data.blockedSites) {
            siteCheckboxes.forEach((checkbox) => {
                checkbox.checked = data.blockedSites.includes(checkbox.value);
            });
        }
    });

    // Function to show toast message
    function showToast(message) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.innerText = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 500);
        }, 2000);
    }

    // Function to block notifications
    function blockNotifications(duration) {
        let selectedSites = [...siteCheckboxes]
            .filter((checkbox) => checkbox.checked)
            .map((checkbox) => checkbox.value);

        if (selectedSites.length === 0) {
            alert("Please select at least one website to block.");
            return;
        }

        chrome.storage.local.set({ blockedSites: selectedSites });

        selectedSites.forEach((site) => {
            chrome.permissions.request(
                { permissions: ["notifications"], origins: [site + "/*"] },
                (granted) => {
                    if (granted) {
                        showToast(`Notifications blocked for ${duration}`);

                        if (duration === "1 Hour") {
                            setTimeout(() => {
                                chrome.permissions.remove({ origins: [site + "/*"] });
                                removeBlockedSite(site);
                            }, 3600000);
                        }
                    }
                }
            );
        });
    }

    // Function to remove a site from storage when unblocked
    function removeBlockedSite(site) {
        chrome.storage.local.get(["blockedSites"], (data) => {
            if (data.blockedSites) {
                let updatedSites = data.blockedSites.filter(s => s !== site);
                chrome.storage.local.set({ blockedSites: updatedSites });
            }
        });
    }

    // Block for 1 Hour
    blockOneHour.addEventListener("click", () => blockNotifications("1 Hour"));

    // Block Until Next Visit
    blockUntilNextVisit.addEventListener("click", () => blockNotifications("Until Next Visit"));

    // Unblock when deselected
    siteCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", function () {
            if (!checkbox.checked) {
                chrome.permissions.remove({ origins: [checkbox.value + "/*"] }, (removed) => {
                    if (removed) {
                        removeBlockedSite(checkbox.value);
                        showToast(`Notifications unblocked for ${checkbox.value}`);
                    }
                });
            }
        });
    });
});
