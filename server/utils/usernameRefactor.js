function getUsernameFromEmail(email) {
    const namePart = email.split("@")[0]; // Extract the part before @
    const filteredName = namePart.replace(/[^a-zA-Z]/g, ""); // Remove numbers and special characters
    return filteredName.charAt(0).toUpperCase() + filteredName.slice(1); // Capitalize first letter
}

module.exports = getUsernameFromEmail;