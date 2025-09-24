export const getRoleCounts = (users) => {
    const roleMap = {};
    users.forEach((user) => {
        const role = user.role || "Unknown";
        roleMap[role] = (roleMap[role] || 0) + 1;
    });

    return Object.keys(roleMap).map((role) => ({
        role,
        count: roleMap[role],
    }));
};