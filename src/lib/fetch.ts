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

export const replyToComment = async (commentId: string, message: string, token: string) => {
  console.log("replying to comment");
  // Encode the message for URL safety
  const encodedMessage = encodeURIComponent(message);
  // Include API version and pass message as a query parameter
  return await axios.post(
    `${process.env.INSTAGRAM_BASE_URL}/v21.0/${commentId}/replies?message=${encodedMessage}`,
    {}, // Empty body as required by the API
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
};

export const sendCarouselMessage = async (
  userId: string,
  receiverId: string,
  elements: {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    defaultAction?: string;
    buttons?: {
      type: "web_url" | "postback";
      title: string;
      url?: string;
      payload?: string;
    }[];
  }[],
  token: string
) => {
  try {
    // Validate minimum requirements
    if (elements.length === 0) {
      throw new Error("At least one carousel element is required");
    }

    const formattedElements = elements.map((element, index) => {
      // Validate element requirements
      if (!element.title) {
        throw new Error(`Element ${index + 1} is missing title`);
      }
      
      // At least one additional property required (per Instagram docs)
      const hasAdditionalProperties = element.subtitle || element.imageUrl || 
                                    element.defaultAction || element.buttons;
      if (!hasAdditionalProperties) {
        throw new Error(`Element ${index + 1} needs at least one of: subtitle, imageUrl, defaultAction, or buttons`);
      }

      // Format element according to API specs
      return {
        title: element.title.substring(0, 80),
        subtitle: element.subtitle?.substring(0, 80),
        image_url: element.imageUrl,
        default_action: element.defaultAction ? {
          type: "web_url",
          url: element.defaultAction,
          webview_height_ratio: "full"
        } : undefined,
        buttons: element.buttons?.slice(0, 3).map(button => {
          if (button.type === "web_url" && !button.url) {
            throw new Error(`Web URL button in element ${index + 1} is missing URL`);
          }
          if (button.type === "postback" && !button.payload) {
            throw new Error(`Postback button in element ${index + 1} is missing payload`);
          }
          
          return {
            type: button.type,
            title: button.title.substring(0, 20),
            ...(button.url && { url: button.url }),
            ...(button.payload && { payload: button.payload })
          };
        })
      };
    }).slice(0, 10); // Instagram's maximum of 10 elements

    // Structure matching the working sendDM pattern
    const payload = {
      recipient: { id: receiverId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: formattedElements
          }
        }
      }
    };

    // Use the same base URL and version pattern as working sendDM
    const response = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error sending carousel:", error);
    
    let errorMessage = "Failed to send carousel message";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

export const generateTokens = async (code: string) => {
  try {
    // Validate input
    if (!code) {
      throw new Error("Authorization code is required");
    }

    // Validate environment variables
    const requiredEnvVars = [
      "INSTAGRAM_CLIENT_ID",
      "INSTAGRAM_CLIENT_SECRET",
      "NEXT_PUBLIC_HOST_URL",
      "INSTAGRAM_TOKEN_URL",
      "INSTAGRAM_BASE_URL",
    ];

    requiredEnvVars.forEach((varName) => {
      if (!process.env[varName]) {
        throw new Error(`Missing required environment variable: ${varName}`);
      }
    });

    const insta_form = new FormData();
    insta_form.append("client_id", process.env.INSTAGRAM_CLIENT_ID!);
    insta_form.append("client_secret", process.env.INSTAGRAM_CLIENT_SECRET!);
    insta_form.append("grant_type", "authorization_code");
    insta_form.append(
      "redirect_uri",
      `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`
    );
    insta_form.append("code", code);

    const shortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL!, {
      method: "POST",
      body: insta_form,
    });

    if (!shortTokenRes.ok) {
      const errorText = await shortTokenRes.text();
      throw new Error(
        `Token request failed: ${shortTokenRes.status} - ${errorText}`
      );
    }

    const token = await shortTokenRes.json();
    console.log("Short-term token generated:", token);

    if (!token || !token.access_token) {
      throw new Error("Invalid token response");
    }

    // Check permissions (if required)
    if (!token.permissions || token.permissions.length === 0) {
      throw new Error("Insufficient permissions");
    }

    const longTokenResponse = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/access_token`,
      {
        params: {
          grant_type: "ig_exchange_token",
          client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
          access_token: token.access_token,
        },
      }
    );
    console.log("Long-term token generated:", longTokenResponse.data);

    return longTokenResponse.data;
  } catch (error) {
    console.error("Instagram Token Generation Error:", error);

    let errorMessage = "Unexpected error in token generation";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    throw new Error(errorMessage);
  }
};

