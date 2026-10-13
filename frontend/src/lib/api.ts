/**
 * REST API Client for FlashLearn AI Backend.
 *
 * Educational Notes for Students:
 * ------------------------------
 * 1. Centralized base URL configuration: In development, requests target http://localhost:8000.
 *    In production on Cloud Run, NEXT_PUBLIC_API_URL points to the live backend service.
 * 2. Token storage: Handles Authorization Bearer headers for private endpoints.
 * 3. Graceful error handling: Extracts user-friendly error messages from backend responses.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

class ApiClient {
  private getAuthHeader(): Record<string, string> {
    if (typeof window === "undefined") return {};
    const token = localStorage.getItem("flashlearn_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch {
        errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth Endpoints
  async register(data: { email: string; password: string; full_name?: string }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ access_token: string; refresh_token: string }>(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async getProfile() {
    return this.request("/auth/me");
  }

  // Course & AI Generation Endpoints
  async generateCourse(data: { title?: string; lecture_text: string }) {
    return this.request("/courses/generate", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCourse(courseId: string) {
    return this.request(`/courses/${courseId}`);
  }
}

export const api = new ApiClient();
