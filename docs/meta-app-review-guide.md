# Meta App Review - Step-by-Step Testing Guide

## App Information

**App Name:** Swoopin  
**Platform:** Web Application  
**URL:** https://swoopin.vercel.app _(Replace with your actual Vercel deployment URL)_  
**Category:** Social Media Management & Automation

> **Deployment Note:** This app is hosted on Vercel. The URL format will be `https://your-project-name.vercel.app` after deployment.

---

## Test Credentials

| Field        | Value                |
| ------------ | -------------------- |
| **Email**    | `tester@swoopin.app` |
| **Password** | `Test@123456`        |

> **Note:** This test account has been pre-configured with completed onboarding and is ready for immediate testing.

---

## Step-by-Step Testing Instructions

### Step 1: Access the Application

1. Open your web browser (Chrome, Firefox, or Safari recommended)
2. Navigate to **https://swoopin.app**
3. You will see the landing page with a "Get Started" or "Sign In" option

---

### Step 2: Sign In to the Test Account

1. Click the **"Sign In"** button in the navigation bar
2. You will be redirected to the sign-in page at `/sign-in`
3. Enter the email address: `tester@swoopin.app`
4. Click **"Continue"**
5. Enter the password: `Test@123456`
6. Click **"Sign In"**
7. You will be redirected to the Dashboard

---

### Step 3: Connect Instagram Account (Instagram Login Flow)

1. From the Dashboard, navigate to **"Integrations"** in the left sidebar
2. Find **"Instagram"** in the integrations list (under "Social Media" category)
3. Click the **"Connect"** button next to Instagram
4. You will be redirected to Instagram's login page
5. Enter your Instagram credentials (use a test Instagram account)
6. Review and approve the permissions requested by Swoopin
7. Click **"Allow"** to authorize the connection
8. You will be redirected back to Swoopin with a success confirmation
9. The Instagram integration card will now show as **"Connected"**

---

### Step 4: Test Automations Feature (instagram_business_manage_messages)

This demonstrates how Swoopin uses automated messaging capabilities.

1. Navigate to **"Automations"** in the left sidebar
2. Click the **"+ Create Automation"** button
3. A new automation will be created and you'll see the automation builder

#### Configure the Automation:

4. **Set Trigger:**

   - In the flow builder, click on the trigger node
   - Select trigger type: "DM" (Direct Message) or "Comment"
   - Add keywords that will trigger the automation (e.g., "pricing", "info")

5. **Set Response:**

   - Add a response node by clicking the "+" button
   - Choose response type: "Smart AI", "Message", or "Carousel"
   - Enter your automated reply message
   - For example: "Thanks for reaching out! Here's more info about our services..."

6. **Activate:**
   - Toggle the automation to **"Active"** state
   - The automation is now live and will respond to matching messages

---

### Step 5: Test Content Publishing (instagram_business_content_publishing)

This demonstrates how Swoopin publishes content to Instagram.

1. Navigate to **"Scheduler"** in the left sidebar
2. Click **"+ Create Post"** button
3. Fill in the post details:
   - **Upload Media:** Click to upload an image or video
   - **Caption:** Enter your post caption
   - **Hashtags:** Add relevant hashtags
   - **Schedule Time:** Select when to publish (or publish immediately)
4. Click **"Schedule"** or **"Publish Now"**
5. The post will be sent to Instagram via the Graph API
6. You can see scheduled posts in the calendar view

---

### Step 6: Test Comments Management (instagram_business_manage_comments)

This demonstrates comment management capabilities.

1. With a connected Instagram account, navigate to **Dashboard**
2. View the **Instagram Stats** section showing engagement metrics
3. Comments from Instagram posts are fetched and displayed
4. You can view, filter, and manage comments through the interface
5. Automated replies to comments can be configured in **Automations**

---

### Step 7: Review Dashboard Analytics (instagram_business_basic)

This demonstrates reading basic Instagram account data.

1. Navigate to the main **Dashboard** page
2. View the analytics overview showing:
   - Follower count
   - Recent posts
   - Engagement metrics
   - Account insights
3. This data is fetched from the Instagram Graph API using the connected account

---

## Permissions Usage Summary

| Permission                                | Usage in Swoopin                                              |
| ----------------------------------------- | ------------------------------------------------------------- |
| **instagram_business_basic**              | Read user's Instagram profile, follower count, and media      |
| **instagram_business_content_publishing** | Schedule and publish posts, reels, and stories to Instagram   |
| **instagram_business_manage_comments**    | Read, moderate, and auto-reply to comments on posts           |
| **instagram_business_manage_messages**    | Receive DMs, send automated replies, and manage conversations |

---

## Additional Notes for Reviewers

### App Purpose

Swoopin is a social media management platform that helps businesses and creators:

- Automate Instagram DM and comment responses
- Schedule and publish content to Instagram
- Track engagement and analytics
- Save time with AI-powered automation

### Target Users

- Social media managers
- Business owners
- Content creators
- Digital agencies

### Data Handling

- All Instagram data is stored securely using encrypted database connections
- Users can disconnect their Instagram account at any time
- Data is only used for the features described above

### Testing Tips

- The test account has pre-configured sample automations to review
- All features are fully functional in the production environment
- No additional setup is required beyond signing in

---

## Support Contact

If you encounter any issues during testing, please contact:

- **Email:** support@swoopin.app
- **Business Email:** [Your business email from app settings]

---

_Last Updated: December 2024_
