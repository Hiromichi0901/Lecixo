function ArticleCard({ url, title, percentage, words }) {
  return (
    <div className="flex h-36 w-full flex-col items-center justify-center gap-1 rounded-2xl bg-neutral-800 px-4 py-3">
      <p className="w-full truncate text-center text-sm text-neutral-500" title={url}>
        {url}
      </p>
      <p className="w-full truncate text-center text-lg font-medium" title={title}>
        {title}
      </p>
      <p className="text-sm text-neutral-500">{percentage}</p>
      <p className="text-sm text-neutral-500">{words}</p>
    </div>
  );
}

export default ArticleCard;
