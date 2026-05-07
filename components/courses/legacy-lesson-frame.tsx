'use client';

type Props = {
  src: string;
  title: string;
};

export function LegacyLessonFrame({ src, title }: Props) {
  return (
    <iframe
      title={title}
      src={src}
      className="w-full min-h-[calc(100dvh-220px)] rounded-xl border border-zinc-800 bg-black shadow-inner"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
    />
  );
}
