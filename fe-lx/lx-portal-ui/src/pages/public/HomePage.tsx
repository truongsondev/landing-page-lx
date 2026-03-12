import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { LazyMotion, m } from "framer-motion";
import dayjs from "dayjs";
import { postsService } from "@/services/posts.service";
import { activitiesService } from "@/services/activities.service";
import { Loading } from "@/components/common/Loading";
import { ErrorState } from "@/components/common/ErrorState";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Activity, Post } from "@/types/models";

const loadFeatures = () =>
  import("@/lib/motion/features").then((res) => res.default);

const ROTATING_HEADLINES = [
  "Kết nối sinh viên trong lưu xá",
  "Quản lý thông báo tập trung",
  "Tổ chức hoạt động thể thao dễ dàng",
];

const DEFAULT_ACTIVITY_IMAGES = [
  "/images/activities/da-minh-td2-1.svg",
  "/images/activities/da-minh-td2-2.svg",
  "/images/activities/da-minh-td2-3.svg",
];

function useAutoHeadline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % ROTATING_HEADLINES.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  return ROTATING_HEADLINES[index];
}

function AnimatedCounter({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const duration = 1000;
    const start = performance.now();

    const run = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.floor(value * progress));
      if (progress < 1) frame = requestAnimationFrame(run);
    };

    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [started, value]);

  return (
    <div ref={ref} className="text-3xl font-extrabold text-slate-900">
      {display}
      {suffix}
    </div>
  );
}

