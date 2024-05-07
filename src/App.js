import { useEffect, useRef, useState } from "react";

function App() {
  // state to save article data
  const [articles, setArticles] = useState([]);
  const [page, setPage] = useState(0);
  const [more, setMore] = useState({ nextLoad: true, length: 0 });
  const loaderRef = useRef(null);

  useEffect(() => {
    // call the function only page number exists and
    // nextLoad is true which checks if the last api call has returned data
    // page is defined as zero and IntersectionObserver sets it to 1 on the first mount
    // and page is incremented each time when IntersectionObserver has reached the observing element threshold
    if (page && more.nextLoad) fetchArticleData();
  }, [page]);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "20px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });
    }, options);

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [loaderRef]);

  const fetchArticleData = async () => {
    console.log("fetching page", page);
    try {
      // created a backend channel using ExpressJS to bypass cors
      const response = await fetch(
        `http://localhost:5000/api/photo-gallery/${page}`
      );
      const data = await response.json();
      console.log("data", data.nodes);
      setArticles((prevArticles) => [...prevArticles, ...data.nodes]);

      // this sets whether to call fetchArticleData next time when the page is incremented
      // if current api returned empty array nextLoad is set as false
      if (data.nodes.length)
        setMore({ nextLoad: true, length: data.nodes.length });
      else setMore({ nextLoad: false, length: data.nodes.length });
    } catch (error) {}
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert to milliseconds by multiplying by 1000

    const options = {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata", // IST timezone
    };

    const formattedDate = date.toLocaleString("en-US", options);

    return formattedDate;
  };

  function truncateTitle(title) {
    // Check if the title length exceeds the maximum length
    if (title.length > 10) {
      // Truncate the title to the maximum length and add an ellipsis
      return title.substring(0, 50 - 3) + "...";
    } else {
      // If the title length is within the maximum length, return the original title
      return title;
    }
  }

  return (
    <div
      style={{
        display: "grid",
        justifyContent: "center",
        marginTop: "10px",
      }}
    >
      {articles?.map((article) => (
        <div
          key={article.node.nid}
          style={{ display: "flex", gap: 10, margin: "20px" }}
        >
          <img
            src={article.node.field_photo_image_section}
            alt={article.node.title}
            style={{
              width: 400,
              height: 200,
              borderRadius: 20,
            }}
          />
          <div style={{ width: "300px" }}>
            {/* display truncated title with ellipsis */}
            <h2>{truncateTitle(article.node.title)}</h2>
            {/* formate the date */}
            <p>{formatDate(article.node.last_update)}</p>
          </div>
        </div>
      ))}
      {/* intersection observer element */}
      <div ref={loaderRef}>{more.length ? "Loading more..." : null}</div>
    </div>
  );
}

export default App;
