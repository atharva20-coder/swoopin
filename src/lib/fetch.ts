import axios from "axios";

export const refreshToken = async (token: string) => {
  const refresh_token = await axios.get(
    `${process.env.INSTAGRAM_BASE_URL}/refresh_access_token?grant_type=ig_refresh_token&access_token=${token}`,
  );

  return refresh_token.data;
};

/**
 * Instagram User Profile API
 * Fetches profile details for an Instagram user (the connected account)
 * Returns: name, username, profile_pic, follower_count, is_verified_user, etc.
 */
export type InstagramProfile = {
  id: string;
  name?: string;
  username?: string;
  profile_pic?: string;
  follower_count?: number;
  is_verified_user?: boolean;
  is_user_follow_business?: boolean;
  is_business_follow_user?: boolean;
};

export const getInstagramUserProfile = async (
  token: string,
): Promise<{ success: boolean; data?: InstagramProfile; error?: string }> => {
  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/me`,
      {
        params: {
          fields:
            "id,name,username,profile_picture_url,followers_count,biography",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    // Map response to our profile type
    const profile: InstagramProfile = {
      id: response.data.id,
      name: response.data.name || response.data.username,
      username: response.data.username,
      profile_pic: response.data.profile_picture_url,
      follower_count: response.data.followers_count,
    };

    return { success: true, data: profile };
  } catch (error) {
    console.error("Error fetching Instagram profile:", error);

    let errorMessage = "Failed to fetch Instagram profile";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

export const sendDM = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string,
) => {
  try {
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
      },
    );
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        "[Instagram API] sendDM Failed:",
        JSON.stringify(error.response.data),
      );
    } else {
      console.error("[Instagram API] sendDM Error:", error);
    }
    throw error; // Re-throw to be handled by caller
  }
};

/**
 * Send a sender action (typing indicator or mark seen)
 * Actions: typing_on, typing_off, mark_seen
 */
export const sendSenderAction = async (
  pageId: string,
  recipientId: string,
  action: "typing_on" | "typing_off" | "mark_seen",
  token: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${pageId}/messages`,
      {
        recipient: {
          id: recipientId,
        },
        sender_action: action,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return { success: response.status === 200 };
  } catch (error) {
    console.error(`Error sending sender action ${action}:`, error);

    let errorMessage = `Failed to send ${action}`;
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Send a Product Template message
 * Displays product(s) from Facebook catalog with image, title, price
 * Can send single product or carousel of up to 10 products
 */
export const sendProductTemplate = async (
  pageId: string,
  recipientId: string,
  productIds: string[],
  token: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!productIds || productIds.length === 0) {
      return { success: false, error: "At least one product ID is required" };
    }
    if (productIds.length > 10) {
      return {
        success: false,
        error: "Maximum 10 products allowed in a carousel",
      };
    }

    const elements = productIds.map((id) => ({ id }));

    const response = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${pageId}/messages`,
      {
        recipient: {
          id: recipientId,
        },
        message: {
          attachment: {
            type: "template",
            payload: {
              template_type: "product",
              elements,
            },
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: response.status === 200,
      messageId: response.data?.message_id,
    };
  } catch (error) {
    console.error("Error sending product template:", error);

    let errorMessage = "Failed to send product template";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Send a message with Quick Replies
 * Quick replies provide buttons for users to tap instead of typing
 * Max 13 quick replies, each title max 20 characters
 */
export const sendQuickReplies = async (
  pageId: string,
  recipientId: string,
  text: string,
  quickReplies: Array<{
    content_type: "text" | "user_phone_number";
    title?: string;
    payload?: string;
  }>,
  token: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    if (!text) {
      return { success: false, error: "Message text is required" };
    }
    if (!quickReplies || quickReplies.length === 0) {
      return { success: false, error: "At least one quick reply is required" };
    }
    if (quickReplies.length > 13) {
      return { success: false, error: "Maximum 13 quick replies allowed" };
    }

    // Format quick replies - truncate titles to 20 chars
    const formattedReplies = quickReplies.map((qr) => {
      if (qr.content_type === "user_phone_number") {
        return { content_type: "user_phone_number" };
      }
      return {
        content_type: "text",
        title: (qr.title || "").substring(0, 20),
        payload: qr.payload || qr.title || "",
      };
    });

    const response = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${pageId}/messages`,
      {
        recipient: {
          id: recipientId,
        },
        messaging_type: "RESPONSE",
        message: {
          text,
          quick_replies: formattedReplies,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return {
      success: response.status === 200,
      messageId: response.data?.message_id,
    };
  } catch (error) {
    console.error("Error sending quick replies:", error);

    let errorMessage = "Failed to send quick replies";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

export const sendPrivateMessage = async (
  userId: string,
  recieverId: string,
  prompt: string,
  token: string,
) => {
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
    },
  );
};

export const replyToComment = async (
  commentId: string,
  message: string,
  token: string,
) => {
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
    },
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
  token: string,
) => {
  try {
    // Validate minimum requirements
    if (elements.length === 0) {
      throw new Error("At least one carousel element is required");
    }

    const formattedElements = elements
      .map((element, index) => {
        // Validate element requirements
        if (!element.title) {
          throw new Error(`Element ${index + 1} is missing title`);
        }

        // At least one additional property required (per Instagram docs)
        const hasAdditionalProperties =
          element.subtitle ||
          element.imageUrl ||
          element.defaultAction ||
          element.buttons;
        if (!hasAdditionalProperties) {
          throw new Error(
            `Element ${index + 1} needs at least one of: subtitle, imageUrl, defaultAction, or buttons`,
          );
        }

        // Format element according to API specs
        return {
          title: element.title.substring(0, 80),
          subtitle: element.subtitle?.substring(0, 80),
          image_url: element.imageUrl,
          default_action: element.defaultAction
            ? {
                type: "web_url",
                url: element.defaultAction,
                webview_height_ratio: "full",
              }
            : undefined,
          buttons: element.buttons?.slice(0, 3).map((button) => {
            if (button.type === "web_url" && !button.url) {
              throw new Error(
                `Web URL button in element ${index + 1} is missing URL`,
              );
            }
            if (button.type === "postback" && !button.payload) {
              throw new Error(
                `Postback button in element ${index + 1} is missing payload`,
              );
            }

            return {
              type: button.type,
              title: button.title.substring(0, 20),
              ...(button.url && { url: button.url }),
              ...(button.payload && { payload: button.payload }),
            };
          }),
        };
      })
      .slice(0, 10); // Instagram's maximum of 10 elements

    // Structure matching the working sendDM pattern
    const payload = {
      recipient: { id: receiverId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: formattedElements,
          },
        },
      },
    };

    // Use the same base URL and version pattern as working sendDM
    const response = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
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

/**
 * Send a Button Template message via Instagram
 * Button template sends text with up to 3 attached buttons
 */
export const sendButtonTemplate = async (
  userId: string,
  receiverId: string,
  text: string,
  buttons: {
    type: "web_url" | "postback";
    title: string;
    url?: string;
    payload?: string;
  }[],
  token: string,
): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  try {
    // Validate requirements
    if (!text) {
      return { success: false, error: "Text message is required" };
    }
    if (!buttons || buttons.length === 0) {
      return { success: false, error: "At least one button is required" };
    }
    if (buttons.length > 3) {
      return { success: false, error: "Maximum 3 buttons allowed" };
    }

    // Format buttons according to API spec
    const formattedButtons = buttons.map((button, index) => {
      if (!button.title) {
        throw new Error(`Button ${index + 1} is missing title`);
      }
      if (button.type === "web_url" && !button.url) {
        throw new Error(`Web URL button ${index + 1} is missing URL`);
      }
      if (button.type === "postback" && !button.payload) {
        throw new Error(`Postback button ${index + 1} is missing payload`);
      }

      return {
        type: button.type,
        title: button.title.substring(0, 20), // Max 20 chars
        ...(button.url && { url: button.url }),
        ...(button.payload && { payload: button.payload }),
      };
    });

    const payload = {
      recipient: { id: receiverId },
      message: {
        attachment: {
          type: "template",
          payload: {
            template_type: "button",
            text: text.substring(0, 640), // Max 640 chars
            buttons: formattedButtons,
          },
        },
      },
    };

    const response = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}/messages`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return { success: true, messageId: response.data.message_id };
  } catch (error) {
    console.error("Error sending button template:", error);

    let errorMessage = "Failed to send button template";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Set Ice Breakers for Instagram
 * Ice Breakers are FAQ-style questions shown when users start conversations
 * Maximum 4 questions can be set
 */
export const setIceBreakers = async (
  iceBreakers: { question: string; payload: string }[],
  token: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!iceBreakers || iceBreakers.length === 0) {
      return { success: false, error: "At least one ice breaker is required" };
    }
    if (iceBreakers.length > 4) {
      return { success: false, error: "Maximum 4 ice breakers allowed" };
    }

    // Validate each ice breaker
    for (const ib of iceBreakers) {
      if (!ib.question || !ib.payload) {
        return {
          success: false,
          error: "Each ice breaker requires a question and payload",
        };
      }
    }

    // Use the new format with localization support
    const payload = {
      platform: "instagram",
      ice_breakers: [
        {
          call_to_actions: iceBreakers.map((ib) => ({
            question: ib.question,
            payload: ib.payload,
          })),
          locale: "default", // default locale is required
        },
      ],
    };

    const response = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/me/messenger_profile?platform=instagram`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return { success: response.data?.result === "success" || !!response.data };
  } catch (error) {
    console.error("Error setting ice breakers:", error);

    let errorMessage = "Failed to set ice breakers";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Get current Ice Breakers configuration
 */
export const getIceBreakers = async (
  token: string,
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/me/messenger_profile`,
      {
        params: {
          fields: "ice_breakers",
          platform: "instagram",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return { success: true, data: response.data?.data || [] };
  } catch (error) {
    console.error("Error getting ice breakers:", error);

    let errorMessage = "Failed to get ice breakers";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Delete all Ice Breakers
 */
export const deleteIceBreakers = async (
  token: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await axios.delete(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/me/messenger_profile?platform=instagram`,
      {
        data: {
          fields: ["ice_breakers"],
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return { success: response.data?.result === "success" || !!response.data };
  } catch (error) {
    console.error("Error deleting ice breakers:", error);

    let errorMessage = "Failed to delete ice breakers";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Set Persistent Menu for Instagram
 * The menu appears in all conversations with web_url and postback buttons
 * Best practice: limit to 5 items
 */
export const setPersistentMenu = async (
  menuItems: {
    type: "web_url" | "postback";
    title: string;
    url?: string;
    payload?: string;
  }[],
  token: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!menuItems || menuItems.length === 0) {
      return { success: false, error: "At least one menu item is required" };
    }

    // Validate each menu item
    for (const item of menuItems) {
      if (!item.title) {
        return { success: false, error: "Each menu item requires a title" };
      }
      if (item.type === "web_url" && !item.url) {
        return { success: false, error: "web_url items require a URL" };
      }
      if (item.type === "postback" && !item.payload) {
        return { success: false, error: "postback items require a payload" };
      }
    }

    // Format menu items
    const callToActions = menuItems.map((item) => ({
      type: item.type,
      title: item.title,
      ...(item.url && { url: item.url }),
      ...(item.payload && { payload: item.payload }),
    }));

    const payload = {
      persistent_menu: [
        {
          locale: "default",
          call_to_actions: callToActions,
        },
      ],
    };

    const response = await axios.post(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/me/messenger_profile?platform=instagram`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return { success: response.data?.result === "success" || !!response.data };
  } catch (error) {
    console.error("Error setting persistent menu:", error);

    let errorMessage = "Failed to set persistent menu";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Get current Persistent Menu configuration
 */
export const getPersistentMenu = async (
  token: string,
): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/me/messenger_profile`,
      {
        params: {
          fields: "persistent_menu",
          platform: "instagram",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return { success: true, data: response.data?.data || [] };
  } catch (error) {
    console.error("Error getting persistent menu:", error);

    let errorMessage = "Failed to get persistent menu";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
  }
};

/**
 * Delete Persistent Menu
 */
export const deletePersistentMenu = async (
  token: string,
): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await axios.delete(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/me/messenger_profile?platform=instagram`,
      {
        data: {
          fields: ["persistent_menu"],
        },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );

    return { success: response.data?.result === "success" || !!response.data };
  } catch (error) {
    console.error("Error deleting persistent menu:", error);

    let errorMessage = "Failed to delete persistent menu";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return { success: false, error: errorMessage };
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
      `${process.env.NEXT_PUBLIC_HOST_URL}/callback/instagram`,
    );
    insta_form.append("code", code);

    const shortTokenRes = await fetch(process.env.INSTAGRAM_TOKEN_URL!, {
      method: "POST",
      body: insta_form,
    });

    if (!shortTokenRes.ok) {
      const errorText = await shortTokenRes.text();
      throw new Error(
        `Token request failed: ${shortTokenRes.status} - ${errorText}`,
      );
    }

    const token = await shortTokenRes.json();

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
      },
    );

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

/**
 * Check if a user follows the Instagram Business/Creator account
 * Uses Instagram User Profile API with is_user_follow_business field
 * Available in Graph API v12.0+
 *
 * Permissions required: instagram_basic, instagram_manage_messages
 *
 * Note: Instagram sorts messages from followers to Primary folder,
 * non-followers to Requests folder. This can be used as alternative detection.
 */
export const checkIfFollower = async (
  pageId: string,
  userIgsid: string,
  token: string,
): Promise<boolean> => {
  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userIgsid}`,
      {
        params: {
          fields:
            "name,profile_pic,is_user_follow_business,is_business_follow_user,follower_count",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data?.is_user_follow_business === true;
  } catch (error) {
    console.error("Error checking follower status:", error);
    // Default to TRUE on error so flow continues
    return true;
  }
};

/**
 * Get hashtags from a media post
 */
export const getMediaHashtags = async (
  mediaId: string,
  token: string,
): Promise<string[]> => {
  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${mediaId}`,
      {
        params: {
          fields: "caption",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const caption = response.data?.caption || "";
    // Extract hashtags from caption
    const hashtagRegex = /#(\w+)/g;
    const matches = caption.match(hashtagRegex) || [];
    return matches.map((tag: string) => tag.toLowerCase());
  } catch (error) {
    console.error("Error getting media hashtags:", error);
    return [];
  }
};

/**
 * Get user profile information
 */
export const getUserProfile = async (
  userId: string,
  token: string,
): Promise<{ id: string; username?: string; name?: string } | null> => {
  try {
    const response = await axios.get(
      `${process.env.INSTAGRAM_BASE_URL}/v21.0/${userId}`,
      {
        params: {
          fields: "id,username,name",
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};
