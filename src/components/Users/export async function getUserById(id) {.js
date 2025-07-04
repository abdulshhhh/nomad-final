export async function getUserById(id) {
  // Replace with your real API call
  const res = await fetch(`/api/users/${id}`);
  return res.json();
}