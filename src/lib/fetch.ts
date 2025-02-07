import axios from "axios";

export const refreshToken = async (token: string) => {
  const refresh_token = await axios.get(
    `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`
  );

  return refresh_token.data;
};

export const sendDM = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log("sending message");
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/messages`,
    {
      recipient: {
        id: recieverId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const sendPrivateMessage = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string
) => {
  console.log("sending message");
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/${userId}/messages`,
    {
      recipient: {
        comment_id: recieverId,
      },
      message: {
        text: prompt,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const generateTokens = async (code: string) => {
  try {
    const formData = new FormData();
    formData.append("client_id", process.env.INSTAGRAM_CLIENT_ID!);
    formData.append("client_secret", process.env.INSTAGRAM_CLIENT_SECRET!);
    formData.append("grant_type", "authorization_code");
    formData.append(
      "redirect_uri", 
      `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`
    );
    formData.append("code", code);

    // Get short-lived token
    const shortTokenResponse = await fetch(process.env.INSTAGRAM_TOKEN_URL!, {
      method: "POST",
      body: formData
    });

    if (!shortTokenResponse.ok) {
      throw new Error("Failed to get short-lived token");
    }

    const shortToken = await shortTokenResponse.json();

    // Exchange for long-lived token
    const longTokenResponse = await fetch(
      `${process.env.INSTAGRAM_BASE_URL}/access_token?grant_type=ig_exchange_token&client_secret=${process.env.INSTAGRAM_CLIENT_SECRET}&access_token=${shortToken.access_token}`,
      { method: "GET" }
    );

    if (!longTokenResponse.ok) {
      throw new Error("Failed to get long-lived token");
    }

    const longToken = await longTokenResponse.json();

    // Fetch Instagram User ID
    const userProfileResponse = await fetch(
      `${process.env.INSTAGRAM_BASE_URL}/me?fields=id&access_token=${longToken.access_token}`
    );

    if (!userProfileResponse.ok) {
      throw new Error("Failed to fetch user profile");
    }

    const userProfile = await userProfileResponse.json();

    return {
      access_token: longToken.access_token,
      instagram_id: userProfile.id
    };
  } catch (error) {
    console.error("Token Generation Error:", error);
    throw error;
  }
};