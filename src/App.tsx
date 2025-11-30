import React, { useState, useEffect, useRef, createContext, useContext, type ReactNode } from 'react';
import { 
  StickyNote, List, Plus, Trash2, X, 
  Settings, Menu, GripVertical, Download, Upload, AlertTriangle, 
  Moon, Sun, Filter, Pencil, Tag, Copy, Clipboard, Check, Search
} from 'lucide-react';

// ==========================================
// 1. TYPES & LOGIC & STORE
// ==========================================

type ThemeMode = 'dark' | 'light';
type AccentKey = 'indigo' | 'rose' | 'emerald' | 'amber' | 'cyan' | 'violet';
type Language = 'de' | 'en' | 'tr';

interface Label { id: string; name: string; color: string; textColor: string; }
interface Note { id: number; title: string; content: string; labelId: string; date: string; }
interface TierItem { id: number; name: string; tier: string; }
interface TierList { id: number; title: string; items: TierItem[]; }
interface AccentProfile { name: string; primary: string; hover: string; text: string; ring: string; lightBg: string; border: string; gradient: string; }

interface ThemeContextType {
  bgMain: string; bgCard: string; bgInput: string; textMain: string; textSec: string; border: string; modalOverlay: string;
  accent: AccentProfile; mode: ThemeMode; setMode: (m: ThemeMode) => void;
  accentKey: AccentKey; setAccentKey: (k: AccentKey) => void;
  language: Language; setLanguage: (l: Language) => void; t: (k: string) => string;
}

interface DataContextType {
  notes: Note[]; setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  tierlists: TierList[]; setTierlists: React.Dispatch<React.SetStateAction<TierList[]>>;
  labels: Label[]; setLabels: React.Dispatch<React.SetStateAction<Label[]>>;
  activeFilters: string[]; setActiveFilters: React.Dispatch<React.SetStateAction<string[]>>;
  toggleFilter: (id: string) => void;
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
  de: { appTitle: "LifeBase", navNotes: "Notizen", navTiers: "Rankings", myNotes: "Meine Notizen", new: "Neu", noNotes: "Keine Notizen.", editNote: "Bearbeiten", newNote: "Neue Notiz", titlePlaceholder: "Titel...", contentPlaceholder: "Inhalt...", selectLabel: "Label", edit: "Ändern", noLabel: "Kein Label", save: "Speichern", create: "Erstellen", manageLabels: "Labels", newLabel: "Neu", labelNamePlaceholder: "Name", existingLabels: "Vorhandene", deleteLabelConfirm: "Löschen?", deleteLabelError: "Min. 1 Label!", myTierLists: "Rankings", noTierLists: "Keine Listen.", itemsCount: "Einträge", newTierList: "Neue Liste", tierListNamePlaceholder: "Name", tierItemPlaceholder: "Item", addItem: "Dazu", settings: "Einstellungen", appearance: "Design", light: "Hell", dark: "Dunkel", language: "Sprache", quickSync: "Sync", copyData: "Kopieren", copied: "Kopiert", pasteFromClipboard: "Einfügen", pastePlaceholder: "Code...", import: "Import", syncInfo: "Code kopieren & am anderen Gerät einfügen.", backup: "Backup", saveToFile: "Speichern", loadFromFile: "Laden", dataInfo: "Lokal gespeichert.", overwriteConfirm: "Überschreiben?", importSuccess: "Erfolg!", importError: "Fehler.", autoImportError: "Manuell einfügen:", mergeSuccess: "Neu importiert:", unlabeled: "Labellos", dashboard: "Übersicht", labels: "Labels" },
  en: { appTitle: "LifeBase", navNotes: "Notes", navTiers: "Rankings", myNotes: "My Notes", new: "New", noNotes: "No notes.", editNote: "Edit", newNote: "New Note", titlePlaceholder: "Title...", contentPlaceholder: "Content...", selectLabel: "Label", edit: "Edit", noLabel: "None", save: "Save", create: "Create", manageLabels: "Labels", newLabel: "New", labelNamePlaceholder: "Name", existingLabels: "Existing", deleteLabelConfirm: "Delete?", deleteLabelError: "Min 1 label!", myTierLists: "Rankings", noTierLists: "No lists.", itemsCount: "items", newTierList: "New List", tierListNamePlaceholder: "Name", tierItemPlaceholder: "Item", addItem: "Add", settings: "Settings", appearance: "Design", light: "Light", dark: "Dark", language: "Language", quickSync: "Sync", copyData: "Copy", copied: "Copied", pasteFromClipboard: "Paste", pastePlaceholder: "Code...", import: "Import", syncInfo: "Copy code and paste on other device.", backup: "Backup", saveToFile: "Save", loadFromFile: "Load", dataInfo: "Stored locally.", overwriteConfirm: "Overwrite?", importSuccess: "Success!", importError: "Error.", autoImportError: "Paste manually:", mergeSuccess: "Imported:", unlabeled: "Unlabeled", dashboard: "Dashboard", labels: "Labels" },
  tr: { appTitle: "LifeBase", navNotes: "Notlar", navTiers: "Sıralama", myNotes: "Notlarım", new: "Yeni", noNotes: "Not yok.", editNote: "Düzenle", newNote: "Yeni Not", titlePlaceholder: "Başlık...", contentPlaceholder: "İçerik...", selectLabel: "Etiket", edit: "Düzenle", noLabel: "Yok", save: "Kaydet", create: "Oluştur", manageLabels: "Etiketler", newLabel: "Yeni", labelNamePlaceholder: "İsim", existingLabels: "Mevcut", deleteLabelConfirm: "Sil?", deleteLabelError: "En az 1!", myTierLists: "Listeler", noTierLists: "Liste yok.", itemsCount: "öğe", newTierList: "Yeni Liste", tierListNamePlaceholder: "İsim", tierItemPlaceholder: "İsim", addItem: "Ekle", settings: "Ayarlar", appearance: "Görünüm", light: "Açık", dark: "Koyu", language: "Dil", quickSync: "Senk", copyData: "Kopyala", copied: "Kopyalandı", pasteFromClipboard: "Yapıştır", pastePlaceholder: "Kod...", import: "İçe Aktar", syncInfo: "Kopyala ve diğer cihazda yapıştır.", backup: "Yedek", saveToFile: "Kaydet", loadFromFile: "Yükle", dataInfo: "Yerel kayıt.", overwriteConfirm: "Üzerine yaz?", importSuccess: "Başarılı!", importError: "Hata.", autoImportError: "Manuel yapıştır:", mergeSuccess: "Eklendi:", unlabeled: "Etiketsiz", dashboard: "Panel", labels: "Etiketler" }
};

