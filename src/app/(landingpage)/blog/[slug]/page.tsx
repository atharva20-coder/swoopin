import Link from "next/link";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import LandingNav from "@/components/global/landing-nav";
import Footer from "@/components/global/footer";
import { MarkdownRenderer } from "@/components/global/markdown-renderer";
import { 
  getBlogPost, 
  getAllBlogSlugs, 
  formatBlogDate, 
  getCategoryColor 
} from "@/lib/blog";
import { notFound } from "next/navigation";

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs = getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for each blog post
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  
  if (!post) {
    return { title: "Blog Post Not Found | NinthNode" };
  }
  
  return {
    title: `${post.title} | NinthNode Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author],
    },
  };
}

// Hero image gradients matching Success Stories section on landing page
const blogGradients: Record<string, string> = {
  // Priya's Fashion Brand - Case Study
  "priya-fashion-brand-1m-followers": "linear-gradient(135deg, #534e20 0.000%, #534e20 7.692%, #554f2e calc(7.692% + 1px), #554f2e 15.385%, #555040 calc(15.385% + 1px), #555040 23.077%, #555154 calc(23.077% + 1px), #555154 30.769%, #54536b calc(30.769% + 1px), #54536b 38.462%, #515482 calc(38.462% + 1px), #515482 46.154%, #4e5599 calc(46.154% + 1px), #4e5599 53.846%, #4a57af calc(53.846% + 1px), #4a57af 61.538%, #4558c3 calc(61.538% + 1px), #4558c3 69.231%, #4159d4 calc(69.231% + 1px), #4159d4 76.923%, #3c5be2 calc(76.923% + 1px), #3c5be2 84.615%, #375dea calc(84.615% + 1px), #375dea 92.308%, #335eee calc(92.308% + 1px) 100.000%)",
  // E-commerce Tutorial
  "ecommerce-500-leads-instagram-dms": "conic-gradient(from 285deg, #dac5b3 0.000deg, #acb6a4 90.000deg, #799d8d 180.000deg, #567f70 270.000deg, #515f4f 360.000deg)",
  // Agency Secrets
  "agency-secrets-managing-50-creator-accounts": "conic-gradient(from 45deg, #a5c8e4 0.000deg, #e4ad47 30.000deg, #e590dc 60.000deg, #a67451 90.000deg, #655cd0 120.000deg, #604b5e 150.000deg, #9c44c2 180.000deg, #df466d 210.000deg, #e852b2 240.000deg, #af667e 270.000deg, #6a80a1 300.000deg, #5d9d90 330.000deg, #93b98f 360.000deg)",
};

// Default gradient for new blogs
const defaultGradient = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getBlogPost(params.slug);
  
  if (!post) {
    notFound();
  }
  
  const heroGradient = blogGradients[params.slug] || defaultGradient;
  
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      <LandingNav />
      
      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        {/* Back link */}
        <Link 
          href="/blog" 
          className="inline-flex items-center gap-2 text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>
        
        {/* Centered Hero Image - Full width like heading */}
        <div className="mb-8">
          <div 
            className="w-full h-64 sm:h-80 rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: heroGradient }}
          />
        </div>
        
        {/* Category Badge */}
        <div className="text-center mb-4">
          <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium ${getCategoryColor(post.category)}`}>
            {post.category}
          </span>
        </div>
        
        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight text-center">
          {post.title}
        </h1>
        
        {/* Author and Meta - Centered */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600 dark:text-neutral-400 mb-8 pb-8 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{post.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{formatBlogDate(post.publishedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{post.readTime}</span>
          </div>
        </div>
        
        {/* Article Content */}
        <MarkdownRenderer content={post.content} />
        
        {/* Author Card */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-neutral-800">
          <div className="flex items-center gap-4 p-6 bg-gray-50 dark:bg-neutral-900 rounded-2xl">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-neutral-500">Written by</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{post.author}</p>
              <p className="text-sm text-gray-600 dark:text-neutral-400">
                Published on {formatBlogDate(post.publishedAt)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer CTA */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-neutral-800">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-neutral-900 dark:to-neutral-900/50 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to automate your Instagram?
            </h3>
            <p className="text-gray-600 dark:text-neutral-400 mb-6">
              Join thousands of creators using NinthNode to grow their audience.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-black font-semibold rounded-full hover:bg-gray-800 dark:hover:bg-neutral-200 transition-colors"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </article>
      
      <Footer />
    </main>
  );
}
