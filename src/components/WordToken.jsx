function WordToken({ word, isActive, onClick }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className={
        isActive
          ? "cursor-pointer text-emerald-400"
          : "cursor-pointer hover:text-emerald-300"
      }
    >
      {word}
    </span>
  );
}

export default WordToken;
