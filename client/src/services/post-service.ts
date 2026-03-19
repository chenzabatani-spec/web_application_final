import apiClient from "./api-client";

export type Post = {
  _id?: string;
  title: string;
  content?: string;
  sender: {
    _id: string;
    username: string;
    email: string;
    photo?: string;
  };
  photo?: string;
  likes: string[];
  createdAt: string;
}

export interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  totalPages: number;
}

const postService = {
  /**
   * Fetches posts with pagination 
   * @param page number of the requested page
   * @param limit number of posts per page
   * @param senderId optional filter to fetch posts by a specific sender
   */
  getPosts: (page: number = 1, limit: number = 10, senderId?: string) => {
    let url = `/posts?page=${page}&limit=${limit}`;
    if (senderId) {
      url += `&senderId=${senderId}`;
    }
    return apiClient.get<PostsResponse>(url);
  },

  
  createPost: (formData: FormData) => {
    return apiClient.post<Post>("/posts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },


  updatePost: (id: string, formData: FormData) => {
    return apiClient.put<Post>(`/posts/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },


  deletePost: (id: string) => {
    return apiClient.delete(`/posts/${id}`);
  },


  toggleLike: (id: string) => {
    return apiClient.patch<Post>(`/posts/${id}/like`);
  }
};

export default postService;