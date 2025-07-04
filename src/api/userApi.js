// Mock: get all users
export async function getAllUsers() {
  // Replace the URL with your actual backend endpoint
  const response = await fetch("http://localhost:5000/api/users", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // Add authorization headers if needed
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch users");
  }

  return await response.json();
}

// Mock: get user by ID
export async function getUserById(id) {
  const users = await getAllUsers();
  return users.find((u) => String(u.id) === String(id));
}