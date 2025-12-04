import { useState, useEffect } from 'react';

interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
}

function NewsApp() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch news from News API (you'll need to get an API key from newsapi.org)
    // For Bloomberg, you can use the source parameter
    const fetchNews = async () => {
      try {
        // Replace 'YOUR_API_KEY' with your actual News API key
        const apiKey = 'YOUR_API_KEY';
        const response = await fetch(
          `https://newsapi.org/v2/top-headlines?sources=bloomberg&apiKey=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }

        const data = await response.json();
        const formattedArticles = data.articles.map((article: any, index: number) => ({
          id: `${index}`,
          title: article.title,
          description: article.description || 'No description available',
          url: article.url,
          publishedAt: article.publishedAt,
          source: article.source.name,
        }));

        setArticles(formattedArticles);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError('Failed to load news. Please check your API key.');
        setLoading(false);
        
        // Load sample data as fallback
        setArticles([
          {
            id: '1',
            title: 'Fed Signals Potential Rate Cuts in 2024',
            description: 'Federal Reserve officials indicate possible interest rate reductions as inflation shows signs of cooling.',
            url: 'https://www.bloomberg.com',
            publishedAt: new Date().toISOString(),
            source: 'Bloomberg',
          },
          {
            id: '2',
            title: 'Tech Stocks Rally on AI Optimism',
            description: 'Major technology companies see gains as investors bet on artificial intelligence growth.',
            url: 'https://www.bloomberg.com',
            publishedAt: new Date().toISOString(),
            source: 'Bloomberg',
          },
          {
            id: '3',
            title: 'Oil Prices Surge Amid Supply Concerns',
            description: 'Crude oil futures climb as OPEC+ announces production cuts.',
            url: 'https://www.bloomberg.com',
            publishedAt: new Date().toISOString(),
            source: 'Bloomberg',
          },
          {
            id: '4',
            title: 'Dollar Strengthens Against Major Currencies',
            description: 'US dollar gains ground as economic data exceeds expectations.',
            url: 'https://www.bloomberg.com',
            publishedAt: new Date().toISOString(),
            source: 'Bloomberg',
          },
          {
            id: '5',
            title: 'Goldman Sachs Beats Earnings Estimates',
            description: 'Investment bank reports strong quarterly results driven by trading revenue.',
            url: 'https://www.bloomberg.com',
            publishedAt: new Date().toISOString(),
            source: 'Bloomberg',
          },
        ]);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ 
      padding: '20px', 
      height: '100vh', 
      overflow: 'auto',
      backgroundColor: '#f5f5f5'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '30px',
          paddingBottom: '20px',
          borderBottom: '2px solid #ddd'
        }}>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700' }}>
            Bloomberg News
          </h2>
          {loading && (
            <span style={{ marginLeft: '20px', color: '#666' }}>Loading...</span>
          )}
        </div>

        {error && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '8px',
            marginBottom: '20px',
            color: '#856404'
          }}>
            {error}
            <div style={{ marginTop: '10px', fontSize: '14px' }}>
              Showing sample data instead. To get live news:
              <ol style={{ marginTop: '5px', paddingLeft: '20px' }}>
                <li>Get a free API key from <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer">newsapi.org</a></li>
                <li>Replace 'YOUR_API_KEY' in the NewsApp.tsx file</li>
              </ol>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {articles.map((article) => (
            <div
              key={article.id}
              style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => window.open(article.url, '_blank')}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '12px'
              }}>
                <h3 style={{ 
                  margin: 0, 
                  fontSize: '20px', 
                  fontWeight: '600',
                  color: '#1a1a1a',
                  flex: 1
                }}>
                  {article.title}
                </h3>
              </div>
              <p style={{ 
                margin: '0 0 12px 0', 
                color: '#666', 
                fontSize: '15px',
                lineHeight: '1.6'
              }}>
                {article.description}
              </p>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '13px',
                color: '#999'
              }}>
                <span style={{ 
                  fontWeight: '600',
                  color: '#667eea'
                }}>
                  {article.source}
                </span>
                <span>{formatDate(article.publishedAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NewsApp;
