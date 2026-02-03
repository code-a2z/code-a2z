import { useEffect, useState } from "react";

export default function Recommendation() {
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ platform: "facebook" })
        });

        const data = await res.json();
        setResult(data.recommendation);
      } catch (err) {
        setResult("Error getting recommendation");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, []);

  return (
    <div>
      {loading && <p>Generating AI recommendation...</p>}
      {!loading && <pre>{result}</pre>}
    </div>
  );
}
