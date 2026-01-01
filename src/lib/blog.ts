import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIRECTORY = path.join(process.cwd(), "content/blog");

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  image?: string;
  content: string;
}

export interface BlogPostMeta {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  readTime: string;
  featured: boolean;
  image?: string;
}

/**
 * Get all blog post slugs
 */
export function getAllBlogSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIRECTORY)) {
    return [];
  }
  
  const files = fs.readdirSync(BLOG_DIRECTORY);
  return files
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

/**
 * Get a single blog post by slug
 */
export function getBlogPost(slug: string): BlogPost | null {
  const filePath = path.join(BLOG_DIRECTORY, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  
  return {
    slug,
    title: data.title || "Untitled",
    category: data.category || "General",
    excerpt: data.excerpt || "",
    author: data.author || "NinthNode Team",
    publishedAt: data.publishedAt || new Date().toISOString().split("T")[0],
    readTime: data.readTime || "5 min read",
    featured: data.featured || false,
    image: data.image,
    content,
  };
}

/**
 * Get all blog posts metadata (for listing pages)
 */
export function getAllBlogPosts(): BlogPostMeta[] {
  const slugs = getAllBlogSlugs();
  
  const posts = slugs
    .map((slug) => {
      const post = getBlogPost(slug);
      if (!post) return null;
      
      // Return metadata only (without content)
      const { content, ...meta } = post;
      return meta;
    })
    .filter((post): post is BlogPostMeta => post !== null);
  
  // Sort by published date (newest first)
  return posts.sort((a, b) => 
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

/**
 * Get featured blog posts
 */
export function getFeaturedBlogPosts(): BlogPostMeta[] {
  return getAllBlogPosts().filter((post) => post.featured);
}

/**
 * Get blog posts by category
 */
export function getBlogPostsByCategory(category: string): BlogPostMeta[] {
  return getAllBlogPosts().filter(
    (post) => post.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Format date for display
 */
export function formatBlogDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Get category color class
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Case Study": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    "Tutorial": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    "Agency": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    "News": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    "Guide": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  };
  
  return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
}
