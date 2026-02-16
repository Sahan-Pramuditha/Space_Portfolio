import React, { useEffect, useState } from 'react';
import { Github, Star, Users, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const GithubStats = ({ username }) => {
  const [user, setUser] = useState(null);
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const token = import.meta.env.VITE_GITHUB_TOKEN || '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const u = await fetch(`https://api.github.com/users/${username}`, { headers });
        if (!u.ok) throw new Error(`User ${u.status}`);
        const userJson = await u.json();
        const r = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`, { headers });
        if (!r.ok) throw new Error(`Repos ${r.status}`);
        const reposJson = await r.json();
        if (!cancelled) {
          setUser(userJson);
          setRepos(reposJson);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError('Unable to load GitHub data right now.');
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 animate-pulse h-40" />
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 animate-pulse h-40" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50 text-text-muted text-sm">
          {error}
        </div>
        <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50">
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 border border-accent text-accent rounded font-mono hover:bg-accent/10 transition-colors inline-block"
          >
            View on GitHub
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50">
        <div className="flex items-center gap-3 mb-4">
          <Github className="text-accent" size={22} />
          <a
            href={user.html_url}
            target="_blank"
            rel="noreferrer"
            className="text-text font-semibold hover:text-accent transition-colors"
          >
            {user.name || user.login}
          </a>
        </div>
        <p className="text-text-muted text-sm mb-4">{user.bio}</p>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-secondary/30 rounded border border-secondary/40">
            <div className="text-accent font-display text-xl font-bold">{user.followers}</div>
            <div className="text-text-muted text-xs">Followers</div>
          </div>
          <div className="p-3 bg-secondary/30 rounded border border-secondary/40">
            <div className="text-accent font-display text-xl font-bold">{user.public_repos}</div>
            <div className="text-text-muted text-xs">Repos</div>
          </div>
          <div className="p-3 bg-secondary/30 rounded border border-secondary/40">
            <div className="text-accent font-display text-xl font-bold">{user.following}</div>
            <div className="text-text-muted text-xs">Following</div>
          </div>
        </div>
      </div>
      <div className="bg-secondary/20 p-6 rounded-xl border border-secondary/50">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="text-accent" size={18} />
          <span className="text-text font-semibold">Recently Updated Repos</span>
        </div>
        <div className="space-y-3">
          {repos.map((repo) => (
            <motion.a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noreferrer"
              className="block p-3 rounded border border-secondary/40 bg-secondary/30 hover:border-accent/50 hover:bg-secondary/50 transition-colors"
              whileHover={{ y: -2 }}
            >
              <div className="flex justify-between items-center">
                <span className="text-text font-mono">{repo.name}</span>
                <span className="flex items-center gap-1 text-text-muted text-xs">
                  <Star size={14} className="text-accent" />
                  {repo.stargazers_count}
                </span>
              </div>
              <div className="text-text-muted text-xs mt-1">
                {repo.language || 'Unknown'} • Updated {new Date(repo.updated_at).toLocaleDateString()}
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GithubStats;
