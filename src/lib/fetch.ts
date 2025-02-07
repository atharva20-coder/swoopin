import axios from "axios";

export const generateTokens = async (code: string) => {
  const formData = new FormData();
  formData.append("client_id", process.env.INSTAGRAM_CLIENT_ID!);
  formData.append("client_secret", process.env.INSTAGRAM_CLIENT_SECRET!);
  formData.append("grant_type", "authorization_code");
  formData.append("redirect_uri", `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`);
  formData.append("code", code);

  try {
    // Exchange code for short-lived token
    const tokenResponse = await axios.post(
      "https://api.instagram.com/oauth/access_token", 
      formData
    );

    // Exchange for long-lived token
    const longTokenResponse = await axios.get(
      "https://graph.instagram.com/access_token", 
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          access_token: tokenResponse.data.access_token
        }
      }
    );

    // Fetch Instagram User ID
    const userProfileResponse = await axios.get(
      `https://graph.instagram.com/me?fields=id&access_token=${longTokenResponse.data.access_token}`
    );

    return {
      access_token: longTokenResponse.data.access_token,
      instagram_id: userProfileResponse.data.id
    };
  } catch (error) {
    console.error("Token Generation Error:", error);
    throw error;
  }
};

export const refreshToken = async (token: string) => {
  try {
    const response = await axios.get(
      `https://graph.instagram.com/access_token?grant_type=ig_refresh_token&access_token=${token}`
    );
    return response.data;
  } catch (error) {
    console.error("Token Refresh Error:", error);
    throw error;
  }
};