import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import LandingNav from "@/components/global/landing-nav";
import Footer from "@/components/global/footer";
import { getAllBlogPosts, formatBlogDate, getCategoryColor } from "@/lib/blog";

export const metadata = {
  title: "Blog | NinthNode",
  description: "Insights, tutorials, and case studies on Instagram automation and social media growth.",
};

export default function BlogPage() {
  const posts = getAllBlogPosts();
  
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <LandingNav />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Blog
          </h1>
          <p className="text-xl text-gray-600 dark:text-neutral-400 max-w-2xl mx-auto">
            Insights, tutorials, and case studies to help you grow on Instagram.
          </p>
        </div>
        
        {/* Blog Grid */}
        {posts.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group bg-gray-50 dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden hover:border-gray-200 dark:hover:border-neutral-700 transition-all duration-300"
              >
                {/* Category & Read Time */}
                <div className="p-6 pb-0">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-neutral-500">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                    {post.title}
                  </h2>
                  
                  {/* Excerpt */}
                  <p className="text-gray-600 dark:text-neutral-400 text-sm mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
                
                {/* Footer */}
                <div className="p-6 pt-0 flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-neutral-500">
                    {formatBlogDate(post.publishedAt)}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:gap-2 transition-all"
                  >
                    Read more
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-neutral-500">
              No blog posts yet. Check back soon!
            </p>
          </div>
        )}
      </div>
      
      <Footer />
    </main>
  );
}
