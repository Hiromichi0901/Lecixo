import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { scrapeUrl } from "../services/scraper";
import CounterCard from "../components/CounterCard";
import ArticleCard from "../components/ArticleCard";

const articles = [
  {
    url: "https://www.bbc.com/news/technology",
    title: "How AI Is Changing the Way We Read",
    percentage: "72%",
    words: 842,
  },
  {
    url: "https://www.theguardian.com/world",
    title: "A Day in Tokyo's Quiet Neighborhoods",
    percentage: "45%",
    words: 1205,
  },
  {
    url: "https://www.nytimes.com/books",
    title: "Why Short Stories Are Making a Comeback",
    percentage: "91%",
    words: 634,
  },
  {
    url: "https://medium.com/productivity",
    title: "Building Better Reading Habits in 2026",
    percentage: "58%",
    words: 978,
  },
  {
    url: "https://www.economist.com/science",
    title: "The Science of Learning New Vocabulary",
    percentage: "33%",
    words: 1540,
  },
];

function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRead = async () => {
    if(!url) return;
    setLoading(true);
    try {
      const article = await scrapeUrl(url);
      navigate('/reader', { state: {article}});
    } catch (error) {
      console.error('Scraping failed:', error);
    }finally {
      setLoading(false);
    }

  };

  return (
    <div className="flex flex-col items-center justify-center text-white p-8">
      <h1 className="text-2xl font-semibold flex items-center gap-4">
        <span>Past a link.</span>
        <span>Start reading.</span>
      </h1>
      <div className="mt-8 w-full max-w-3xl bg-neutral-800 rounded-2xl py-2 px-3 flex items-center gap-2">
      <input
        type="text"
        placeholder="Paste a URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="flex-1 bg-transparent text-white placeholder-neutral-500 px-2 py-3 text-base outline-none"
      />
      <button
        type="button"
        onClick={handleRead}
        disabled={loading}
        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-xl font-medium"
      >
       {loading ? 'loading...' : 'Read →'}
      </button>
      </div>
      <div className="flex gap-2 mt-7">
        <CounterCard value="19" label="Words Saved" />
        <CounterCard value="3" label="Articles Read" />
        <CounterCard value="1" label="days Streak" />
      </div>
      <div className="mt-7 grid w-full max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {articles.map((article) => (
          <ArticleCard
            key={article.url}
            url={article.url}
            title={article.title}
            percentage={article.percentage}
            words={article.words}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;