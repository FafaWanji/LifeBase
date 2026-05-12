import React, { useState, useEffect, useRef, createContext, useContext, type ReactNode } from 'react';
import { 
  StickyNote, Plus, Trash2, X, Settings, 
  Pencil, Tag, Search, Cloud, CloudOff, LogOut, Lock,
  Eye, Edit3, RefreshCw, Archive, Pin, Camera, BookOpen,
  ChevronLeft, Copy, Check
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''; 
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

type ThemeMode = 'dark' | 'light';
type DesignMode = 'minimalist' | 'classic';
type AccentKey = 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet';
type Language = 'de' | 'en' | 'tr';
type SortMode = 'updated' | 'created' | 'az';

interface Label { id: string; name: string; color: string; textColor: string; }
interface Note { id: number; title: string; content: string; labelId: string; date: string; isDeleted?: boolean; isPinned?: boolean; updatedAt?: number; }
interface AccentProfile { name: string; primary: string; hover: string; text: string; ring: string; lightBg: string; border: string; gradient: string; }

interface ThemeContextType {
  bgMain: string; bgCard: string; bgInput: string; textMain: string; textSec: string; border: string; modalOverlay: string;
  accent: AccentProfile; mode: ThemeMode; setMode: (m: ThemeMode) => void;
  designMode: DesignMode; setDesignMode: (d: DesignMode) => void;
  accentKey: AccentKey; setAccentKey: (k: AccentKey) => void;
  language: Language; setLanguage: (l: Language) => void; t: (k: string) => string;
}

interface DataContextType {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  labels: Label[]; setLabels: React.Dispatch<React.SetStateAction<Label[]>>;
  activeFilters: string[]; setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>;
  toggleFilter: (id: string) => void;
  syncStatus: 'synced' | 'syncing' | 'error';
  lastSaved: string | null;
}

const defaultLabels: Label[] = [
  { id: '1', name: 'Allgemein', color: 'bg-yellow-200', textColor: 'text-yellow-900' },
  { id: '2', name: 'Arbeit', color: 'bg-blue-200', textColor: 'text-blue-900' },
  { id: '3', name: 'Privat', color: 'bg-green-200', textColor: 'text-green-900' },
  { id: '4', name: 'Wichtig', color: 'bg-red-200', textColor: 'text-red-900' },
];

const availableColors = [
  { bg: 'bg-yellow-200', text: 'text-yellow-900', name: 'Gelb' },
  { bg: 'bg-blue-200', text: 'text-blue-900', name: 'Blau' },
  { bg: 'bg-green-200', text: 'text-green-900', name: 'Grün' },
  { bg: 'bg-red-200', text: 'text-red-900', name: 'Rot' },
  { bg: 'bg-purple-200', text: 'text-purple-900', name: 'Lila' },
  { bg: 'bg-orange-200', text: 'text-orange-900', name: 'Orange' },
  { bg: 'bg-gray-200', text: 'text-gray-900', name: 'Grau' },
  { bg: 'bg-pink-200', text: 'text-pink-900', name: 'Pink' },
  { bg: 'bg-teal-200', text: 'text-teal-900', name: 'Türkis' },
];

const dictionary: Record<Language, Record<string, string>> = {
  de: { appTitle: "LifeBase", navNotes: "Notizen", navTrash: "Papierkorb", newNote: "Neue Notiz", titlePlaceholder: "Titel...", contentPlaceholder: "Inhalt (Markdown)...", save: "Speichern", settings: "Einstellungen", theme: "Farbe", layout: "Design", minimalist: "Minimalist", classic: "Klassisch", language: "Sprache", login: "Einloggen", logout: "Abmelden", restore: "Wiederherstellen", deletePerm: "Löschen", lastSaved: "Gespeichert:", unlabeled: "Ohne Label", manual: "Anleitung", sortUpdated: "Zuletzt bearbeitet", sortCreated: "Erstellt", sortAZ: "A-Z", words: "Wörter", chars: "Zeichen", min: "Min" },
  en: { appTitle: "LifeBase", navNotes: "Notes", navTrash: "Trash", newNote: "New Note", titlePlaceholder: "Title...", contentPlaceholder: "Content (Markdown)...", save: "Save", settings: "Settings", theme: "Theme", layout: "Design", minimalist: "Minimalist", classic: "Classic", language: "Language", login: "Login", logout: "Logout", restore: "Restore", deletePerm: "Delete", lastSaved: "Saved:", unlabeled: "Unlabeled", manual: "Manual", sortUpdated: "Last updated", sortCreated: "Created", sortAZ: "A-Z", words: "Words", chars: "Chars", min: "Min" },
  tr: { appTitle: "LifeBase", navNotes: "Notlar", navTrash: "Çöp Kutusu", newNote: "Yeni Not", titlePlaceholder: "Başlık...", contentPlaceholder: "İçerik (Markdown)...", save: "Kaydet", settings: "Ayarlar", theme: "Tema", layout: "Görünüm", minimalist: "Minimalist", classic: "Klasik", language: "Dil", login: "Giriş Yap", logout: "Çıkış Yap", restore: "Geri Yükle", deletePerm: "Sil", lastSaved: "Kaydedildi:", unlabeled: "Etiketsiz", manual: "Kılavuz", sortUpdated: "Son düzenleme", sortCreated: "Oluşturuldu", sortAZ: "A-Z", words: "Kelime", chars: "Karakter", min: "Dk" }
};

const accents: Record<AccentKey, AccentProfile> = {
  indigo: { name: 'Zen Indigo', primary: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-500', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-500/20', border: 'border-indigo-500', gradient: 'from-indigo-500 to-purple-600' },
  rose: { name: 'Rose Red', primary: 'bg-rose-600', hover: 'hover:bg-rose-700', text: 'text-rose-500', ring: 'focus:ring-rose-500', lightBg: 'bg-rose-500/20', border: 'border-rose-500', gradient: 'from-rose-500 to-pink-600' },
  emerald: { name: 'Emerald', primary: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-500', ring: 'focus:ring-emerald-500', lightBg: 'bg-emerald-500/20', border: 'border-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
  amber: { name: 'Amber', primary: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-500', ring: 'focus:ring-amber-500', lightBg: 'bg-amber-500/20', border: 'border-amber-500', gradient: 'from-amber-500 to-orange-600' },
  cyan: { name: 'Cyan Future', primary: 'bg-cyan-600', hover: 'hover:bg-cyan-700', text: 'text-cyan-500', ring: 'focus:ring-cyan-500', lightBg: 'bg-cyan-500/20', border: 'border-cyan-500', gradient: 'from-cyan-500 to-blue-600' },
  violet: { name: 'Violet', primary: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-500', ring: 'focus:ring-violet-500', lightBg: 'bg-violet-500/20', border: 'border-violet-500', gradient: 'from-violet-500 to-fuchsia-600' }
};

const themes: Record<ThemeMode, any> = {
  dark: { bgMain: 'bg-black', bgCard: 'bg-gray-900', bgInput: 'bg-gray-900', textMain: 'text-gray-100', textSec: 'text-gray-400', border: 'border-gray-800', modalOverlay: 'bg-black/90' },
  light: { bgMain: 'bg-gray-50', bgCard: 'bg-white', bgInput: 'bg-gray-100', textMain: 'text-gray-900', textSec: 'text-gray-500', border: 'border-gray-200', modalOverlay: 'bg-gray-900/20' }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const DataContext = createContext<DataContextType | undefined>(undefined);

const useTheme = () => { const c = useContext(ThemeContext); if (!c) throw new Error('useTheme missing'); return c; };
const useData = () => { const c = useContext(DataContext); if (!c) throw new Error('useData missing'); return c; };

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem('lb_theme_mode') as ThemeMode) || 'dark');
  const [designMode, setDesignMode] = useState<DesignMode>(() => (localStorage.getItem('lb_design_mode') as DesignMode) || 'minimalist');
  const [accentKey, setAccentKey] = useState<AccentKey>(() => (localStorage.getItem('lb_theme_accent') as AccentKey) || 'indigo');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lb_language') as Language) || 'en');
  useEffect(() => {
    localStorage.setItem('lb_theme_mode', mode);
    localStorage.setItem('lb_design_mode', designMode);
    localStorage.setItem('lb_theme_accent', accentKey);
    localStorage.setItem('lb_language', language);
  }, [mode, designMode, accentKey, language]);
  return <ThemeContext.Provider value={{ ...themes[mode], accent: accents[accentKey], mode, setMode, designMode, setDesignMode, accentKey, setAccentKey, language, setLanguage, t: (k) => dictionary[language][k] || k }}>{children}</ThemeContext.Provider>;
};

const DataProvider: React.FC<{ children: ReactNode, session: any }> = ({ children, session }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [labels, setLabels] = useState<Label[]>(defaultLabels);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      setSyncStatus('syncing');
      try {
        const { data, error } = await supabase.from('app_data').select('*').eq('user_id', session.user.id).single();
        if (data && !error) {
          setNotes(data.notes || []);
          setLabels(data.labels || defaultLabels);
          setSyncStatus('synced');
        } else if (error && error.code === 'PGRST116') {
          await supabase.from('app_data').insert({ user_id: session.user.id, notes: [], labels: defaultLabels });
          setSyncStatus('synced');
        } else {
          setSyncStatus('error');
        }
      } catch { setSyncStatus('error'); }
      isInitialLoad.current = false;
    };
    fetchData();
  }, [session.user.id]);

  useEffect(() => {
    const channel = supabase.channel('db-sync').on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_data', filter: `user_id=eq.${session.user.id}` }, (payload: any) => {
      if (payload.new) {
        setNotes(payload.new.notes);
        setLabels(payload.new.labels);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session.user.id]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    const save = async () => {
      setSyncStatus('syncing');
      const { error } = await supabase.from('app_data').update({ notes, labels, updated_at: new Date().toISOString() }).eq('user_id', session.user.id);
      if (!error) {
        setSyncStatus('synced');
        setLastSaved(new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
      } else setSyncStatus('error');
    };
    const timer = setTimeout(save, 1000);
    return () => clearTimeout(timer);
  }, [notes, labels, session.user.id]);

  const toggleFilter = (id: string) => setActiveFilters(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  return <DataContext.Provider value={{ notes, setNotes, labels, setLabels, activeFilters, setActiveFilters, toggleFilter, syncStatus, lastSaved }}>{children}</DataContext.Provider>;
};

const renderMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    let html = line
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="rounded-xl my-4 max-w-full shadow-lg" />')
      .replace(/`([^`]+)`/g, '<code class="bg-black/20 rounded px-1 text-sm font-mono">$1</code>');

    if (line.startsWith('# ')) return <h1 key={i} className="text-2xl md:text-3xl font-bold mt-6 mb-2 border-b border-black/5 pb-2">{html.substring(2)}</h1>;
    if (line.startsWith('## ')) return <h2 key={i} className="text-xl md:text-2xl font-bold mt-5 mb-2">{html.substring(3)}</h2>;
    if (line.startsWith('- [ ] ')) return <div key={i} className="flex items-center gap-2 my-1"><div className="w-4 h-4 border-2 border-black/20 rounded mt-0.5 shrink-0" /> <span dangerouslySetInnerHTML={{__html: html.substring(6)}} /></div>;
    if (line.startsWith('- [x] ')) return <div key={i} className="flex items-center gap-2 my-1 opacity-50"><div className="w-4 h-4 bg-indigo-500 rounded flex items-center justify-center mt-0.5 shrink-0"><X size={10} color="white"/></div> <span className="line-through" dangerouslySetInnerHTML={{__html: html.substring(6)}} /></div>;
    if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc marker:text-gray-400" dangerouslySetInnerHTML={{__html: html.substring(2)}} />;
    return <p key={i} className="min-h-[1.5rem] leading-relaxed" dangerouslySetInnerHTML={{__html: html}} />;
  });
};

const handleSmartEditor = (e: React.KeyboardEvent<HTMLTextAreaElement>, content: string, setContent: (val: string) => void) => {
  const textarea = e.currentTarget;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const before = content.substring(0, start);
  const after = content.substring(end);
  const lineStart = before.lastIndexOf('\n') + 1;
  const currentLine = before.substring(lineStart);

  if (e.key === 'Enter') {
    const listMatch = currentLine.match(/^(\s*)(-|\*|1\.|- \[ \]| - \[x\])\s/);
    if (listMatch) {
      e.preventDefault();
      if (currentLine.trim() === listMatch[2]) {
        const newContent = before.substring(0, lineStart) + '\n' + after;
        setContent(newContent);
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = lineStart + 1; }, 0);
      } else {
        const nextPrefix = `\n${listMatch[1]}${listMatch[2]} `;
        setContent(before + nextPrefix + after);
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + nextPrefix.length; }, 0);
      }
    }
  }

  if (e.key === 'Tab') {
    e.preventDefault();
    const tab = "  ";
    if (e.shiftKey) {
      if (currentLine.startsWith(tab)) {
        const newContent = before.substring(0, lineStart) + currentLine.substring(tab.length) + after;
        setContent(newContent);
        setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start - tab.length; }, 0);
      }
    } else {
      setContent(before + tab + after);
      setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + tab.length; }, 0);
    }
  }

  const pairs: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'" };
  if (pairs[e.key]) {
    e.preventDefault();
    const closing = pairs[e.key];
    if (start !== end) {
      const selected = content.substring(start, end);
      setContent(before + e.key + selected + closing + after);
      setTimeout(() => { textarea.selectionStart = start + 1; textarea.selectionEnd = end + 1; }, 0);
    } else {
      setContent(before + e.key + closing + after);
      setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + 1; }, 0);
    }
  }

  if (e.key === 'Backspace' && start === end) {
    const charBefore = before.slice(-1);
    const charAfter = after.charAt(0);
    if (pairs[charBefore] === charAfter) {
      e.preventDefault();
      setContent(before.slice(0, -1) + after.slice(1));
      setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start - 1; }, 0);
    }
  }
};

const Button: React.FC<any> = ({ children, variant = 'primary', className = '', ...props }) => {
  const { bgCard, textMain, textSec, border, accent } = useTheme();
  const variants: any = { primary: `${accent.primary} text-white shadow-md`, secondary: `${bgCard} ${textMain} border ${border}`, danger: "bg-red-500/10 text-red-500 font-bold", ghost: `${textSec} hover:${textMain}` };
  return <button className={`px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Modal: React.FC<any> = ({ isOpen, onClose, title, children }) => {
  const { bgCard, border, textMain, textSec, modalOverlay } = useTheme();
  if (!isOpen) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 ${modalOverlay} backdrop-blur-sm animate-in fade-in`}>
      <div className={`${bgCard} w-full max-w-md max-h-[85vh] flex flex-col rounded-3xl border ${border} shadow-2xl overflow-hidden`}>
        <div className={`flex justify-between p-5 border-b ${border}`}>
          <h3 className={`font-bold text-lg ${textMain}`}>{title}</h3>
          <button onClick={onClose} className={`hover:bg-black/10 p-1 rounded-lg transition-colors ${textSec}`}><X size={20}/></button>
        </div>
        <div className={`p-5 overflow-y-auto ${textMain}`}>{children}</div>
      </div>
    </div>
  );
};

const LabelManager: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { bgInput, border, textSec, textMain, bgCard, accent, t } = useTheme();
  const { labels, setLabels, setNotes } = useData();
  const [name, setName] = useState('');
  const [color, setColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = () => { 
    if (!name.trim()) return; 
    if (editingId) { 
      setLabels(prev => prev.map(l => l.id === editingId ? { ...l, name, color: color.bg, textColor: color.text } : l));
      setEditingId(null); 
    } else { 
      setLabels(prev => [...prev, { id: Date.now().toString(), name, color: color.bg, textColor: color.text }]); 
    } 
    setName(''); 
  };

  const handleDelete = (id: string) => { 
    if (labels.length <= 1) return alert(t('deleteLabelError')); 
    if (!confirm(t('deleteLabelConfirm'))) return; 
    setLabels(prev => prev.filter(l => l.id !== id));
    setNotes(prev => prev.map(n => n.labelId === id ? { ...n, labelId: '' } : n));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('manageLabels')}>
      <div className="space-y-6">
        <div className={`p-4 rounded-xl border ${border} ${bgInput}`}>
          <div className="flex gap-2 mb-3">
            <input value={name} onChange={(e: any) => setName(e.target.value)} placeholder="Name..." className={`w-full bg-transparent border-b ${border} outline-none py-1`} />
            <Button onClick={handleSave} disabled={!name.trim()} className="py-2 px-4">{editingId ? 'Ok' : <Plus size={18} />}</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableColors.map(c => <button key={c.name} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${c.bg} border-2 transition-transform ${color.bg === c.bg ? 'border-gray-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} />)}
          </div>
        </div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {labels.map(l => (
            <div key={l.id} className={`flex items-center justify-between p-3 rounded-lg border ${border} ${bgCard}`}>
              <div className="flex items-center gap-3"><div className={`w-4 h-4 rounded-full ${l.color}`}></div><span className={`font-medium ${textMain}`}>{l.name}</span></div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingId(l.id); setName(l.name); setColor(availableColors.find(c => c.bg === l.color) || availableColors[0]); }} className={`${textSec} hover:${accent.text} p-2`}><Pencil size={16}/></button>
                <button onClick={() => handleDelete(l.id)} className={`${textSec} hover:text-red-400 p-2`}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

const NoteCard = ({ note, label, isSelected, currentTab, onClick }: any) => {
  const { bgCard, accent } = useTheme();
  const { setNotes } = useData();
  const [swipeX, setSwipeX] = useState(0);
  const [hoverRatio, setHoverRatio] = useState<number | null>(null);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const touchStartX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e: React.TouchEvent) => {
    const diff = e.touches[0].clientX - touchStartX.current;
    if (diff < 0) setSwipeX(diff);
  };
  
  const handleTouchEnd = () => {
    if (swipeX < -100) {
      setSwipeX(-window.innerWidth);
      setIsAnimatingOut(true);
      setTimeout(() => setNotes(prev => prev.map(x => x.id === note.id ? {...x, isDeleted: currentTab === 'notes'} : x)), 250);
    } else {
      setSwipeX(0);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (currentTab === 'trash') return;
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverRatio((e.clientX - rect.left) / rect.width);
  };

  let overlayBg = '';
  if (hoverRatio !== null && currentTab !== 'trash') {
    const isLeft = hoverRatio < 0.5;
    const intensity = isLeft ? (0.5 - hoverRatio) * 2 : (hoverRatio - 0.5) * 2;
    overlayBg = isLeft 
      ? `linear-gradient(to right, rgba(234,179,8,${intensity * 0.25}), transparent)` 
      : `linear-gradient(to left, rgba(239,68,68,${intensity * 0.25}), transparent)`;
  }

  return (
    <div className={`relative mb-3 rounded-2xl overflow-hidden shrink-0 transition-all duration-300 ${isAnimatingOut ? 'h-0 opacity-0 mb-0 scale-95' : 'opacity-100'} ${isSelected ? `ring-2 ${accent.ring} shadow-md` : `ring-2 ring-transparent border-2 border-transparent hover:border-black/10 dark:hover:border-white/10`}`}>
      <div className={`absolute inset-0 flex items-center px-6 text-white justify-end ${currentTab === 'notes' ? 'bg-red-500' : 'bg-green-500'}`}>
        {currentTab === 'notes' ? <Trash2 size={24} /> : <RefreshCw size={24} />}
      </div>
      
      <div 
        onClick={() => onClick(note.id)}
        onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
        onMouseMove={handleMouseMove} onMouseLeave={() => setHoverRatio(null)}
        style={{ transform: `translateX(${swipeX}px)`, transition: swipeX === 0 ? 'transform 0.2s ease-out' : 'none' }}
        className={`group relative p-4 cursor-pointer box-border h-full ${label ? label.color + ' ' + label.textColor : bgCard} ${currentTab === 'trash' ? 'opacity-70 grayscale' : ''} bg-opacity-100`}
      >
        {overlayBg && <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: overlayBg }} />}
        
        <div className="absolute inset-y-0 left-0 w-12 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex z-10">
          {currentTab === 'notes' && <button onClick={(e) => { e.stopPropagation(); setNotes(prev => prev.map(x => x.id === note.id ? {...x, isPinned: !x.isPinned, updatedAt: Date.now()} : x)); }} className={`p-2 rounded-full backdrop-blur-md bg-white/30 dark:bg-black/30 ${note.isPinned ? 'text-yellow-600' : 'hover:text-yellow-600'}`}><Pin size={16} fill={note.isPinned ? "currentColor" : "none"} /></button>}
        </div>
        <div className="absolute inset-y-0 right-0 w-12 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex z-10">
          {currentTab === 'notes' ? (
            <button onClick={(e) => { e.stopPropagation(); setNotes(prev => prev.map(x => x.id === note.id ? {...x, isDeleted: true} : x)); }} className="p-2 rounded-full backdrop-blur-md bg-white/30 dark:bg-black/30 hover:text-red-600"><Trash2 size={16} /></button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setNotes(prev => prev.map(x => x.id === note.id ? {...x, isDeleted: false} : x)); }} className="p-2 rounded-full backdrop-blur-md bg-white/30 dark:bg-black/30 hover:text-green-600"><RefreshCw size={16} /></button>
          )}
        </div>

        <div className="relative z-0">
           {label && <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5 opacity-80">{label.name}</div>}
           <div className="flex justify-between items-start gap-2">
             <h4 className="font-bold text-base leading-tight line-clamp-1">{note.title || 'Untitled'}</h4>
             {note.isPinned && currentTab !== 'trash' && <Pin size={12} fill="currentColor" className="opacity-50 shrink-0 mt-1 md:hidden"/>}
           </div>
           <p className="text-xs opacity-70 mt-1 line-clamp-2 leading-relaxed font-mono">{note.content || '...'}</p>
        </div>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const { bgMain, bgCard, border, textMain, textSec, accent, t, bgInput, mode, setMode, designMode, setDesignMode, language, setLanguage } = useTheme();
  const { notes, setNotes, labels, syncStatus, lastSaved, activeFilters, toggleFilter } = useData();
  
  const [currentTab, setCurrentTab] = useState<'notes' | 'trash'>('notes');
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('updated');
  const [isPreview, setIsPreview] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const activeNotes = notes.filter(n => !n.isDeleted);
  const trashNotes = notes.filter(n => n.isDeleted);
  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const displayNotes = currentTab === 'notes' ? activeNotes : trashNotes;
  
  const sortedNotes = [...displayNotes].sort((a, b) => {
    if (a.isPinned !== b.isPinned) return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
    if (sortMode === 'az') return a.title.localeCompare(b.title);
    if (sortMode === 'created') return b.id - a.id;
    return (b.updatedAt || b.id) - (a.updatedAt || a.id);
  });

  const filteredNotes = sortedNotes.filter(n => 
    (activeFilters.length === 0 || activeFilters.includes(n.labelId || 'unlabeled')) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
  );

  const isClassic = designMode === 'classic';
  const activeLabel = labels.find(l => l.id === selectedNote?.labelId);
  
  const editorWrapperClass = isClassic ? 'bg-black/5 dark:bg-white/5 md:p-8' : '';
  const editorInnerClass = isClassic 
    ? `${activeLabel ? activeLabel.color : bgCard} ${activeLabel ? activeLabel.textColor : textMain} p-4 sm:p-6 md:p-8 md:rounded-3xl shadow-xl border-t sm:border ${border}` 
    : 'p-4 sm:p-6 md:p-12';
  const editorSecTextClass = isClassic && activeLabel ? 'opacity-70 text-black/70' : textSec;
  const iconBtnClass = `p-2 rounded-xl transition-colors ${isClassic && activeLabel ? 'bg-black/10 hover:bg-black/20 text-black/70' : 'bg-black/5 dark:bg-white/5 text-gray-500 hover:bg-black/10 dark:hover:bg-white/10'}`;

  const wordCount = selectedNote?.content.trim().split(/\s+/).filter(w => w.length > 0).length || 0;
  const charCount = selectedNote?.content.length || 0;
  const readTime = Math.ceil(wordCount / 200);

  useEffect(() => {
    const handlePopState = () => {
      if (isManualOpen) setIsManualOpen(false);
      else if (isSettingsOpen) setIsSettingsOpen(false);
      else if (isLabelManagerOpen) setIsLabelManagerOpen(false);
      else if (selectedNoteId !== null) setSelectedNoteId(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isManualOpen, isSettingsOpen, isLabelManagerOpen, selectedNoteId]);

  useEffect(() => {
    if (isManualOpen || isSettingsOpen || isLabelManagerOpen || selectedNoteId !== null) {
      window.history.pushState({ popup: true }, '');
    }
  }, [isManualOpen, isSettingsOpen, isLabelManagerOpen, selectedNoteId]);

  useEffect(() => {
    const handleGlobalKeys = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedNoteId && currentTab === 'notes' && document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT') {
        setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isDeleted: true} : n));
        setSelectedNoteId(null);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createNewNote();
      }
      if (e.key === 'Escape' && selectedNoteId) setSelectedNoteId(null);
    };
    window.addEventListener('keydown', handleGlobalKeys);
    return () => window.removeEventListener('keydown', handleGlobalKeys);
  }, [selectedNoteId, currentTab]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedNoteId) return;
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage.from('note-images').upload(fileName, file);
    if (error) { alert("Upload failed."); return; }
    if (data) {
      const { data: { publicUrl } } = supabase.storage.from('note-images').getPublicUrl(fileName);
      const imgMarkdown = `\n![image](${publicUrl})\n`;
      setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, content: n.content + imgMarkdown, updatedAt: Date.now()} : n));
    }
  };

  const createNewNote = () => {
    const id = Date.now(); 
    setNotes(prev => [{id, title:'', content:'', labelId:'', date:new Date().toLocaleDateString(), updatedAt: id}, ...prev]); 
    setSelectedNoteId(id); 
    setIsPreview(false);
    setTimeout(() => { if (titleRef.current) titleRef.current.focus(); }, 100);
  };

  const handleCopy = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`h-[100dvh] w-full flex ${bgMain} ${textMain} font-sans overflow-hidden overscroll-none`}>
      <aside className={`hidden md:flex w-64 border-r ${border} flex-col ${bgCard}`}>
        <div className="p-6 font-bold text-xl flex items-center gap-2">
          <div className={`w-10 h-10 rounded-xl ${accent.primary} flex items-center justify-center text-white shadow-lg`}>LB</div>
          <span>LifeBase</span>
        </div>
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-hide">
          <button onClick={() => {setCurrentTab('notes'); setSelectedNoteId(null);}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentTab === 'notes' ? accent.lightBg + ' ' + accent.text : textSec + ' hover:' + bgMain}`}><StickyNote size={20}/> <span className="font-medium">{t('navNotes')}</span></button>
          <button onClick={() => {setCurrentTab('trash'); setSelectedNoteId(null);}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${currentTab === 'trash' ? 'bg-red-500/10 text-red-500' : textSec + ' hover:' + bgMain}`}><Archive size={20}/> <span className="font-medium">{t('navTrash')}</span></button>
          {currentTab === 'notes' && (
            <div className="pt-4 border-t border-black/5 dark:border-white/5 mt-4">
              <div className="flex justify-between items-center px-3 mb-2"><span className="text-[10px] font-bold uppercase opacity-40">Labels</span><button onClick={() => setIsLabelManagerOpen(true)}><Settings size={12}/></button></div>
              <button onClick={() => toggleFilter('unlabeled')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeFilters.includes('unlabeled') ? 'bg-black/10 dark:bg-white/10' : textSec + ' hover:' + bgMain}`}><Tag size={14}/> {t('unlabeled')}</button>
              {labels.map(l => <button key={l.id} onClick={() => toggleFilter(l.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${activeFilters.includes(l.id) ? l.color + ' ' + l.textColor + ' font-bold shadow-sm' : textSec + ' hover:' + bgMain}`}><div className={`w-2 h-2 rounded-full ${l.color}`}/> <span className="truncate">{l.name}</span></button>)}
            </div>
          )}
        </nav>
      </aside>

      <div className={`${selectedNoteId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 border-r ${border} bg-transparent h-full`}>
        <div className={`p-4 border-b ${border} flex flex-col gap-3`}>
          <div className="flex gap-3 items-center">
            <div className={`md:hidden w-10 h-10 rounded-xl ${accent.primary} flex items-center justify-center text-white font-bold shrink-0 shadow-md`}>LB</div>
            <div className="relative flex-1">
              <Search size={16} className={`absolute left-3 top-3.5 ${textSec}`}/>
              <input value={search} onChange={e => setSearch(e.target.value)} className={`w-full ${bgInput} rounded-xl pl-10 pr-4 py-3 text-sm outline-none shadow-inner`} placeholder={t('search')}/>
            </div>
            <button onClick={createNewNote} className={`hidden md:flex p-3 rounded-xl ${accent.primary} text-white shadow-lg`}><Plus size={20}/></button>
          </div>
          {currentTab === 'notes' && (
            <div className="flex justify-between items-center px-1">
              <span className={`text-[10px] font-bold uppercase ${textSec} opacity-50`}>Sort</span>
              <select value={sortMode} onChange={e => setSortMode(e.target.value as SortMode)} className={`bg-transparent outline-none text-xs font-bold ${textMain} cursor-pointer`}>
                <option value="updated">{t('sortUpdated')}</option>
                <option value="created">{t('sortCreated')}</option>
                <option value="az">{t('sortAZ')}</option>
              </select>
            </div>
          )}
        </div>
        
        {currentTab === 'notes' && (
          <div className={`md:hidden flex gap-2 overflow-x-auto p-3 border-b ${border} scrollbar-hide shrink-0`}>
            <button onClick={() => setIsLabelManagerOpen(true)} className={`px-3 py-1.5 rounded-full text-xs font-bold bg-black/5 dark:bg-white/5 ${textSec}`}><Settings size={14}/></button>
            <button onClick={() => toggleFilter('unlabeled')} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeFilters.includes('unlabeled') ? 'bg-black/20 dark:bg-white/20' : 'bg-black/5 dark:bg-white/5 opacity-50'}`}>{t('unlabeled')}</button>
            {labels.map(l => (
               <button key={l.id} onClick={() => toggleFilter(l.id)} className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${l.color} ${l.textColor} ${activeFilters.includes(l.id) ? 'ring-2 ring-black/20 scale-105' : 'opacity-60'}`}>{l.name}</button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 pb-24 md:pb-4">
          {filteredNotes.map(n => (
            <NoteCard key={n.id} note={n} label={labels.find(l => l.id === n.labelId)} isSelected={selectedNoteId === n.id} currentTab={currentTab} onClick={setSelectedNoteId} />
          ))}
        </div>

        {!selectedNoteId && currentTab === 'notes' && (
           <button onClick={createNewNote} className={`md:hidden absolute bottom-20 right-6 w-14 h-14 rounded-full ${accent.primary} text-white shadow-2xl flex items-center justify-center z-30 transition-transform active:scale-95`}><Plus size={28}/></button>
        )}
      </div>

      <main className={`${selectedNoteId ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative h-full ${editorWrapperClass}`}>
        {selectedNote ? (
          <div className={`flex-1 max-w-4xl mx-auto w-full flex flex-col gap-4 overflow-y-auto ${editorInnerClass}`}>
            <div className="flex justify-between items-center mb-2 md:mb-4 shrink-0">
              <div className="flex gap-1.5 md:gap-2 items-center">
                <button onClick={() => setSelectedNoteId(null)} className="md:hidden p-2 -ml-2 text-inherit opacity-70 hover:opacity-100"><ChevronLeft size={28}/></button>
                <button onClick={() => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isPinned: !n.isPinned, updatedAt: Date.now()} : n))} className={`p-2 rounded-xl transition-colors ${selectedNote.isPinned ? 'bg-yellow-500 text-white shadow-md' : iconBtnClass}`}><Pin size={20}/></button>
                <button onClick={() => setIsPreview(!isPreview)} className={iconBtnClass}>{isPreview ? <Edit3 size={20}/> : <Eye size={20}/>}</button>
                {!isPreview && currentTab === 'notes' && <label className={`${iconBtnClass} cursor-pointer`}><Camera size={20}/><input type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/></label>}
                <button onClick={handleCopy} className={iconBtnClass}>{copied ? <Check size={20} className="text-green-500" /> : <Copy size={20}/>}</button>
              </div>
              <div className={`flex items-center gap-3 md:gap-4 text-[10px] md:text-xs font-mono ${editorSecTextClass} uppercase tracking-widest`}>
                <div className="hidden sm:flex items-center gap-1.5">
                   {syncStatus === 'syncing' ? <RefreshCw size={12} className="animate-spin"/> : (syncStatus === 'error' ? <CloudOff size={12} className="text-red-500"/> : <Cloud size={12} className="text-green-500"/>)} 
                   {lastSaved}
                </div>
                {currentTab === 'trash' ? (
                  <button onClick={() => { setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isDeleted: false, updatedAt: Date.now()} : n)); setSelectedNoteId(null); }} className="bg-green-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-md">Restore</button>
                ) : (
                  <button onClick={() => { setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, isDeleted: true, updatedAt: Date.now()} : n)); setSelectedNoteId(null); }} className={`p-2 rounded-xl text-red-500 ${isClassic && activeLabel ? 'hover:bg-black/10' : 'hover:bg-red-500/10'}`}><Trash2 size={20}/></button>
                )}
              </div>
            </div>

            {currentTab === 'notes' && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                <button onClick={() => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, labelId: '', updatedAt: Date.now()} : n))} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${!selectedNote.labelId ? 'bg-black/20 dark:bg-white/20' : 'bg-black/5 opacity-40'}`}>{t('unlabeled')}</button>
                {labels.map(l => (
                  <button key={l.id} onClick={() => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, labelId: l.id, updatedAt: Date.now()} : n))} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${l.color} ${l.textColor} ${selectedNote.labelId === l.id ? 'ring-2 ring-black/20 scale-105 shadow-sm' : 'opacity-40 hover:opacity-100'}`}>{l.name}</button>
                ))}
              </div>
            )}

            <input 
              ref={titleRef}
              disabled={currentTab === 'trash'} 
              value={selectedNote.title} 
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); contentRef.current?.focus(); } }}
              onChange={e => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, title: e.target.value, updatedAt: Date.now()} : n))} 
              className={`text-3xl md:text-5xl font-black bg-transparent outline-none placeholder:opacity-30 shrink-0 ${currentTab === 'trash' ? 'opacity-50' : (isClassic && activeLabel ? activeLabel.textColor : textMain)}`} 
              placeholder={t('titlePlaceholder')}
            />
            
            {isPreview || currentTab === 'trash' ? (
              <div className={`flex-1 text-base md:text-lg leading-relaxed space-y-2 overflow-y-auto pb-2 ${editorSecTextClass}`}>{renderMarkdown(selectedNote.content)}</div>
            ) : (
              <textarea 
                ref={contentRef}
                value={selectedNote.content} 
                onKeyDown={(e) => handleSmartEditor(e, selectedNote.content, (val) => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, content: val, updatedAt: Date.now()} : n)))}
                onChange={e => setNotes(prev => prev.map(n => n.id === selectedNoteId ? {...n, content: e.target.value, updatedAt: Date.now()} : n))} 
                className={`flex-1 bg-transparent outline-none text-base md:text-lg resize-none font-mono placeholder:opacity-30 pb-2 ${editorSecTextClass}`} 
                placeholder={t('contentPlaceholder')}
              />
            )}
            <div className={`shrink-0 text-[10px] uppercase font-bold tracking-widest ${editorSecTextClass} opacity-50 pt-2 border-t ${isClassic && activeLabel ? 'border-black/10' : border}`}>
              {wordCount} {t('words')} • {charCount} {t('chars')} • {readTime} {t('min')}
            </div>
          </div>
        ) : (
          <div className={`flex-1 flex flex-col items-center justify-center opacity-10 ${textMain}`}>
            <StickyNote size={120}/><p className="mt-4 font-bold tracking-widest uppercase">Select a note</p>
          </div>
        )}
      </main>

      {!selectedNoteId && (
        <nav className={`md:hidden fixed bottom-0 left-0 right-0 flex justify-around items-center p-3 border-t ${border} ${bgMain} z-40 pb-safe`}>
           <button onClick={() => setCurrentTab('notes')} className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'notes' ? accent.text : textSec}`}><StickyNote size={24}/><span className="text-[10px] font-bold">{t('navNotes')}</span></button>
           <button onClick={() => setCurrentTab('trash')} className={`flex flex-col items-center gap-1 p-2 ${currentTab === 'trash' ? 'text-red-500' : textSec}`}><Archive size={24}/><span className="text-[10px] font-bold">{t('navTrash')}</span></button>
           <button onClick={() => setIsSettingsOpen(true)} className={`flex flex-col items-center gap-1 p-2 ${textSec}`}><Settings size={24}/><span className="text-[10px] font-bold">{t('settings')}</span></button>
        </nav>
      )}

      <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title={t('settings')}>
        <div className="space-y-8">
           <button onClick={() => {setIsSettingsOpen(false); setIsManualOpen(true);}} className={`w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-500/10 text-indigo-500 font-bold border border-indigo-500/20`}><div className="flex items-center gap-3"><BookOpen size={20}/> {t('manual')}</div><Plus size={16}/></button>
           <div><h4 className="text-[10px] font-bold uppercase opacity-40 mb-3 tracking-widest">{t('theme')}</h4><div className="flex gap-2"><Button onClick={() => setMode('light')} variant={mode === 'light' ? 'primary' : 'secondary'} className="flex-1">Light</Button><Button onClick={() => setMode('dark')} variant={mode === 'dark' ? 'primary' : 'secondary'} className="flex-1">Dark</Button></div></div>
           <div><h4 className="text-[10px] font-bold uppercase opacity-40 mb-3 tracking-widest">{t('layout')}</h4><div className="flex gap-2"><Button onClick={() => setDesignMode('minimalist')} variant={designMode === 'minimalist' ? 'primary' : 'secondary'} className="flex-1">Minimal</Button><Button onClick={() => setDesignMode('classic')} variant={designMode === 'classic' ? 'primary' : 'secondary'} className="flex-1">Classic</Button></div></div>
           <div><h4 className="text-[10px] font-bold uppercase opacity-40 mb-3 tracking-widest">{t('language')}</h4><div className="flex gap-2">{['de', 'en', 'tr'].map(l => <Button key={l} onClick={() => setLanguage(l as any)} variant={language === l ? 'primary' : 'secondary'} className="flex-1 uppercase">{l}</Button>)}</div></div>
           <div className="pt-4 border-t border-black/5 dark:border-white/5"><Button onClick={() => supabase.auth.signOut()} variant="danger" className="w-full"><LogOut size={18}/> {t('logout')}</Button></div>
        </div>
      </Modal>

      <Modal isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} title={t('manual')}>
        <div className="space-y-6 text-sm">
          <section><h4 className="font-bold text-indigo-500 mb-2">Shortcuts</h4><ul className="space-y-1 opacity-80"><li><kbd className="bg-black/10 px-1 rounded">Strg</kbd> + <kbd className="bg-black/10 px-1 rounded">N</kbd> : Neu</li><li><kbd className="bg-black/10 px-1 rounded">Entf</kbd> : Papierkorb</li><li><kbd className="bg-black/10 px-1 rounded">Esc</kbd> : Schließen</li></ul></section>
          <section><h4 className="font-bold text-indigo-500 mb-2">Editor</h4><ul className="space-y-2 opacity-80"><li><strong>Listen:</strong> <code>- </code> oder <code>1. </code></li><li><strong>Check:</strong> <code>- [ ] </code></li><li><strong>Einzug:</strong> <kbd>Tab</kbd> / <kbd>Shift+Tab</kbd></li><li><strong>Auto-Pair:</strong> Klammern & "</li></ul></section>
        </div>
      </Modal>
      <LabelManager isOpen={isLabelManagerOpen} onClose={() => setIsLabelManagerOpen(false)} />
    </div>
  );
};

const AuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); setLoading(false); }
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <form onSubmit={handleLogin} className="bg-gray-900 border border-gray-800 p-8 rounded-3xl w-full max-w-sm space-y-4 shadow-2xl">
        <div className="flex flex-col items-center mb-6"><div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(79,70,229,0.3)]"><Lock size={32} color="white"/></div><h1 className="text-3xl font-black tracking-tight text-white">LifeBase</h1></div>
        <input className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-colors" type="email" placeholder="E-Mail" value={email} onChange={e => setEmail(e.target.value)} required />
        <input className="w-full bg-black/50 border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-indigo-500 transition-colors" type="password" placeholder="Passwort" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all mt-2">{loading ? 'Lade...' : 'Secure Login'}</button>
      </form>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);
  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><RefreshCw className="animate-spin text-indigo-500" size={32}/></div>;
  return (
    <ThemeProvider>
      {!session ? <AuthScreen /> : <DataProvider session={session}><MainLayout /></DataProvider>}
    </ThemeProvider>
  );
}