const themes: Record<ThemeMode, Omit<ThemeContextType, 'accent' | 'mode' | 'setMode' | 'accentKey' | 'setAccentKey' | 'language' | 'setLanguage' | 't'>> = {
  dark: { bgMain: 'bg-black', bgCard: 'bg-gray-900', bgInput: 'bg-gray-900', textMain: 'text-gray-100', textSec: 'text-gray-400', border: 'border-gray-800', modalOverlay: 'bg-black/90' },
  light: { bgMain: 'bg-gray-50', bgCard: 'bg-white', bgInput: 'bg-gray-100', textMain: 'text-gray-900', textSec: 'text-gray-500', border: 'border-gray-200', modalOverlay: 'bg-gray-900/20' }
};

const accents: Record<AccentKey, AccentProfile> = {
  indigo: { name: 'Zen Indigo', primary: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-500', ring: 'focus:ring-indigo-500', lightBg: 'bg-indigo-500/20', border: 'border-indigo-500', gradient: 'from-indigo-500 to-purple-600' },
  rose: { name: 'Rose Red', primary: 'bg-rose-600', hover: 'hover:bg-rose-700', text: 'text-rose-500', ring: 'focus:ring-rose-500', lightBg: 'bg-rose-500/20', border: 'border-rose-500', gradient: 'from-rose-500 to-pink-600' },
  emerald: { name: 'Emerald', primary: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-500', ring: 'focus:ring-emerald-500', lightBg: 'bg-emerald-500/20', border: 'border-emerald-500', gradient: 'from-emerald-500 to-teal-600' },
  amber: { name: 'Amber', primary: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-500', ring: 'focus:ring-amber-500', lightBg: 'bg-amber-500/20', border: 'border-amber-500', gradient: 'from-amber-500 to-orange-600' },
  cyan: { name: 'Cyan Future', primary: 'bg-cyan-600', hover: 'hover:bg-cyan-700', text: 'text-cyan-500', ring: 'focus:ring-cyan-500', lightBg: 'bg-cyan-500/20', border: 'border-cyan-500', gradient: 'from-cyan-500 to-blue-600' },
  violet: { name: 'Violet', primary: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-500', ring: 'focus:ring-violet-500', lightBg: 'bg-violet-500/20', border: 'border-violet-500', gradient: 'from-violet-500 to-fuchsia-600' }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const DataContext = createContext<DataContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem('lb_theme_mode') as ThemeMode) || 'dark');
  const [accentKey, setAccentKey] = useState<AccentKey>(() => (localStorage.getItem('lb_theme_accent') as AccentKey) || 'indigo');
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem('lb_language') as Language) || 'en');

  useEffect(() => {
    localStorage.setItem('lb_theme_mode', mode);
    localStorage.setItem('lb_theme_accent', accentKey);
    localStorage.setItem('lb_language', language);
  }, [mode, accentKey, language]);

  return <ThemeContext.Provider value={{ ...themes[mode], accent: accents[accentKey], mode, setMode, accentKey, setAccentKey, language, setLanguage, t: (k) => dictionary[language][k] || k }}>{children}</ThemeContext.Provider>;
};

const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [labels, setLabels] = useState<Label[]>(() => JSON.parse(localStorage.getItem('lb_labels') || JSON.stringify(defaultLabels)));
  const [notes, setNotes] = useState<Note[]>(() => JSON.parse(localStorage.getItem('lb_notes') || '[]'));
  const [tierlists, setTierlists] = useState<TierList[]>(() => JSON.parse(localStorage.getItem('lb_tierlists') || '[]'));
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => localStorage.setItem('lb_notes', JSON.stringify(notes)), [notes]);
  useEffect(() => localStorage.setItem('lb_labels', JSON.stringify(labels)), [labels]);
  useEffect(() => localStorage.setItem('lb_tierlists', JSON.stringify(tierlists)), [tierlists]);

  const toggleFilter = (id: string) => setActiveFilters(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  return <DataContext.Provider value={{ notes, setNotes, tierlists, setTierlists, labels, setLabels, activeFilters, setActiveFilters, toggleFilter }}>{children}</DataContext.Provider>;
};

const useTheme = () => { const c = useContext(ThemeContext); if (!c) throw new Error('useTheme missing'); return c; };
const useData = () => { const c = useContext(DataContext); if (!c) throw new Error('useData missing'); return c; };

// ==========================================
// 2. SHARED COMPONENTS
// ==========================================

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const { bgCard, textMain, textSec, border, accent } = useTheme();
  const variants = { primary: `${accent.primary} text-white shadow-lg`, secondary: `${bgCard} ${textMain} border ${border}`, success: `bg-green-600 text-white shadow-lg`, danger: "bg-red-500/10 text-red-400", ghost: `bg-transparent ${textSec} hover:${textMain}` };
  return <button className={`px-4 py-2 rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 ${variants[variant]} ${className} disabled:opacity-50 disabled:cursor-not-allowed`} {...props}>{children}</button>;
};

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const { bgInput, border, textMain, textSec, accent } = useTheme();
  return <input className={`w-full ${bgInput} border ${border} rounded-xl px-4 py-3 ${textMain} placeholder:${textSec} focus:outline-none focus:ring-2 ${accent.ring} focus:border-transparent transition-all ${props.className}`} {...props} />;
};

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: ReactNode; customTheme?: { bg: string; text: string } }> = ({ isOpen, onClose, title, children, customTheme }) => {
  const { bgCard, border, textMain, textSec, modalOverlay } = useTheme();
  if (!isOpen) return null;
  const theme = customTheme || { bg: bgCard, text: textMain };
  const borderClass = customTheme ? 'border-transparent' : border;
  const closeBtnClass = customTheme ? `hover:bg-black/10 ${customTheme.text}` : `${textSec} hover:${textMain}`;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${modalOverlay} backdrop-blur-sm animate-in fade-in duration-200`}>
      <div className={`${theme.bg} w-full max-w-md max-h-[85vh] flex flex-col rounded-2xl border ${borderClass} shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 transition-colors duration-300`}>
        <div className={`flex-shrink-0 flex items-center justify-between p-4 border-b ${customTheme ? 'border-black/5' : border}`}><h3 className={`text-lg font-bold ${theme.text}`}>{title}</h3><button onClick={onClose} className={closeBtnClass}><X size={20} /></button></div>
        <div className={`p-4 overflow-y-auto ${theme.text}`}>{children}</div>
      </div>
    </div>
  );
};

const NoteCard: React.FC<{ note: Note; label: Label; onClick: () => void; onDelete: (e: React.MouseEvent) => void }> = ({ note, label, onClick, onDelete }) => (
  <div onClick={onClick} className={`${label.color} p-4 rounded-xl shadow-sm flex flex-col min-h-[160px] relative group transition-transform active:scale-95 cursor-pointer hover:scale-[1.02] hover:shadow-md`}>
    {label.id !== 'unlabeled' && <div className="flex justify-between items-start mb-2"><span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-white/30 ${label.textColor}`}>{label.name}</span></div>}
    <h3 className={`font-bold text-lg mb-1 ${label.textColor} line-clamp-1`}>{note.title}</h3>
    <p className={`text-sm ${label.textColor} opacity-80 line-clamp-4 flex-grow whitespace-pre-wrap`}>{note.content}</p>
    <div className="flex justify-between items-center mt-3"><span className={`text-[10px] ${label.textColor} opacity-60`}>{note.date}</span><button onClick={onDelete} className={`p-2 rounded-full hover:bg-black/10 ${label.textColor}`}><Trash2 size={16} /></button></div>
  </div>
);

