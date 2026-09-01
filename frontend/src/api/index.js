export * from "./services";
export { default as apiClient } from "./client";

export async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  } catch (error) {
    throw new Error("Error fetching data");
  }
}