export function HomePage() {
  const headline = useAutoHeadline();
  const heroRef = useRef<HTMLElement | null>(null);

  const handleParallaxMove = (event: MouseEvent<HTMLElement>) => {
    const node = heroRef.current;
    if (!node) return;

    const rect = node.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const px = (x / rect.width - 0.5) * 14;
    const py = (y / rect.height - 0.5) * 14;

    node.style.setProperty("--mx", `${px}px`);
    node.style.setProperty("--my", `${py}px`);
  };

  const resetParallax = () => {
    const node = heroRef.current;
    if (!node) return;
    node.style.setProperty("--mx", "0px");
    node.style.setProperty("--my", "0px");
  };

  const pinnedPosts = useQuery({
    queryKey: ["home", "pinned-posts"],
    queryFn: () =>
      postsService.getAll({ status: "PUBLISHED", isPinned: true, limit: 6 }),
  });

  const activities = useQuery({
    queryKey: ["home", "activities"],
    queryFn: () => activitiesService.getAll({ page: 1, limit: 4 }),
  });

  const upcoming = useMemo(() => {
    const now = dayjs();
    return (activities.data?.data || []).filter((item: Activity) =>
      dayjs(item.startDate).isAfter(now),
    );
  }, [activities.data]);

  const topPosts = pinnedPosts.data?.data || [];
  const topActivities = upcoming.slice(0, 4);
  const activityImages = topActivities
    .flatMap((activity: Activity) => {
      const list = activity.images || [];
      if (list.length > 0) return list;
      return activity.thumbnail ? [activity.thumbnail] : [];
    })
    .slice(0, 8);
  const displayActivityImages =
    activityImages.length > 0 ? activityImages : DEFAULT_ACTIVITY_IMAGES;
  const tickerText =
    topPosts.length > 0
      ? topPosts.map((p: Post) => `• ${p.title}`).join("      ")
      : "• Chào mừng bạn đến với cổng thông tin Lưu Xá";

  if (pinnedPosts.isLoading || activities.isLoading) return <Loading />;
  if (pinnedPosts.isError || activities.isError) return <ErrorState />;

  return (
    <LazyMotion features={loadFeatures} strict>
      <div className="space-y-10 pb-6">
        <m.section
          ref={heroRef}
          onMouseMove={handleParallaxMove}
          onMouseLeave={resetParallax}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="relative snap-start overflow-hidden rounded-3xl bg-linear-to-br from-blue-700 via-indigo-700 to-cyan-600 p-8 text-white md:p-12"
        >
          <div className="pointer-events-none absolute -left-10 -top-12 h-56 w-56 rounded-full bg-white/15 blur-2xl hero-blob parallax-layer-slow" />
          <div className="pointer-events-none absolute -bottom-16 -right-8 h-64 w-64 rounded-full bg-cyan-200/20 blur-2xl hero-blob hero-blob-delay parallax-layer-fast" />

          <p className="mb-3 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wide">
            ĐA MINH THỦ ĐỨC 2 • SMART STUDENT COMMUNITY
          </p>
          <h1 className="mb-2 text-3xl font-extrabold md:text-5xl">
            Website Lưu Xá Đa Minh Thủ Đức 2,
            <span className="block text-cyan-200 fade-slide">{headline}</span>
          </h1>
          <p className="mb-6 max-w-2xl text-sm text-blue-50 md:text-base">
            Landing page tập trung trải nghiệm: điều hướng nhanh, thông tin nổi
            bật theo thời gian thực, và automation hiển thị mượt mà cho sinh
            viên.
          </p>

          <div className="flex flex-wrap gap-3 parallax-layer-fast">
            <Link
              to="/posts"
              className="rounded-xl bg-white px-5 py-2.5 font-semibold text-blue-700 shadow-lg transition hover:-translate-y-0.5"
            >
              Khám phá bài viết
            </Link>
            <Link
              to="/activities"
              className="rounded-xl border border-white/40 bg-white/10 px-5 py-2.5 font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Xem hoạt động
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 parallax-layer-slow">
            <div className="rounded-2xl bg-white/90 p-4 text-slate-900 reveal-up">
              <p className="text-sm text-slate-500">Bài viết nổi bật</p>
              <AnimatedCounter value={topPosts.length} />
            </div>
            <div className="rounded-2xl bg-white/90 p-4 text-slate-900 reveal-up reveal-delay-1">
              <p className="text-sm text-slate-500">Hoạt động sắp diễn ra</p>
              <AnimatedCounter value={topActivities.length} />
            </div>
            <div className="rounded-2xl bg-white/90 p-4 text-slate-900 reveal-up reveal-delay-2">
              <p className="text-sm text-slate-500">Phản hồi hài lòng</p>
              <AnimatedCounter value={98} suffix="%" />
            </div>
          </div>
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.35 }}
          className="snap-start overflow-hidden rounded-xl border border-blue-100 bg-white"
        >
          <div className="ticker-track px-4 py-3 text-sm font-medium text-blue-700">
            <span>{tickerText}</span>
            <span>{tickerText}</span>
          </div>
        </m.section>

        <section className="snap-start grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Cập nhật tự động",
              description:
                "Tin mới và hoạt động được đồng bộ API thật theo thời gian truy cập.",
            },
            {
              title: "Tối ưu trải nghiệm",
              description:
                "Luồng người dùng rõ ràng từ guest đến dashboard quản trị nội dung.",
            },
            {
              title: "Mượt trên mọi thiết bị",
              description:
                "UI responsive, hiệu ứng nhẹ và cảm giác tương tác liền mạch.",
            },
          ].map((feature, idx) => (
            <m.article
              key={feature.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className={`group rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl reveal-up ${idx === 1 ? "reveal-delay-1" : idx === 2 ? "reveal-delay-2" : ""}`}
            >
              <h3 className="mb-2 text-lg font-bold text-slate-900">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </m.article>
          ))}
        </section>

        <section className="snap-start">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Bài viết nổi bật</h2>
            <Link to="/posts" className="text-sm text-blue-600">
              Xem tất cả
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {topPosts.map((post: Post, idx: number) => (
              <Link
                key={post.id}
                to={`/posts/${post.slug}`}
                className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl reveal-up ${idx === 1 ? "reveal-delay-1" : idx === 2 ? "reveal-delay-2" : ""}`}
              >
                <p className="mb-2 text-xs text-slate-500">
                  {dayjs(post.publishedAt || post.createdAt).format(
                    "DD/MM/YYYY",
                  )}
                </p>
                <h3 className="line-clamp-2 font-semibold">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                  {post.excerpt}
                </p>
                {post.isPinned && (
                  <span className="mt-3 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">
                    Ghim
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>

        <section className="snap-start">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Hoạt động sắp diễn ra</h2>
            <Link to="/activities" className="text-sm text-blue-600">
              Xem tất cả hoạt động
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {topActivities.map((activity: Activity, idx: number) => (
              <Link
                to={`/activities/${activity.id}`}
                key={activity.id}
                className={`rounded-xl border border-slate-200 bg-white p-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl reveal-up ${idx === 1 ? "reveal-delay-1" : ""}`}
              >
                <h3 className="font-semibold">{activity.name}</h3>
                <p className="mt-1 text-sm text-slate-600">
                  {activity.location}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {dayjs(activity.startDate).format("DD/MM/YYYY HH:mm")}
                </p>
                <div className="mt-2">
                  <StatusBadge status="UPCOMING" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        <m.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35 }}
          className="snap-start rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-bold">Không gian hình ảnh hoạt động</h2>
            <Link to="/activities" className="text-sm text-blue-600">
              Xem hoạt động
            </Link>
          </div>

          {displayActivityImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {displayActivityImages.map((url, idx) => (
                <img
                  key={`${url}-${idx}`}
                  src={url}
                  alt="Ảnh hoạt động lưu xá"
                  onError={(e) => {
                    e.currentTarget.src =
                      DEFAULT_ACTIVITY_IMAGES[
                        idx % DEFAULT_ACTIVITY_IMAGES.length
                      ];
                  }}
                  className="h-36 w-full rounded-xl object-cover transition duration-300 hover:scale-[1.02]"
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              Chưa có ảnh hoạt động. Bạn có thể vào Dashboard để thêm ảnh cho
              từng hoạt động.
            </div>
          )}
        </m.section>

        <m.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.4 }}
          className="snap-start rounded-2xl bg-slate-900 p-6 text-center text-white"
        >
          <h2 className="mb-2 text-2xl font-bold">
            Sẵn sàng tham gia cộng đồng Đa Minh Thủ Đức 2?
          </h2>
          <p className="mx-auto mb-4 max-w-2xl text-sm text-slate-200">
            Đăng ký tài khoản để theo dõi thông báo mới, tham gia hoạt động và
            sử dụng đầy đủ dashboard cá nhân.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-white px-5 py-2.5 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Đăng ký ngay
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-white/40 px-5 py-2.5 font-semibold text-white transition hover:bg-white/10"
            >
              Đăng nhập
            </Link>
          </div>
        </m.section>
      </div>
    </LazyMotion>
  );
}
