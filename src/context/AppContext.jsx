import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CATEGORIES } from '../data/dummyIssues';
import { api } from '../lib/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentPage, setCurrentPage] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(false);

  const fetchIssues = useCallback(async () => {
    setLoadingIssues(true);
    try {
      const data = await api.getIssues();
      setIssues(data);
    } catch (err) {
      console.error('Failed to fetch issues:', err.message);
    } finally {
      setLoadingIssues(false);
    }
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('ca_user');
    const userId = localStorage.getItem('ca_userId');
    if (saved && userId) {
      const user = JSON.parse(saved);
      setCurrentUser(user);
      setCurrentPage('feed');
    }
  }, []);

  useEffect(() => {
    if (currentPage === 'feed' || currentPage === 'trending') {
      fetchIssues();
    }
  }, [currentPage, fetchIssues]);

  const login = useCallback((user) => {
    localStorage.setItem('ca_userId', user.id);
    localStorage.setItem('ca_user', JSON.stringify(user));
    setCurrentUser(user);
    setCurrentPage('feed');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ca_userId');
    localStorage.removeItem('ca_user');
    setCurrentUser(null);
    setCurrentPage('login');
  }, []);

  const showNotification = useCallback((message, type = 'info') => {
    setNotification({ message, type, id: Date.now() });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  const toggleLike = useCallback(async (issueId) => {
    const authUserId = localStorage.getItem('ca_userId');
    if (!authUserId) {
      showNotification('Please sign in to support issues', 'error');
      return;
    }

    let previousIssue = null;
    setIssues(prev => prev.map(issue => {
      if (issue.id === issueId) {
        previousIssue = issue;
        const liked = !issue.isLiked;
        return { ...issue, isLiked: liked, likes: Math.max(0, liked ? issue.likes + 1 : issue.likes - 1) };
      }
      return issue;
    }));

    try {
      const result = await api.toggleLike(issueId);
      // Sync with backend source-of-truth (handles race conditions and multi-clicks)
      if (typeof result?.likes === 'number' && typeof result?.isLiked === 'boolean') {
        setIssues(prev => prev.map(issue =>
          issue.id === issueId ? { ...issue, likes: result.likes, isLiked: result.isLiked } : issue
        ));
      }
    } catch (err) {
      // Revert optimistic update on failure
      if (previousIssue) {
        setIssues(prev => prev.map(issue => issue.id === issueId ? previousIssue : issue));
      }
      showNotification(err?.message || 'Failed to support issue', 'error');
    }
  }, [showNotification]);

  const addComment = useCallback(async (issueId, text) => {
    try {
      const newComment = await api.postComment(issueId, text);
      setIssues(prev => prev.map(issue => {
        if (issue.id === issueId) {
          return { ...issue, comments: [...issue.comments, newComment] };
        }
        return issue;
      }));
      return newComment;
    } catch (err) {
      showNotification('Failed to post comment', 'error');
      return null;
    }
  }, []);

  const submitIssue = useCallback(async (issueData) => {
    const formData = new FormData();
    formData.append('title', issueData.title);
    formData.append('description', issueData.description);
    formData.append('category', issueData.category);
    formData.append('location', issueData.location);
    if (issueData.coordinates) {
      formData.append('lat', issueData.coordinates.lat);
      formData.append('lng', issueData.coordinates.lng);
    }
    if (issueData.imageFile) {
      formData.append('image', issueData.imageFile);
    }

    const newIssue = await api.submitIssue(formData);
    setIssues(prev => [newIssue, ...prev]);
    showNotification('Issue reported successfully!', 'success');
    return { success: true, issue: newIssue };
  }, []);

  const navigateTo = useCallback((page, data = null) => {
    setCurrentPage(page);
    if (data) setSelectedIssue(data);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const getFilteredIssues = useCallback(() => {
    let filtered = issues;
    if (activeFilter !== 'all') filtered = filtered.filter(i => i.category === activeFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(i =>
        i.title.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [issues, activeFilter, searchQuery]);

  const getTrendingIssues = useCallback(() => {
    return [...issues]
      .sort((a, b) => (b.likes + b.comments.length) - (a.likes + a.comments.length))
      .slice(0, 8);
  }, [issues]);

  const value = {
    currentPage, currentUser, issues, selectedIssue,
    activeFilter, setActiveFilter, searchQuery, setSearchQuery,
    notification, loadingIssues,
    login, logout, toggleLike, addComment, submitIssue,
    navigateTo, getFilteredIssues, getTrendingIssues,
    showNotification, fetchIssues,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
