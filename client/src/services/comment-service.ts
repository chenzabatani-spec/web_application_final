import apiClient from "./api-client";

export interface Comment {
  _id?: string;
  postId: string;
  content: string;
  sender: {
    _id: string;
    username: string;
    photo?: string;
  };
  createdAt?: string;
}

const commentService = {
  getCommentsByPostId: (postId: string) => {
    return apiClient.get<Comment[]>(`/comments?postId=${postId}`);
  },

  createComment: (data: { postId: string; content: string }) => {
    return apiClient.post<Comment>("/comments", data);
  },

  deleteComment: (id: string) => {
    return apiClient.delete(`/comments/${id}`);
  }
};

export default commentService;