const LabelManager: React.FC<{ isOpen: boolean; onClose: () => void; labels: Label[]; onAdd: (n: string, c: any) => void; onUpdate: (id: string, n: string, c: any) => void; onDelete: (id: string) => void }> = ({ isOpen, onClose, labels, onAdd, onUpdate, onDelete }) => {
  const { bgInput, border, textSec, textMain, bgCard, accent, t } = useTheme();
  const [name, setName] = useState('');
  const [color, setColor] = useState(availableColors[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const startEdit = (l: Label) => { setEditingId(l.id); setName(l.name); setColor(availableColors.find(c => c.bg === l.color) || availableColors[0]); };
  const handleSave = () => { if (!name.trim()) return; if (editingId) { onUpdate(editingId, name, color); setEditingId(null); } else { onAdd(name, color); } setName(''); };
  const handleDelete = (id: string) => { if (labels.length <= 1) return alert(t('deleteLabelError')); if (!confirm(t('deleteLabelConfirm'))) return; onDelete(id); };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('manageLabels')}>
      <div className="space-y-6">
        <div className={`p-4 rounded-xl border ${border} ${bgInput}`}><div className="flex gap-2 mb-3"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('labelNamePlaceholder')} className="text-sm py-2" /><Button onClick={handleSave} disabled={!name.trim()} className="py-2 px-4">{editingId ? 'Ok' : <Plus size={18} />}</Button>{editingId && <Button onClick={() => { setEditingId(null); setName(''); }} variant="ghost" className="py-2 px-3"><X size={18} /></Button>}</div><div className="flex flex-wrap gap-2">{availableColors.map(c => <button key={c.name} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${c.bg} border-2 transition-transform ${color.bg === c.bg ? 'border-gray-500 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`} />)}</div></div>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">{labels.map(l => <div key={l.id} className={`flex items-center justify-between p-3 rounded-lg border ${border} ${bgCard}`}><div className="flex items-center gap-3"><div className={`w-4 h-4 rounded-full ${l.color}`}></div><span className={`font-medium ${textMain}`}>{l.name}</span></div><div className="flex gap-1"><button onClick={() => startEdit(l)} className={`${textSec} hover:${accent.text} p-2`}><Pencil size={16}/></button><button onClick={() => handleDelete(l.id)} className={`${textSec} hover:text-red-400 p-2`}><Trash2 size={16}/></button></div></div>)}</div>
      </div>
    </Modal>
  );
};

const FlagDE = () => <svg viewBox="0 0 5 3" className="w-6 h-6 rounded overflow-hidden shadow-sm"><rect width="5" height="3" y="0" fill="#000"/><rect width="5" height="2" y="1" fill="#D00"/><rect width="5" height="1" y="2" fill="#FFCE00"/></svg>;
const FlagEN = () => <svg viewBox="0 0 60 30" className="w-6 h-6 rounded overflow-hidden shadow-sm"><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/><path d="M30,0 L30,30 M0,15 L60,15" stroke="#fff" strokeWidth="10"/><path d="M30,0 L30,30 M0,15 L60,15" stroke="#C8102E" strokeWidth="6"/></svg>;
const FlagTR = () => <svg viewBox="0 0 1200 800" className="w-6 h-6 rounded overflow-hidden shadow-sm"><rect width="1200" height="800" fill="#E30A17"/><circle cx="425" cy="400" r="200" fill="#fff"/><circle cx="475" cy="400" r="160" fill="#E30A17"/><polygon points="583.334,400 752.928,455.519 647.712,311.803 647.712,488.197 752.928,344.481" fill="#fff"/></svg>;

const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { mode, setMode, accentKey, setAccentKey, bgInput, textMain, textSec, border, language, setLanguage, t, accent } = useTheme();
  const { notes, tierlists, labels, setNotes, setTierlists, setLabels } = useData();
  const [copySuccess, setCopySuccess] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getExportData = () => JSON.stringify({ notes, tierlists, labels, exportDate: new Date().toISOString(), version: '1.2' });
  const handleMerge = (text: string) => {
    try {
      const d = JSON.parse(text);
      const newNotes = d.notes.filter((n: Note) => !notes.some(cn => cn.id === n.id));
      setNotes([...notes, ...newNotes]);
      setTierlists([...tierlists, ...(d.tierlists.filter((t: any) => !tierlists.some(ct => ct.id === t.id)))]);
      setLabels([...labels, ...(d.labels.filter((l: any) => !labels.some(cl => cl.id === l.id)))]);
      alert(`${newNotes.length} ${t('mergeSuccess')}`); window.location.reload();
    } catch { alert(t('importError')); }
  };
  const handlePasteImport = () => { try { handleMerge(importText); } catch { alert(t('importError')); } };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('settings')}>
      <div className="space-y-8">
         <div className="space-y-3"><h4 className={`text-xs font-bold ${textSec} uppercase tracking-wider`}>{t('appearance')}</h4><div className={`${bgInput} p-1 rounded-xl flex border ${border}`}><button onClick={() => setMode('light')} className={`flex-1 py-2 rounded-lg flex items-center gap-2 justify-center text-sm ${mode === 'light' ? 'bg-white text-black' : 'text-gray-500'}`}><Sun size={16}/>{t('light')}</button><button onClick={() => setMode('dark')} className={`flex-1 py-2 rounded-lg flex items-center gap-2 justify-center text-sm ${mode === 'dark' ? 'bg-gray-700 text-white' : 'text-gray-400'}`}><Moon size={16}/>{t('dark')}</button></div></div>
         <div className="space-y-3"><h4 className={`text-xs font-bold ${textSec}`}>{t('language')}</h4><div className="flex gap-2">{['de', 'en', 'tr'].map(l => <button key={l} onClick={() => setLanguage(l as any)} className={`flex-1 py-3 rounded-xl border-2 flex justify-center ${language === l ? border : 'border-transparent'}`}>{l === 'de' ? <FlagDE/> : l === 'en' ? <FlagEN/> : <FlagTR/>}</button>)}</div></div>
         <div className="space-y-3"><h4 className={`text-xs font-bold ${textSec}`}>{t('quickSync')}</h4><div className="flex gap-2"><Button onClick={() => { navigator.clipboard.writeText(getExportData()).then(() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }) }} className="flex-1" variant="secondary">{copySuccess ? <Check size={18}/> : <Copy size={18}/>} {copySuccess ? t('copied') : t('copyData')}</Button><Button onClick={async () => { try { handleMerge(await navigator.clipboard.readText()); } catch { setShowImport(true); }}} className="flex-1" variant="secondary"><Clipboard size={18}/> {t('pasteFromClipboard')}</Button></div>{showImport && <div className={`p-3 rounded-xl border ${border} ${bgInput}`}><textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder={t('pastePlaceholder')} className={`w-full bg-transparent border-0 text-xs ${textMain} h-20 resize-none outline-none mb-2`} /><Button onClick={handlePasteImport} className="w-full h-8 text-xs">{t('import')}</Button></div>}<p className={`text-[10px] ${textSec}`}>{t('syncInfo')}</p></div>
         <div className="space-y-3"><h4 className={`text-xs font-bold ${textSec}`}>{t('backup')}</h4><div className="space-y-2"><Button onClick={() => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([getExportData()], {type: 'application/json'})); a.download = 'backup.json'; a.click(); }} variant="secondary" className="w-full justify-between"><span>{t('saveToFile')}</span><Download size={18}/></Button><input type="file" ref={fileInputRef} onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => handleMerge(ev.target?.result as string); r.readAsText(f); }}} className="hidden" /><Button onClick={() => fileInputRef.current?.click()} variant="secondary" className="w-full justify-between"><span>{t('loadFromFile')}</span><Upload size={18}/></Button></div></div>
         <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3 items-start"><AlertTriangle className="text-yellow-500 shrink-0" size={20} /><p className="text-xs text-yellow-600 dark:text-yellow-200/80">{t('dataInfo')}</p></div>
      </div>
    </Modal>
  );
};

