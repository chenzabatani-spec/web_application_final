import apiClient from "./api-client";

// Define TypeScript interfaces for the expected structure of search results and responses from the server
export interface SearchResult {
  postId: string;
  text: string;
  score: number;
}

export interface SearchResponse {
  message: string;
  results: SearchResult[];
}

class AiService {
  // Method to perform a semantic search by sending a query to the server's /ai/search endpoint
  searchSimilarPosts(query: string) {
    const controller = new AbortController();
    
    // Send a POST request to the server with the search query, and include the abort signal for cancellation
    const request = apiClient.post<SearchResponse>(
      "/ai/search", 
      { query: query }, 
      { signal: controller.signal }
    );

    return { request, cancel: () => controller.abort() };
  }
}

export default new AiService();