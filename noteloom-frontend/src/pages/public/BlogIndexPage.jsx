import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, User, ArrowRight, BookOpen } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

const BlogIndexPage = () => {
  const navigate = useNavigate();

  const blogPosts = [
    {
      slug: "pilot-institute-case-study",
      title: "Case Study: How NoteLoom Digitized IEM Kolkata Campus Operations",
      desc: "Review the results from our first beta deployment at IEM Kolkata, saving 40+ hours per week of admin effort and improving exam registration speeds.",
      author: "Operations Team",
      date: "Jul 14, 2026",
      category: "Case Study",
      readTime: "5 min read"
    },
    {
      slug: "digitize-note-sharing-colleges",
      title: "How to Digitize Note-Sharing and Study Materials for Colleges",
      desc: "A step-by-step blueprint for digitizing notes, ensuring copyright compliance, and fostering student collaboration on modern college portals.",
      author: "LMS Specialist Team",
      date: "Jul 12, 2026",
      category: "Productivity",
      readTime: "7 min read"
    },
    {
      slug: "campus-saas-adoption",
      title: "Adopting SaaS Solutions on Campus: A Guide for College Admins",
      desc: "Discover best practices, change management tips, and efficiency benefits of deploying custom cloud portals for Indian colleges and universities.",
      author: "NoteLoom Education Team",
      date: "Jul 10, 2026",
      category: "Change Management",
      readTime: "8 min read"
    }
  ];

  return (
    <div className="min-h-screen bg-[#0a051d] text-white font-sans flex flex-col justify-between relative overflow-hidden">
      <SEOHead
        title="Campus SaaS Adoption and Digital Learning Blog | NoteLoom"
        description="Read our latest articles on digitizing study material, managing campus exams, and adopting SaaS workflows inside college administrations."
        canonicalUrl="https://noteloom.com/blog"
      />

      {/* Decorative Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-[80px]" />
        <div className="absolute bottom-[20%] right-[5%] w-[450px] h-[450px] rounded-full bg-purple-500/10 blur-[90px]" />
      </div>

      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">NoteLoom</span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
        >
          Noteloom.com
        </button>
      </header>

      <main className="relative z-10 flex-grow max-w-7xl mx-auto w-full px-6 py-16">
        <div className="max-w-2xl mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 tracking-tight">
            The <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">NoteLoom Blog</span>
          </h1>
          <p className="text-gray-400 text-lg sm:text-xl">
            Insights, strategies, and success stories on edtech adoption, digital note sharing, and campus administrative workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="p-6 sm:p-8 rounded-3xl border border-white/10 bg-white/[0.01] backdrop-blur-xl hover:border-blue-500/30 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                    {post.category}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">{post.readTime}</span>
                </div>

                <Link to={`/blog/${post.slug}`} className="block group-hover:text-blue-400 transition-colors">
                  <h3 className="text-xl font-bold mb-3 line-clamp-2 leading-snug">
                    {post.title}
                  </h3>
                </Link>
                <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {post.desc}
                </p>
              </div>

              <div className="border-t border-white/5 pt-5 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{post.author}</span>
                </div>
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-xs font-bold text-blue-400 group-hover:text-blue-300 flex items-center space-x-1"
                >
                  <span>Read Post</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-gray-600 border-t border-white/5">
        <p>© 2026 NoteLoom Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BlogIndexPage;