// ==========================================
// 3. LAYOUTS
// ==========================================

const MobileLayout = () => {
  const { bgMain, border, textMain, textSec, accent, t, bgInput, bgCard } = useTheme();
  const { notes, setNotes, labels, setLabels, activeFilters, toggleFilter, tierlists, setTierlists } = useData();
  const [currentTab, setCurrentTab] = useState<'notes' | 'tierlist'>('notes');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Note States
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Partial<Note>>({});
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);

  // Tier States
  const [isTierListModalOpen, setIsTierListModalOpen] = useState(false);
  const [isTierItemModalOpen, setIsTierItemModalOpen] = useState(false);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [newTierListTitle, setNewTierListTitle] = useState('');
  const [newTierItemName, setNewTierItemName] = useState('');
  const [targetTier, setTargetTier] = useState<string | null>(null);

  const [draggedItem, setDraggedItem] = useState<TierItem | null>(null);
  const [dragPos, setDragPos] = useState<{x:number, y:number}|null>(null);
  const [touchTarget, setTouchTarget] = useState<string|null>(null);

  const filteredNotes = activeFilters.length === 0 ? notes : notes.filter(n => activeFilters.includes(n.labelId || 'unlabeled'));
  const activeLabel = labels.find(l => l.id === currentNote.labelId) || { color: 'bg-gray-700', textColor: 'text-gray-200' };
  const activeList = tierlists.find(l => l.id === activeListId);
  const tiers = [{ id: 'S', color: 'bg-red-500' }, { id: 'A', color: 'bg-orange-500' }, { id: 'B', color: 'bg-yellow-500' }, { id: 'C', color: 'bg-green-500' }, { id: 'D', color: 'bg-blue-500' }];

  const saveNote = () => {
      if(!currentNote.title && !currentNote.content) return;
      const date = new Date().toLocaleDateString();
      if(currentNote.id) setNotes(prev => prev.map(n => n.id === currentNote.id ? { ...n, ...currentNote, date } as Note : n));
      else setNotes([{ id: Date.now(), ...currentNote, labelId: currentNote.labelId || '', date } as Note, ...notes]);
      setIsNoteModalOpen(false);
  };

  const handleUpdateLabel = (id: string, name: string, color: typeof availableColors[0]) => {
    setLabels(labels.map(l => l.id === id ? { ...l, name, color: color.bg, textColor: color.text } : l));
  };

  const handleCreateLabel = (name: string, color: typeof availableColors[0]) => {
    const newLabel = { id: Date.now().toString(), name, color: color.bg, textColor: color.text };
    setLabels([...labels, newLabel]);
  };

  const handleDeleteLabel = (id: string) => {
    if (!confirm(t('deleteLabelConfirm'))) return;
    const newLabels = labels.filter(l => l.id !== id);
    setLabels(newLabels);
    setNotes(notes.map(n => n.labelId === id ? { ...n, labelId: '' } : n));
  };

  // Tier List Logic
  const createTierList = () => {
    if(!newTierListTitle.trim()) return;
    setTierlists([{ id: Date.now(), title: newTierListTitle, items: [] }, ...tierlists]);
    setNewTierListTitle(''); setIsTierListModalOpen(false);
  };

  const addTierItem = () => {
      if(!newTierItemName.trim() || !targetTier) return;
      setTierlists(prev => prev.map(l => l.id === activeListId ? { ...l, items: [...l.items, { id: Date.now(), name: newTierItemName, tier: targetTier }] } : l));
      setNewTierItemName(''); setTargetTier(null); setIsTierItemModalOpen(false);
  };

  const handleDrop = (listId: number, tierId: string) => { if(!draggedItem) return; setTierlists(prev => prev.map(l => l.id === listId ? { ...l, items: l.items.map(i => i.id === draggedItem.id ? { ...i, tier: tierId } : i) } : l)); setDraggedItem(null); setDragPos(null); };
  const handleTouchMove = (e: React.TouchEvent) => { setDragPos({ x: e.touches[0].clientX, y: e.touches[0].clientY }); const el = document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY); setTouchTarget(el?.closest('[data-tier]')?.getAttribute('data-tier') || null); };

  if (activeListId !== null && activeList) {
      return (
          <div className={`min-h-screen ${bgMain} ${textMain} pb-safe font-sans flex flex-col`} onTouchMove={draggedItem ? handleTouchMove : undefined} onTouchEnd={() => { if(touchTarget) handleDrop(parseInt(touchTarget.split('-')[0]), touchTarget.split('-')[1]); setDraggedItem(null); }}>
               <header className={`${bgMain}/90 backdrop-blur-md sticky top-0 z-10 border-b ${border} px-4 py-3 flex justify-between items-center`}>
                 <div className="flex items-center gap-3"><button onClick={() => setActiveListId(null)} className={`${textSec} hover:${textMain}`}><Menu size={24}/></button><h1 className={`text-lg font-bold tracking-tight ${textMain}`}>{activeList.title}</h1></div>
               </header>
               <div className="p-4 space-y-2 overflow-y-auto">
                   {tiers.map(tier => (
                       <div key={tier.id} data-tier={`${activeList.id}-${tier.id}`} className={`flex min-h-[80px] ${bgCard} rounded-lg overflow-hidden border ${border} ${touchTarget === `${activeList.id}-${tier.id}` ? `ring-2 ring-${accent.name.split(' ')[0].toLowerCase()}-500` : ''}`}>
                           <div className={`${tier.color} w-12 flex flex-col items-center justify-center flex-shrink-0 gap-1`}><span className="font-black text-black/50">{tier.id}</span><button onClick={() => { setTargetTier(tier.id); setIsTierItemModalOpen(true); }} className="bg-black/20 rounded text-white p-0.5"><Plus size={14}/></button></div>
                           <div className="flex-1 p-2 flex flex-wrap gap-2 content-start">
                               {activeList.items.filter(i => i.tier === tier.id).map(item => (
                                   <div key={item.id} onTouchStart={(e) => { setDraggedItem(item); setDragPos({x: e.touches[0].clientX, y: e.touches[0].clientY}) }} className={`${bgInput} px-2 py-1 rounded text-sm flex items-center gap-1 border ${border} touch-none ${draggedItem?.id === item.id ? 'opacity-30' : ''}`}><span>{item.name}</span><button onClick={() => setTierlists(prev => prev.map(l => l.id === activeListId ? { ...l, items: l.items.filter(i => i.id !== item.id) } : l))} className="text-red-400"><X size={12}/></button></div>
                               ))}
                           </div>
                       </div>
                   ))}
               </div>
               <Modal isOpen={isTierItemModalOpen} onClose={() => setIsTierItemModalOpen(false)} title={t('addItem')}>
                   <div className="space-y-4"><Input value={newTierItemName} onChange={e => setNewTierItemName(e.target.value)} placeholder={t('tierItemPlaceholder')} autoFocus /><Button onClick={addTierItem} className="w-full">{t('addItem')}</Button></div>
               </Modal>
               {draggedItem && dragPos && <div style={{ position: 'fixed', left: dragPos.x, top: dragPos.y, transform: 'translate(-50%, -150%)', pointerEvents: 'none', zIndex: 100 }} className={`${bgCard} border ${border} px-3 py-2 rounded-lg shadow-xl opacity-90`}><span className={textMain}>{draggedItem.name}</span></div>}
          </div>
      )
  }

  return (
    <div className={`min-h-screen ${bgMain} ${textMain} pb-safe font-sans flex flex-col`}>
       <header className={`${bgMain}/90 backdrop-blur-md sticky top-0 z-10 border-b ${border} px-4 py-3 flex justify-between items-center`}>
         <div className="flex items-center gap-3"><div className={`w-8 h-8 bg-gradient-to-br ${accent.gradient} rounded-lg flex items-center justify-center font-bold text-white shadow-lg`}>LB</div><h1 className={`text-lg font-bold tracking-tight ${textMain}`}>{t('appTitle')}</h1></div>
         <button onClick={() => setIsSettingsOpen(true)} className={`${textSec} hover:${textMain}`}><Settings size={24} /></button>
       </header>

       <main className="flex-1 p-4 overflow-y-auto pb-24">
         {currentTab === 'notes' ? (
             <div className="space-y-4">
                 <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 items-center">
                     <button onClick={() => setIsLabelManagerOpen(true)} className={`h-9 w-9 flex-shrink-0 flex items-center justify-center rounded-lg border ${border} ${bgCard}`}><Settings size={16}/></button>
                     <button onClick={() => toggleFilter('unlabeled')} className={`h-9 px-3 rounded-lg border flex items-center gap-1 whitespace-nowrap ${activeFilters.includes('unlabeled') ? bgCard : 'border-transparent'}`}><Tag size={14}/> {t('unlabeled')}</button>
                     {labels.map(l => <button key={l.id} onClick={() => toggleFilter(l.id)} className={`h-9 px-3 rounded-lg border whitespace-nowrap ${activeFilters.includes(l.id) ? l.color + ' ' + l.textColor : 'border-transparent'}`}>{l.name}</button>)}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    {filteredNotes.map(n => <NoteCard key={n.id} note={n} label={labels.find(l => l.id === n.labelId) || { id: 'u', name: t('unlabeled'), color: 'bg-gray-700', textColor: 'text-gray-200'}} onClick={() => { setCurrentNote(n); setIsNoteModalOpen(true); }} onDelete={(e) => { e.stopPropagation(); setNotes(prev => prev.filter(x => x.id !== n.id)); }} />)}
                 </div>
                 <button onClick={() => { setCurrentNote({}); setIsNoteModalOpen(true); }} className={`fixed bottom-24 right-6 w-14 h-14 rounded-full ${accent.primary} text-white shadow-lg flex items-center justify-center`}><Plus size={28}/></button>
             </div>
         ) : (
             <div className="space-y-4">
                <Button onClick={() => setIsTierListModalOpen(true)} className="w-full"><Plus size={18}/> {t('newTierList')}</Button>
                {tierlists.map(t => (
                    <div key={t.id} onClick={() => setActiveListId(t.id)} className={`${bgCard} p-4 rounded-xl border ${border} flex justify-between items-center`}>
                        <span className="font-bold">{t.title}</span>
                        <button onClick={(e) => { e.stopPropagation(); setTierlists(prev => prev.filter(l => l.id !== t.id)); }} className="text-red-400"><Trash2 size={18}/></button>
                    </div>
                ))}
             </div>
         )}
       </main>

       <nav className={`fixed bottom-0 left-0 right-0 ${bgMain} border-t ${border} pb-safe flex justify-around items-center`}>
          <button onClick={() => setCurrentTab('notes')} className={`p-4 flex flex-col items-center gap-1 ${currentTab === 'notes' ? accent.text : textSec}`}><StickyNote size={24} /><span className="text-[10px]">{t('navNotes')}</span></button>
          <button onClick={() => setCurrentTab('tierlist')} className={`p-4 flex flex-col items-center gap-1 ${currentTab === 'tierlist' ? accent.text : textSec}`}><List size={24} /><span className="text-[10px]">{t('navTiers')}</span></button>
       </nav>

       <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
       
       <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title={currentNote.id ? t('editNote') : t('newNote')} customTheme={{ bg: activeLabel.color as string, text: activeLabel.textColor as string }}>
          <div className="space-y-4">
              <input value={currentNote.title || ''} onChange={e => setCurrentNote({...currentNote, title: e.target.value})} placeholder={t('titlePlaceholder')} className="w-full bg-white/20 border-0 rounded-lg p-3 font-bold placeholder:text-black/50 outline-none text-lg" />
              <textarea value={currentNote.content || ''} onChange={e => setCurrentNote({...currentNote, content: e.target.value})} placeholder={t('contentPlaceholder')} className="w-full bg-white/20 border-0 rounded-lg p-3 h-64 resize-none outline-none placeholder:text-black/50" />
              <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setCurrentNote({...currentNote, labelId: ''})} className={`px-3 py-1 rounded-full border ${currentNote.labelId === '' ? 'bg-white/40' : 'border-transparent'}`}>{t('noLabel')}</button>
                  {labels.map(l => <button key={l.id} onClick={() => setCurrentNote({...currentNote, labelId: l.id})} className={`px-3 py-1 rounded-full border ${l.color} ${l.textColor} ${currentNote.labelId === l.id ? 'border-black/20 shadow' : 'border-transparent'}`}>{l.name}</button>)}
              </div>
              <Button onClick={saveNote} className="w-full bg-white/40 border-0 text-black">{t('save')}</Button>
          </div>
       </Modal>
       <LabelManager isOpen={isLabelManagerOpen} onClose={() => setIsLabelManagerOpen(false)} labels={labels} onAdd={handleCreateLabel} onUpdate={handleUpdateLabel} onDelete={handleDeleteLabel} />
       <Modal isOpen={isTierListModalOpen} onClose={() => setIsTierListModalOpen(false)} title={t('newTierList')}><div className="space-y-4"><Input value={newTierListTitle} onChange={e => setNewTierListTitle(e.target.value)} placeholder={t('tierListNamePlaceholder')} autoFocus /><Button onClick={createTierList} className="w-full">{t('create')}</Button></div></Modal>
    </div>
  );
}

