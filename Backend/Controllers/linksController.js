const Link = require('../Models/Link');

// Create new link
exports.createLink = async (req, res) => {
    try {
        const { name, url } = req.body;

        // Ensure the user is authenticated and req.user.id is available
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User is not authenticated" });
        }
        console.log("User from token:", req.user);
        // Create a new Link with the user ID, name, and URL
        const newLink = new Link({
            user: req.user.id,  // Save the user ID from the authenticated user
            name,
            url
        });

        // Save the new link to the database
        const savedLink = await newLink.save();

        // Return the saved link in the response
        res.status(201).json(savedLink);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json({ error: "Failed to create link" });
    }
};


// Get all links for user
exports.getLinks = async (req, res) => {
    try {
        const links = await Link.find({ user: req.user.id });
        res.json(links);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch links" });
    }
};

// Update link
exports.updateLink = async (req, res) => {
    try {
        const { name, url } = req.body;
        const updated = await Link.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { name, url },
            { new: true }
        );
        if (!updated) return res.status(404).json({ error: "Link not found or unauthorized" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Failed to update link" });
    }
};

// Delete link
exports.deleteLink = async (req, res) => {
    try {
        // Ensure the user is authenticated
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: "User is not authenticated" });
        }

        // Extract the link ID from the request params
        const linkId = req.params.id;

        // Find and delete the link that matches the given link ID and user ID
        const deleted = await Link.findOneAndDelete({
            _id: linkId,
            user: req.user.id
        });

        // If no link is found or the user is unauthorized, return an error message
        if (!deleted) {
            return res.status(404).json({ error: "Link not found or unauthorized" });
        }

        // Send success response after deletion
        res.json({ message: "Link deleted successfully"});

    } catch (err) {
        // Catch and log any errors
        console.error(err);
        res.status(500).json({ error: "Failed to delete link" });
    }
};
