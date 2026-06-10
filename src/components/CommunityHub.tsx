import React, { useState } from 'react';
import { 
  ArrowLeft, MessageSquare, BookOpen, Share2, Award, Search, 
  Heart, CheckCircle2, Copy, Activity, Droplets, Moon, Send, X
} from 'lucide-react';

interface CommunityHubProps {
  onGoBack: () => void;
}

type TabType = 'forum' | 'blog' | 'referrals' | 'challenges';

export default function CommunityHub({ onGoBack }: CommunityHubProps) {
  const [activeTab, setActiveTab] = useState<TabType>('forum');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Details view state
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [newReplyText, setNewReplyText] = useState('');

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedPostId(null);
    setSelectedArticleId(null);
    setSearchQuery('');
  };
  
  // Health Challenges State
  const [tasks, setTasks] = useState([
    { id: 'water', label: 'Drink 8 glasses of water', completed: true, icon: <Droplets className="h-4 w-4" /> },
    { id: 'walk', label: 'Walk 5,000 steps', completed: false, icon: <Activity className="h-4 w-4" /> },
    { id: 'sleep', label: 'Sleep 8 hours', completed: true, icon: <Moon className="h-4 w-4" /> },
    { id: 'food', label: 'Eat 2 servings of vegetables', completed: false, icon: <Heart className="h-4 w-4" /> },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };
  
  const completedTasks = tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedTasks / tasks.length) * 100);

  // Referral State
  const [copied, setCopied] = useState(false);
  const referralCode = "DOCAI-8X92-V";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Join DocAI with my code ${referralCode} and get ₹100 off your first appointment! Check it out.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Mock Data: Forum
  const [forumData, setForumData] = useState([
    { 
      id: 1, title: 'Tips for managing work anxiety?', author: 'Priya K.', category: 'Mental Health', likes: 24, time: '2 hours ago', content: 'Lately I have been feeling overwhelmed with my workload and it is causing a lot of physical anxiety symptoms. Does anyone have any practical tips?',
      comments: [
        { id: 101, author: 'Dr. Sarah Thomas', role: 'doctor', text: 'Taking short breaks and practicing deep breathing can help immensely. Also consider consulting a professional.', time: '1 hour ago', likes: 12 },
        { id: 102, author: 'Rahul S.', role: 'patient', text: 'I also find going for a 5-minute walk outside really helps clear the mind.', time: '45 mins ago', likes: 5 }
      ]
    },
    { 
      id: 2, title: 'Best heart-healthy breakfast choices', author: 'Rahul S.', category: 'Heart', likes: 56, time: '5 hours ago', content: 'Looking for some quick and healthy breakfast options that are good for the heart and keep you full.',
      comments: [
        { id: 103, author: 'Dr. Vivek Nair', role: 'doctor', text: 'Oatmeal with berries and walnuts is an excellent, quick option rich in soluble fiber.', time: '3 hours ago', likes: 20 }
      ]
    },
    { 
      id: 3, title: 'Skin rash after taking new medication - normal?', author: 'Anonymous', category: 'Skin', likes: 12, time: '1 day ago', content: 'Started a new antibiotic and got a mild rash on my arms. Should I stop the medication immediately or wait it out?',
      comments: []
    },
  ]);

  const forumPosts = forumData.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedPost = selectedPostId ? forumData.find(p => p.id === selectedPostId) : null;

  const handleAddForumReply = () => {
    if (!newReplyText.trim() || !selectedPostId) return;
    setForumData(prev => prev.map(post => {
      if (post.id === selectedPostId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: Date.now(),
            author: 'You (Patient)',
            role: 'patient',
            text: newReplyText,
            time: 'Just now',
            likes: 0
          }]
        };
      }
      return post;
    }));
    setNewReplyText('');
  };

  // Mock Data: Blog
  const [blogData, setBlogData] = useState([
    { 
      id: 1, title: 'Understanding LDL and HDL Cholesterol', doctor: 'Dr. Vivek Nair', specialty: 'Cardiologist', readTime: '5 min read', likes: 142,
      coverUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&q=80&w=800',
      content: 'Cholesterol is a waxy substance found in your blood. Your body needs cholesterol to build healthy cells, but high levels of cholesterol can increase your risk of heart disease. With high cholesterol, you can develop fatty deposits in your blood vessels...',
      comments: [
        { id: 201, author: 'Priya K.', text: 'Very informative, thank you Doctor!', time: '1 day ago', likes: 3 }
      ]
    },
    { 
      id: 2, title: 'The Importance of Sleep Hygiene', doctor: 'Dr. Sarah Thomas', specialty: 'Neurologist', readTime: '8 min read', likes: 89,
      coverUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&q=80&w=800',
      content: 'Sleep hygiene refers to healthy sleep habits. Good sleep hygiene is important because of how crucial getting good sleep is for your mental and physical health. Behaviors that can improve sleep health include prioritizing sleep, optimizing your bedroom environment...',
      comments: []
    },
    { 
      id: 3, title: 'Summer Skincare: Beyond Sunscreen', doctor: 'Dr. Anjali Desai', specialty: 'Dermatologist', readTime: '4 min read', likes: 215,
      coverUrl: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80&w=800',
      content: 'While sunscreen is the foundation of any summer skincare routine, there are other steps you should take to protect your skin during the hotter months. Increased humidity and sweating can lead to breakouts...',
      comments: []
    },
  ]);

  const selectedArticle = selectedArticleId ? blogData.find(a => a.id === selectedArticleId) : null;

  const handleAddBlogComment = () => {
    if (!newReplyText.trim() || !selectedArticleId) return;
    setBlogData(prev => prev.map(article => {
      if (article.id === selectedArticleId) {
        return {
          ...article,
          comments: [...article.comments, {
            id: Date.now(),
            author: 'You (Patient)',
            text: newReplyText,
            time: 'Just now',
            likes: 0
          }]
        };
      }
      return article;
    }));
    setNewReplyText('');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6 animate-slide-right" id="community-hub-page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center space-x-3.5">
          <button 
            onClick={onGoBack}
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl transition-all shadow-xs active:scale-90 cursor-pointer flex items-center justify-center group"
          >
            <ArrowLeft className="h-5 w-5 transition-transform duration-300 group-hover:-translate-x-1 group-active:scale-90" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="bg-rose-100 text-rose-800 text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded uppercase">
                Connect & Grow
              </span>
            </div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tight mt-0.5">
              Community Hub
            </h1>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
        <button 
          onClick={() => handleTabChange('forum')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'forum' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Patient Forum</span>
        </button>
        <button 
          onClick={() => handleTabChange('blog')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'blog' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <BookOpen className="h-4 w-4" />
          <span>Doctor Blog</span>
        </button>
        <button 
          onClick={() => handleTabChange('challenges')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'challenges' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Award className="h-4 w-4" />
          <span>Health Challenges</span>
        </button>
        <button 
          onClick={() => handleTabChange('referrals')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${activeTab === 'referrals' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <Share2 className="h-4 w-4" />
          <span>Refer a Friend</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white/80 backdrop-blur-xs border border-slate-200 rounded-2xl shadow-xs min-h-[400px]">
        
        {/* 1. Patient Forum */}
        {activeTab === 'forum' && !selectedPost && (
          <div className="p-6 space-y-6 animate-fade-in text-left">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by keyword or tag (e.g., Heart, Skin)" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                />
              </div>
              <button className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors whitespace-nowrap">
                Ask a Question
              </button>
            </div>

            <div className="space-y-4">
              {forumPosts.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-sm">No discussions found matching your search.</div>
              ) : (
                forumPosts.map(post => (
                  <div key={post.id} onClick={() => setSelectedPostId(post.id)} className="p-4 border border-slate-100 bg-white rounded-xl hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex justify-between items-start mb-2">
                      <span className="bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                        {post.category}
                      </span>
                      <span className="text-xs text-slate-400">{post.time}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 mb-2">{post.title}</h3>
                    <div className="flex items-center justify-between mt-4 text-slate-500 text-xs font-semibold">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1 hover:text-rose-500 transition-colors"><Heart className="h-4 w-4" /> <span>{post.likes}</span></span>
                        <span className="flex items-center space-x-1 hover:text-indigo-500 transition-colors"><MessageSquare className="h-4 w-4" /> <span>{post.comments.length} Replies</span></span>
                      </div>
                      <span>By {post.author}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Selected Forum Post View */}
        {activeTab === 'forum' && selectedPost && (
          <div className="p-6 space-y-6 animate-fade-in text-left">
            <button 
              onClick={() => { setSelectedPostId(null); setNewReplyText(''); }}
              className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-sm font-semibold mb-4 transition-colors w-max cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Forum</span>
            </button>
            
            <div className="space-y-4 pb-6 border-b border-slate-100">
              <div className="flex justify-between items-start">
                <span className="bg-indigo-50 text-indigo-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
                  {selectedPost.category}
                </span>
                <span className="text-xs text-slate-400">{selectedPost.time}</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-slate-900">{selectedPost.title}</h2>
              <p className="text-slate-700 leading-relaxed text-sm">{selectedPost.content}</p>
              
              <div className="flex items-center justify-between mt-4 text-slate-500 text-xs font-semibold pt-4">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1 hover:text-rose-500 transition-colors cursor-pointer"><Heart className="h-4 w-4" /> <span>{selectedPost.likes}</span></span>
                  <span className="flex items-center space-x-1"><MessageSquare className="h-4 w-4" /> <span>{selectedPost.comments.length} Replies</span></span>
                </div>
                <span>Posted by <strong className="text-slate-800">{selectedPost.author}</strong></span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-slate-800 mb-4">Discussion ({selectedPost.comments.length})</h3>
              
              {selectedPost.comments.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
                  No replies yet. Be the first to share your thoughts!
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedPost.comments.map(comment => (
                    <div key={comment.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-800 text-sm">{comment.author}</span>
                          {comment.role === 'doctor' && (
                            <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider ml-2">Verified Doctor</span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">{comment.time}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed mb-3">{comment.text}</p>
                      <div className="flex items-center space-x-1 text-slate-400 hover:text-rose-500 text-xs font-semibold cursor-pointer w-max transition-colors">
                        <Heart className="h-3.5 w-3.5" /> <span>{comment.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 relative">
              <textarea 
                value={newReplyText}
                onChange={(e) => setNewReplyText(e.target.value)}
                placeholder="Write your reply..."
                className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 min-h-[100px] resize-y shadow-xs"
              />
              <button 
                onClick={handleAddForumReply}
                disabled={!newReplyText.trim()}
                className={`absolute bottom-4 right-3 p-2 rounded-lg transition-all ${newReplyText.trim() ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* 2. Doctor Blog List */}
        {activeTab === 'blog' && !selectedArticle && (
          <div className="p-6 space-y-6 animate-fade-in text-left">
            <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-none">
              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-200 transition-colors">All</span>
              <span className="px-3 py-1 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">Cardiologist</span>
              <span className="px-3 py-1 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">Neurologist</span>
              <span className="px-3 py-1 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">Dermatologist</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {blogData.map(article => (
                <div key={article.id} onClick={() => setSelectedArticleId(article.id)} className="flex flex-col border border-slate-100 bg-white rounded-2xl overflow-hidden hover:shadow-md transition-shadow relative cursor-pointer">
                  <div className="h-32 bg-slate-100 w-full relative">
                    <img src={article.coverUrl} className="absolute inset-0 w-full h-full object-cover" alt={article.title} referrerPolicy="no-referrer" />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded text-slate-800">
                      {article.readTime}
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-slate-900 leading-snug pr-4">{article.title}</h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500 font-medium">By {article.doctor} • {article.specialty}</p>
                        <button className="text-[10px] bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-2 py-0.5 rounded transition-colors" onClick={(e) => e.stopPropagation()}>Follow</button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-50 text-xs">
                      <button className="flex items-center space-x-1.5 text-slate-400 hover:text-rose-500 font-semibold transition-colors">
                        <Heart className="h-4 w-4" /> <span>{article.likes}</span>
                      </button>
                      <button className="text-indigo-600 font-bold hover:text-indigo-800 flex items-center space-x-1">
                        <MessageSquare className="h-3.5 w-3.5" /> <span>{article.comments.length} Comments</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Blog Article View */}
        {activeTab === 'blog' && selectedArticle && (
          <div className="p-6 space-y-6 animate-fade-in text-left">
            <button 
              onClick={() => { setSelectedArticleId(null); setNewReplyText(''); }}
              className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-sm font-semibold mb-4 transition-colors w-max cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Articles</span>
            </button>
            
            <div className="h-48 bg-slate-100 w-full rounded-2xl relative mb-6 overflow-hidden">
              <img src={selectedArticle.coverUrl} className="absolute inset-0 w-full h-full object-cover" alt={selectedArticle.title} referrerPolicy="no-referrer" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded text-slate-800">
                {selectedArticle.readTime}
              </div>
            </div>

            <div className="space-y-4 pb-6 border-b border-slate-100">
              <h2 className="text-3xl font-black font-display text-slate-900 leading-tight">{selectedArticle.title}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-50 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                    {selectedArticle.doctor.charAt(4)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{selectedArticle.doctor}</p>
                    <p className="text-xs text-slate-500">{selectedArticle.specialty}</p>
                  </div>
                </div>
                <button className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-bold px-4 py-1.5 rounded-lg text-xs transition-colors self-start sm:self-auto cursor-pointer">
                  Follow Doctor
                </button>
              </div>
              <p className="text-slate-700 leading-relaxed text-sm pt-2 min-h-[100px]">{selectedArticle.content}</p>
              
              <div className="flex items-center text-slate-500 text-xs font-semibold pt-4 space-x-6">
                <span className="flex items-center space-x-1.5 hover:text-rose-500 transition-colors cursor-pointer"><Heart className="h-4 w-4" /> <span>{selectedArticle.likes} Likes</span></span>
                <span className="flex items-center space-x-1.5 hover:text-indigo-600 transition-colors cursor-pointer"><Share2 className="h-4 w-4" /> <span>Share</span></span>
              </div>
            </div>

            {/* Comments Section for Blog */}
            <div className="space-y-4 pt-2">
              <h3 className="font-bold text-slate-800 mb-4">Comments ({selectedArticle.comments.length})</h3>
              
              {selectedArticle.comments.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
                  Be the first to comment on this article!
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedArticle.comments.map(comment => (
                    <div key={comment.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100/50">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm">{comment.author}</span>
                        <span className="text-xs text-slate-400">{comment.time}</span>
                      </div>
                      <p className="text-slate-700 text-sm leading-relaxed mb-3">{comment.text}</p>
                      <div className="flex items-center space-x-1 text-slate-400 hover:text-rose-500 text-xs font-semibold cursor-pointer w-max transition-colors">
                        <Heart className="h-3.5 w-3.5" /> <span>{comment.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 mt-6 relative">
              <textarea 
                value={newReplyText}
                onChange={(e) => setNewReplyText(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full pl-4 pr-12 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 min-h-[100px] resize-y shadow-xs"
              />
              <button 
                onClick={handleAddBlogComment}
                disabled={!newReplyText.trim()}
                className={`absolute bottom-4 right-3 p-2 rounded-lg transition-all ${newReplyText.trim() ? 'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 cursor-pointer' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* 3. Health Challenges */}
        {activeTab === 'challenges' && (
          <div className="p-6 space-y-8 animate-fade-in text-left">
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                <span className="text-xs text-indigo-600 font-bold uppercase tracking-wider block mb-1">Weekly Streak</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black font-display text-indigo-900">4</span>
                  <span className="text-sm font-semibold text-indigo-700">Days</span>
                </div>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider block mb-1">Today's Progress</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black font-display text-emerald-900">{progressPercent}%</span>
                </div>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-600">
                <span>Daily Goals</span>
                <span>{completedTasks} / {tasks.length} Completed</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>

            {/* Interactive Tasks */}
            <div className="space-y-3 pt-2">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  onClick={() => toggleTask(task.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    task.completed ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 text-sm font-semibold">
                    <span className={`p-2 rounded-lg ${task.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {task.icon}
                    </span>
                    <span className={task.completed ? 'text-slate-800 line-through opacity-70' : 'text-slate-800'}>
                      {task.label}
                    </span>
                  </div>
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                    task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                  }`}>
                    {task.completed && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Refer a Friend */}
        {activeTab === 'referrals' && (
          <div className="p-6 md:p-10 space-y-8 animate-fade-in text-center max-w-xl mx-auto">
            <div className="space-y-3">
              <div className="mx-auto w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-4">
                <Share2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-black font-display text-slate-900">Invite & Earn Health Credits</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Give a friend <strong className="text-slate-900">₹100 off</strong> their first appointment. 
                You'll get <strong className="text-emerald-600">₹50 credit</strong> when they book!
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl space-y-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Your Unique Code</span>
              <div className="text-3xl font-black font-mono tracking-widest text-indigo-700 bg-white border border-indigo-100 py-3 rounded-xl">
                {referralCode}
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button 
                  onClick={handleCopy}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-sm rounded-xl transition-colors"
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
                <button 
                  onClick={shareOnWhatsApp}
                  className="w-full flex items-center justify-center space-x-2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Basic Tracker */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-left">
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Total Earnings</span>
                <span className="text-xl font-bold text-emerald-600 font-display">₹150</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-semibold block">Successful Referrals</span>
                <span className="text-xl font-bold text-slate-800 font-display">3 Friends</span>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
