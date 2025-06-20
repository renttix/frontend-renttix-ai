import { useEffect, useState } from "react";
import Link from "next/link";

const BlogPost = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    fetch("https://blog.renttix.com/wp-json/wp/v2/posts?per_page=3")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false); // Set loading to false after data is fetched
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setLoading(false); // Set loading to false even if there is an error
      });
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Loading...</div> {/* Custom loader or spinner */}
      </div>
    );
  }

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-screen-2xl px-4 pb-40">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <label className="text-[25px] font-bold text-[#131314] md:text-[30px] lg:text-[46px]">
              Recent Blog Posts
            </label>
          </div>
          <div className="flex">
            <a
              href="https://blog.renttix.com/"
              target="_blank"
              className="group relative overflow-hidden rounded-full border border-orange-500 bg-orange-500 px-8 py-3 font-medium text-white transition-transform duration-300 ease-in-out"
            >
              <span className="relative z-10">View All</span>
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-orange-400 to-orange-600 transition-transform duration-500 ease-out group-hover:translate-x-0"></span>
            </a>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-20 py-4 sm:grid-cols-1 md:grid-cols-3 md:gap-40">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex flex-col gap-1 p-4 transition-transform duration-300 hover:scale-110"
            >
              <Link className="text-primary" href={post.link}>
                <img
                  className="max-h-56 w-[1024px]"
                  src={post?.yoast_head_json?.og_image?.[0]?.url}
                  alt={post.title.rendered}
                />
              </Link>
              <a
                href={post.link}
                target="_blank"
                className="font-bold text-[#17012C] hover:text-orange-500"
              >
                <label
                  dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                ></label>
              </a>
              <label
                dangerouslySetInnerHTML={{
                  __html: post.excerpt.rendered.replace(/={3,}/g, ""),
                }}
                className="text-gray-600"
              ></label>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPost;