// ==========================================
// 5. DESKTOP LAYOUT
// ==========================================

const DesktopLayout = () => {
  const { bgMain, bgCard, border, textMain, textSec, accent, t, bgInput } = useTheme();
  const { notes, setNotes, labels, setLabels, activeFilters, toggleFilter, tierlists, setTierlists } = useData();
  
  const [currentTab, setCurrentTab] = useState<'notes' | 'tiers'>('notes');
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [activeListId, setActiveListId] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLabelManagerOpen, setIsLabelManagerOpen] = useState(false);
  const [search, setSearch] = useState('');

  // Tier States
  const [isTierListModalOpen, setIsTierListModalOpen] = useState(false);
  const [newTierListTitle, setNewTierListTitle] = useState('');
  const [addingToTier, setAddingToTier] = useState<string | null>(null);
  const [newTierItemName, setNewTierItemName] = useState('');

  // Derived State
  const selectedNote = notes.find(n => n.id === selectedNoteId);
  const activeList = tierlists.find(l => l.id === activeListId);
  const filteredNotes = notes.filter(n => 
    (activeFilters.length === 0 || activeFilters.includes(n.labelId || 'unlabeled')) &&
    (n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()))
  );

  const handleUpdateNote = (id: number, updates: Partial<Note>) => {
      setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
  };

  const createNote = () => {
      const newNote = { id: Date.now(), title: '', content: '', labelId: '', date: new Date().toLocaleDateString() };
      setNotes([newNote, ...notes]);
      setSelectedNoteId(newNote.id);
  };

  // Label Logic
  const handleUpdateLabel = (id: string, name: string, color: typeof availableColors[0]) => {
    setLabels(labels.map(l => l.id === id ? { ...l, name, color: color.bg, textColor: color.text } : l));
  };

  const handleCreateLabel = (name: string, color: typeof availableColors[0]) => {
    const newLabel = { id: Date.now().toString(), name, color: color.bg, textColor: color.text };
    setLabels([...labels, newLabel]);
  };

  const handleDeleteLabel = (id: string) => {
    if (!confirm(t('deleteLabelConfirm'))) return;
    const newLabels = labels.filter(l => l.id !== id);
    setLabels(newLabels);
    setNotes(notes.map(n => n.labelId === id ? { ...n, labelId: '' } : n));
  };

  // Tier Logic
  const tiers = [{ id: 'S', color: 'bg-red-500' }, { id: 'A', color: 'bg-orange-500' }, { id: 'B', color: 'bg-yellow-500' }, { id: 'C', color: 'bg-green-500' }, { id: 'D', color: 'bg-blue-500' }];
  const createTierList = () => {
      if(!newTierListTitle.trim()) return;
      const newList = { id: Date.now(), title: newTierListTitle, items: [] };
      setTierlists([newList, ...tierlists]);
      setActiveListId(newList.id);
      setNewTierListTitle(''); setIsTierListModalOpen(false);
  };
  const addTierItem = () => {
      if(!newTierItemName.trim() || !addingToTier) return;
      setTierlists(prev => prev.map(l => l.id === activeListId ? { ...l, items: [...l.items, { id: Date.now(), name: newTierItemName, tier: addingToTier }] } : l));
      setNewTierItemName(''); setAddingToTier(null);
  };

  return (
    <div className={`min-h-screen flex ${bgMain} ${textMain} font-sans overflow-hidden`}>
        {/* 1. SIDEBAR */}
        <aside className={`w-64 border-r ${border} flex flex-col flex-shrink-0 ${bgCard}`}>
            <div className="p-6 flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${accent.gradient} rounded-xl flex items-center justify-center font-bold text-white shadow-lg text-xl`}>LB</div>
                <span className="font-bold text-lg">{t('appTitle')}</span>
            </div>
            
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                <button onClick={() => setCurrentTab('notes')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTab === 'notes' ? `${accent.lightBg} ${accent.text}` : `${textSec} hover:${bgMain}`}`}>
                    <StickyNote size={18} /> {t('navNotes')} <span className="ml-auto text-xs opacity-60">{notes.length}</span>
                </button>
                <button onClick={() => setCurrentTab('tiers')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentTab === 'tiers' ? `${accent.lightBg} ${accent.text}` : `${textSec} hover:${bgMain}`}`}>
                    <List size={18} /> {t('navTiers')}
                </button>

                {/* Label Section */}
                {currentTab === 'notes' && (
                    <div className="pt-4">
                        <div className={`px-3 pb-2 text-xs font-bold uppercase tracking-wider ${textSec} flex justify-between items-center`}>
                            <span>{t('labels')}</span>
                            <button onClick={() => setIsLabelManagerOpen(true)} className="hover:text-white"><Settings size={12}/></button>
                        </div>
                        <button onClick={() => toggleFilter('unlabeled')} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeFilters.includes('unlabeled') ? `${accent.lightBg} ${accent.text}` : `${textSec} hover:${bgMain}`}`}>
                             <Tag size={16} /> {t('unlabeled')}
                        </button>
                        {labels.map(l => (
                            <button key={l.id} onClick={() => toggleFilter(l.id)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${activeFilters.includes(l.id) ? `${l.color} ${l.textColor}` : `${textSec} hover:${bgMain}`}`}>
                                <div className={`w-3 h-3 rounded-full ${l.color}`} /> {l.name}
                            </button>
                        ))}
                    </div>
                )}
            </nav>

            <div className="p-4 border-t border-gray-800/10 dark:border-white/5">
                <button onClick={() => setIsSettingsOpen(true)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${textSec} hover:${bgMain} hover:${textMain}`}>
                    <Settings size={18} /> {t('settings')}
                </button>
            </div>
        </aside>

        {/* 2. SECONDARY COLUMN (List) */}
        <div className={`w-80 border-r ${border} flex flex-col flex-shrink-0 bg-opacity-50`}>
            <div className={`p-4 border-b ${border} flex gap-2`}>
                {currentTab === 'notes' ? (
                    <>
                        <div className="relative flex-1">
                            <Search size={16} className={`absolute left-3 top-3 ${textSec}`} />
                            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Suchen..." className={`w-full ${bgInput} rounded-lg pl-9 pr-3 py-2 text-sm border-none outline-none ${textMain}`} />
                        </div>
                        <button onClick={createNote} className={`p-2 rounded-lg ${accent.primary} text-white`}><Plus size={20} /></button>
                    </>
                ) : (
                    <Button onClick={() => setIsTierListModalOpen(true)} className="w-full"><Plus size={18}/> {t('newTierList')}</Button>
                )}
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {currentTab === 'notes' ? (
                    filteredNotes.map(note => {
                        const l = labels.find(l => l.id === note.labelId);
                        return (
                        <div key={note.id} onClick={() => setSelectedNoteId(note.id)} className={`p-3 rounded-xl cursor-pointer border transition-all ${selectedNoteId === note.id ? `ring-2 ring-${accent.name.split(' ')[0].toLowerCase()}-500 scale-[1.02]` : `hover:border-gray-500 border-transparent`} ${l ? l.color : bgCard}`}>
                            <h4 className={`font-bold text-sm truncate ${l ? l.textColor : textMain}`}>{note.title || 'Unbenannt'}</h4>
                            <p className={`text-xs truncate mt-1 ${l ? l.textColor : textSec} opacity-80`}>{note.content || 'Kein Inhalt'}</p>
                            <span className={`text-[10px] mt-2 block ${l ? l.textColor : textSec} opacity-60`}>{note.date}</span>
                        </div>
                    )})
                ) : (
                    tierlists.map(list => (
                        <div key={list.id} onClick={() => setActiveListId(list.id)} className={`p-3 rounded-xl cursor-pointer border transition-all flex justify-between ${activeListId === list.id ? `${accent.lightBg} ${accent.border}` : `${bgCard} border-transparent`}`}>
                            <span className="font-bold">{list.title}</span>
                            <button onClick={(e) => { e.stopPropagation(); setTierlists(prev => prev.filter(l => l.id !== list.id)); }} className="text-red-400"><Trash2 size={16}/></button>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* 3. MAIN CONTENT AREA (Right) */}
        <main className={`flex-1 flex flex-col ${bgMain} overflow-hidden`}>
            {currentTab === 'notes' ? (
                selectedNote ? (
                    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full p-8 h-full overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex gap-2">
                                <button onClick={() => handleUpdateNote(selectedNote.id, { labelId: '' })} className={`px-2 py-1 rounded border text-xs ${!selectedNote.labelId ? 'bg-white/20' : 'border-transparent opacity-50'}`}>No Label</button>
                                {labels.map(l => (
                                    <button 
                                        key={l.id} 
                                        onClick={() => handleUpdateNote(selectedNote.id, { labelId: l.id })}
                                        className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedNote.labelId === l.id ? 'scale-110 border-white' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                        style={{ backgroundColor: l.color.replace('bg-', 'var(--') }} 
                                    >
                                        <div className={`w-full h-full rounded-full ${l.color}`}></div>
                                    </button>
                                ))}
                            </div>
                            <button onClick={() => { setNotes(prev => prev.filter(n => n.id !== selectedNote.id)); setSelectedNoteId(null); }} className="text-red-400 hover:bg-red-400/10 p-2 rounded-lg"><Trash2 size={20} /></button>
                        </div>
                        <input value={selectedNote.title} onChange={(e) => handleUpdateNote(selectedNote.id, { title: e.target.value })} placeholder={t('titlePlaceholder')} className="text-4xl font-bold bg-transparent border-none outline-none mb-4 placeholder:opacity-30" />
                        <textarea value={selectedNote.content} onChange={(e) => handleUpdateNote(selectedNote.id, { content: e.target.value })} placeholder={t('contentPlaceholder')} className={`flex-1 bg-transparent border-none outline-none text-lg leading-relaxed resize-none ${textSec}`} />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30"><StickyNote size={64} className="mb-4" /><p className="text-xl">Wähle eine Notiz aus oder erstelle eine neue.</p></div>
                )
            ) : (
                activeList ? (
                    <div className="flex-1 p-8 overflow-y-auto">
                        <h2 className="text-3xl font-bold mb-6">{activeList.title}</h2>
                        <div className="space-y-4">
                            {tiers.map(tier => (
                                <div key={tier.id} className={`flex min-h-[100px] ${bgCard} rounded-xl border ${border} overflow-hidden`}>
                                    <div className={`${tier.color} w-24 flex flex-col items-center justify-center flex-shrink-0`}><span className="text-2xl font-black text-black/50">{tier.id}</span><button onClick={() => setAddingToTier(tier.id)} className="mt-2 bg-black/20 text-white p-1 rounded hover:bg-black/40"><Plus size={16}/></button></div>
                                    <div className="flex-1 p-4 flex flex-wrap gap-3 content-start">
                                        {activeList.items.filter(i => i.tier === tier.id).map(item => (
                                            <div key={item.id} className={`${bgInput} px-4 py-2 rounded-lg shadow border ${border} flex items-center gap-2 group`}>
                                                <span className="font-medium">{item.name}</span>
                                                <button onClick={() => setTierlists(prev => prev.map(l => l.id === activeList.id ? { ...l, items: l.items.filter(i => i.id !== item.id) } : l))} className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Modal isOpen={!!addingToTier} onClose={() => setAddingToTier(null)} title={`${t('addItem')} - ${addingToTier}`}>
                            <div className="space-y-4"><Input value={newTierItemName} onChange={(e) => setNewTierItemName(e.target.value)} placeholder={t('tierItemPlaceholder')} autoFocus /><Button onClick={addTierItem} className="w-full">{t('addItem')}</Button></div>
                        </Modal>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30"><List size={64} className="mb-4" /><p className="text-xl">Wähle eine Liste aus.</p></div>
                )
            )}
        </main>

        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        <LabelManager isOpen={isLabelManagerOpen} onClose={() => setIsLabelManagerOpen(false)} labels={labels} onAdd={handleCreateLabel} onUpdate={handleUpdateLabel} onDelete={handleDeleteLabel} />
        <Modal isOpen={isTierListModalOpen} onClose={() => setIsTierListModalOpen(false)} title={t('newTierList')}>
           <div className="space-y-4"><Input value={newTierListTitle} onChange={(e) => setNewTierListTitle(e.target.value)} placeholder={t('tierListNamePlaceholder')} autoFocus /><Button onClick={createTierList} className="w-full">{t('create')}</Button></div>
        </Modal>
    </div>
  );
}

// ==========================================
// 6. MAIN ENTRY POINT
// ==========================================

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <DataProvider>
        <div className="md:hidden h-screen w-screen overflow-hidden"><MobileLayout /></div>
        <div className="hidden md:block h-screen w-screen overflow-hidden"><DesktopLayout /></div>
      </DataProvider>
    </ThemeProvider>
  );
};

export default App;