import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, User, Calendar, Clock, BookOpen } from "lucide-react";
import SEOHead from "@/components/common/SEOHead";

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const blogPosts = {
    "campus-saas-adoption": {
      title: "Adopting SaaS Solutions on Campus: A Guide for College Admins",
      desc: "Discover best practices, change management tips, and efficiency benefits of deploying custom cloud portals for Indian colleges and universities.",
      author: "NoteLoom Education Team",
      date: "Jul 10, 2026",
      category: "Change Management",
      readTime: "8 min read",
      content: (
        <div className="space-y-6 text-gray-300 leading-relaxed text-base sm:text-lg">
          <p>
            Modern campuses are rapidly digitizing, moving away from fragmented paper workflows and antiquated legacy software. Transitioning to a unified Software-as-a-Service (SaaS) platform enables college administrators to manage scheduling, attendance, course modules, leaves, and examinations seamlessly.
          </p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Why SaaS for Higher Education?</h2>
          <p>
            Traditional on-premise deployments require massive server rooms, dedicated IT maintenance staff, and manual upgrade intervals. Cloud-based SaaS platforms remove this burden entirely, bringing automatic patches, instant scalability, and mobile responsiveness out of the box.
          </p>
          <p>
            For Indian colleges and universities governed by strict Controller of Examination (CoE) regulatory and marking rules, adopting custom-tailored SaaS tools translates to streamlined automated admit cards, instant credit results, and error-free seat layouts.
          </p>
          <blockquote className="border-l-4 border-blue-500 pl-4 my-6 italic text-gray-400">
            "SaaS solutions reduce administrative paperwork by up to 60%, allowing academic leads to refocus efforts on research, curriculum development, and student mentorship."
          </blockquote>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Overcoming Resistance to Change</h2>
          <p>
            Change management is the single biggest blocker to campus digital transformation. Administrators must proactively coordinate workshops, incentivize active faculty participation, and provide peer-led tutorials for students to foster rapid adoptability.
          </p>
        </div>
      )
    },
    "digitize-note-sharing-colleges": {
      title: "How to Digitize Note-Sharing and Study Materials for Colleges",
      desc: "A step-by-step blueprint for digitizing notes, ensuring copyright compliance, and fostering student collaboration on modern college portals.",
      author: "LMS Specialist Team",
      date: "Jul 12, 2026",
      category: "Productivity",
      readTime: "7 min read",
      content: (
        <div className="space-y-6 text-gray-300 leading-relaxed text-base sm:text-lg">
          <p>
            Academic success depends heavily on accessibility to high-quality notes and reading material. Traditional photocopying and messaging groups are disorganized and raise copyright risks. A centralized Learning Management System (LMS) with digital library controls streamlines content delivery.
          </p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">The Danger of Photocopy Culture</h2>
          <p>
            For decades, Indian engineering and arts campuses have relied on photocopied notebooks passed down between semesters. This method restricts access to students who can afford physical copies, is highly prone to printing errors, and prevents updates in real-time.
          </p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Centralized LMS Approach</h2>
          <p>
            A digital note sharing module lets faculty upload lecture files, slide decks, and reference guides directly to specific classrooms. Features like Tesseract OCR scanned note upload allow hand-written student notebooks to be converted to searchable PDF assets, bridging paper and cloud.
          </p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Respecting Intellectual Property</h2>
          <p>
            Centralizing note distribution ensures that only authenticated students logged into their verified college account can view copyrighted lecture contents, preventing leakages and protecting faculty intellectual capital.
          </p>
        </div>
      )
    },
    "pilot-institute-case-study": {
      title: "Case Study: How NoteLoom Digitized IEM Kolkata Campus Operations",
      desc: "Review the results from our first beta deployment at IEM Kolkata, saving 40+ hours per week of admin effort and improving exam registration speeds.",
      author: "Operations Team",
      date: "Jul 14, 2026",
      category: "Case Study",
      readTime: "5 min read",
      content: (
        <div className="space-y-6 text-gray-300 leading-relaxed text-base sm:text-lg">
          <p>
            NoteLoom successfully deployed its B2B college portal at the Institute of Engineering Management, Kolkata. The pilot program targeted student-faculty note sharing, examinations, and leave management. The implementation resulted in a 40% reduction in administrative times, near-instant automated generation of admit cards, and 95% active student engagement.
          </p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Background & Operational Challenges</h2>
          <p>
            With over 3,000 active students and 150+ faculty members across 6 departments, IEM Kolkata's internal processes relied on manual Excel sheets. Routine scheduling changes, exam fee tracking, and department notices were slow to propagate, leading to information gaps.
          </p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">The NoteLoom Solution</h2>
          <p>
            We deployed the complete NoteLoom platform, featuring custom college subdirectories, centralized LMS module uploads, and the complete Controller of Examinations dashboard. This unified everything from routine timetables to final result sheets.
          </p>
          <h2 className="text-2xl font-bold text-white mt-8 mb-4">Tangible Outcomes</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Reduced Administrative Cost</strong>: Saved 40+ hours per week of staff manual data entry.</li>
            <li><strong>Fast Exam Enrollments</strong>: Reduced exam admit-card approvals from 5 days to 2 hours.</li>
            <li><strong>Active Student Engagement</strong>: Achieved 95% daily active student portal visits during semester examinations.</li>
          </ul>
        </div>
      )
    }
  };

  const post = blogPosts[slug];

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a051d] text-white px-4">
        <div className="max-w-md w-full text-center p-8 rounded-2xl border border-white/10 bg-white/[0.01]">
          <h1 className="text-2xl font-bold mb-2">Post Not Found</h1>
          <p className="text-gray-400 mb-6">
            The blog post you are looking for does not exist.
          </p>
          <button
            onClick={() => navigate("/blog")}
            className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors"
          >
            Go back to Blog
          </button>
        </div>
      </div>
    );
  }

  const canonicalUrl = `https://noteloom.com/blog/${slug}`;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.desc,
    "author": {
      "@type": "Organization",
      "name": "NoteLoom"
    },
    "datePublished": "2026-07-14",
    "url": canonicalUrl
  };

  return (
    <div className="min-h-screen bg-[#0a051d] text-white font-sans flex flex-col justify-between relative overflow-hidden">
      <SEOHead
        title={`${post.title} | NoteLoom Blog`}
        description={post.desc}
        canonicalUrl={canonicalUrl}
        ogType="article"
        schemaData={articleSchema}
      />

      {/* Decorative Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[80px]" />
        <div className="absolute bottom-[20%] left-[10%] w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[90px]" />
      </div>

      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate("/")}>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">NoteLoom</span>
        </div>
        <Link to="/blog" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">
          All Posts
        </Link>
      </header>

      <main className="relative z-10 flex-grow max-w-3xl mx-auto w-full px-6 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center space-x-2 text-sm text-gray-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to blog index</span>
        </Link>

        <article className="text-left">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4 font-semibold uppercase tracking-wider">
            <span className="text-blue-400">{post.category}</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>{post.date}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{post.readTime}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center space-x-3 border-b border-white/5 pb-8 mb-8">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-sm font-bold">{post.author}</p>
              <p className="text-xs text-gray-500">Education Analyst</p>
            </div>
          </div>

          {post.content}
        </article>
      </main>

      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 text-center text-xs text-gray-600 border-t border-white/5">
        <p>© 2026 NoteLoom Solutions. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default BlogPostPage;
