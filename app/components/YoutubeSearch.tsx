import React, { useState } from "react";

const YouTubeSearch: React.FC = () => {
  const [query, setQuery] = useState<string>("");
  const [videoId, setVideoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query) return;
    const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=${apiKey}&maxResults=1&type=video`;

    try {
      const response = await fetch(apiUrl);
      const data = await response.json();

      if (data.items.length > 0) {
        const id = data.items[0].id.videoId;
        setVideoId(id);
        setError(null);
      } else {
        setError("No results found.");
        setVideoId(null);
      }
    } catch (err) {
      console.error(err);
      setError("Error fetching video data.");
      setVideoId(null);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a video..."
        className="border text-black border-gray-400 rounded-lg p-2 mb-4 w-3/4"
      />
      <button
        onClick={handleSearch}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded"
      >
        Search
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {videoId && (
        <div className="mt-4">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      )}
      <br></br>
    </div>
  );
};

export default YouTubeSearch;
