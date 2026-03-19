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
   * שליפת פוסטים עם תמיכה ב-Paging
   * @param page מספר העמוד המבוקש
   * @param limit כמות פוסטים לעמוד
   */
  getPosts: (page: number = 1, limit: number = 10) => {
    return apiClient.get<PostsResponse>(`/posts?page=${page}&limit=${limit}`);
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