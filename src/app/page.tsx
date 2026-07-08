import Link from "next/link";

const motions = [
  { title: "想捏一下", desc: "柔软视觉、短暂停顿、适合放在手边的小小出口。", icon: "/images/icons/v4-clean/squishy-blob.png" },
  { title: "想转一下", desc: "旋钮、转盘、磁吸结构，让注意力慢慢落回手上。", icon: "/images/icons/v4-clean/fidget-puck.png" },
  { title: "想挂起来", desc: "包挂、钥匙圈、桌面吊饰，把可爱带出门。", icon: "/images/icons/v4-clean/charm-ring.png" },
  { title: "想摆桌上", desc: "工作区旁边的一点颜色、一点陪伴、一点情绪缓冲。", icon: "/images/icons/v4-clean/holder.png" },
];

const channels = [
  { name: "独立站", role: "品牌中枢 + 商品承接页", cta: "OneGoods.studio" },
  { name: "虾皮", role: "上架销售 + 订单/物流/评价", cta: "正式成交渠道" },
  { name: "小红书", role: "内容种草 + 小红书店", cta: "中文测款渠道" },
  { name: "Instagram", role: "海外视觉内容 + 导回独立站", cta: "Reels / Link in bio" },
];

const steps = ["选品", "打印", "拍内容", "上架", "看反馈", "放大爆款"];

export default function Home() {
  return (
    <>
      <section className="relative -mt-16 overflow-hidden pt-16 grain">
        <div className="mx-auto grid min-h-[760px] max-w-[1200px] grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-[1fr_0.95fr]">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-6 font-mono text-xs uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
              OneGoods Studio · 3D printed stress-relief goods
            </p>
            <h1 className="font-display mb-8">
              给手一点，
              <br />
              <span className="text-[color:var(--color-fg-muted)]">小小的解压。</span>
            </h1>
            <p className="mb-8 max-w-xl text-lg leading-relaxed text-[color:var(--color-fg-muted)]">
              我们挑选、打印并测试那些可爱、有触感、适合日常把玩的 3D 打印小物。先小批量上架，看真实反馈，再放大真正有人喜欢的款。
            </p>
            <div className="mb-10 flex flex-wrap gap-2">
              {steps.map((step) => (
                <span key={step} className="pill-badge">
                  {step}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="rounded-full bg-[color:var(--color-accent)] px-6 py-3 text-center font-semibold text-white shadow-[0_18px_40px_rgba(255,127,92,0.24)] transition-transform hover:-translate-y-0.5"
              >
                看本周测试款 →
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-[color:var(--color-border)] bg-white/72 px-6 py-3 text-center font-semibold transition-colors hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                上架时通知我
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="studio-card relative aspect-[4/5] overflow-hidden p-6">
              <div className="absolute left-6 top-6 rounded-full bg-[color:var(--color-accent-soft)] px-4 py-2 text-xs font-bold text-[color:var(--color-accent)]">
                small-batch selection lab
              </div>
              <div className="absolute inset-x-8 top-24 grid grid-cols-2 gap-4">
                {motions.map((item, idx) => (
                  <div key={item.title} className="rounded-[1.4rem] border border-[color:var(--color-border)] bg-white/78 p-4 shadow-sm">
                    <div className="sticker-icon mb-3 h-12 w-12 bg-[color:var(--color-butter)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.icon} alt="" className="h-10 w-10 object-contain" />
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-fg-muted)]">
                      pick 0{idx + 1}
                    </p>
                    <h3 className="mt-1 text-xl">{item.title}</h3>
                  </div>
                ))}
              </div>
              <div className="absolute bottom-8 left-8 right-8 rounded-[1.5rem] border border-[color:var(--color-border)] bg-[color:var(--color-bg)]/86 p-5 backdrop-blur">
                <p className="mb-3 text-sm font-semibold">选品判断</p>
                <p className="text-sm leading-relaxed text-[color:var(--color-fg-muted)]">
                  解压感、可爱度、打印稳定、内容好拍、电商好卖——五项都过，再进入小批量测试。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-accent)]">
              Shop by motion
            </p>
            <h2 className="font-display">不是先做很多 SKU，而是先找真正想玩的手感。</h2>
          </div>
          <p className="max-w-md text-[color:var(--color-fg-muted)]">
            OneGoods 先用现有可打印设计快速测款：好不好摸、好不好拍、好不好卖，比“商品线很完整”更重要。
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {motions.map((item) => (
            <Link href="/shop" key={item.title} className="studio-card group p-6 transition-transform hover:-translate-y-1">
              <div className="sticker-icon mb-5 h-14 w-14 bg-[color:var(--color-butter)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.icon} alt="" className="h-12 w-12 object-contain" />
              </div>
              <h3 className="mb-4 text-2xl group-hover:text-[color:var(--color-accent)]">{item.title}</h3>
              <p className="leading-relaxed text-[color:var(--color-fg-muted)]">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-20">
        <div className="dark-panel rounded-[2rem] p-8 md:p-12">
          <p className="mb-6 font-mono text-xs uppercase tracking-[0.2em] text-[color:var(--color-butter)]">
            Commerce loop
          </p>
          <h2 className="font-display mb-8 max-w-3xl">
            四个渠道都接电商，但每个渠道负责不同任务。
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {channels.map((channel) => (
              <div key={channel.name} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                <h3 className="mb-3 text-2xl text-white">{channel.name}</h3>
                <p className="mb-5 text-sm leading-relaxed text-white/70">{channel.role}</p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/78">{channel.cta}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
