import apiClient from "./api-client";

export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  photo?: string;
}

const userService = {
  /**
   * Updates the user's profile information, including the option to upload a new profile picture.
   * @param id user ID
   * @param formData the new information (including a new profile picture file if applicable)
   */
  updateUser: (id: string, formData: FormData) => {
    return apiClient.put<UserProfile>(`/users/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }
};

export default userService;