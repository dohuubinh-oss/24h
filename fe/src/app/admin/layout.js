'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Database, 
  ClipboardList, 
  Users, 
  Search, 
  Bell, 
  Settings, 
  LogOut,
  GraduationCap,
  BookOpen,
  BarChart2,
  ChevronDown,
  Type,
  FileText
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { FilterProvider, useFilters } from '../../context/FilterContext';
import { useAuth } from '../../context/AuthContext';

function SidebarItem({ icon, label, href }) {
  const pathname = usePathname();
  const active = pathname.startsWith(href);

  return (
    <Link 
      href={href}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${ 
        active 
          ? 'bg-[#2463eb]/5 text-[#2463eb] border-r-4 border-[#2463eb] font-bold' 
          : 'text-slate-600 hover:bg-slate-50 font-medium'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </Link>
  );
}

function FilterSection({ icon, title, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);
  return (
    <div className="px-3">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-sm font-semibold py-1 hover:text-[#2463eb] transition-colors"
      >
        <div className="flex items-center gap-2 text-slate-700">
          {icon}
          <span>{title}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="mt-3 pl-6">{children}</div>}
    </div>
  );
}

function RadioItem({ label, name, value, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
      <input
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="rounded-full border-slate-300 text-[#2463eb] focus:ring-offset-0 focus:ring-1 focus:ring-[#2463eb] h-3 w-3 transition"
        type="radio"
      />
      {label}
    </label>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const { 
    selectedGrade, setSelectedGrade,
    selectedSubject, setSelectedSubject,
    selectedDifficulty, setSelectedDifficulty,
    selectedType, setSelectedType
  } = useFilters();

  const handleResetFilters = () => {
    setSelectedGrade('Tất cả');
    setSelectedSubject('Tất cả');
    setSelectedDifficulty('Tất cả');
    setSelectedType('Tất cả');
  };

  const grades = ['Tất cả', 'Lớp 6', 'Lớp 7', 'Lớp 8', 'Lớp 9', 'Lớp 10', 'Lớp 11', 'Lớp 12'];
  const subjects = ['Tất cả', 'Đại số', 'Hình học', 'Giải tích'];
  const difficulties = ['Tất cả', 'Nhận biết', 'Thông hiểu', 'Vận dụng', 'Vận dụng cao'];
  const questionTypes = ['Tất cả', 'Trắc nghiệm', 'Tự luận'];
  const examTypes = ['Tất cả', 'Thi học kỳ', 'Thi giữa kỳ', 'Kiểm tra 1 tiết', 'Kiểm tra 15 phút'];
  
  const isQuestionsPage = pathname.startsWith('/admin/questions');
  const isExamsPage = pathname.startsWith('/admin/exams');

  return (
    <aside className="w-72 border-r border-slate-100 overflow-y-auto hidden md:block bg-white flex-shrink-0">
      <nav className="p-4 space-y-6">
        <div className="space-y-1">
          <SidebarItem href="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Bảng điều khiển" />
          <SidebarItem href="/admin/questions" icon={<Database size={18} />} label="Ngân hàng câu hỏi" />
          <SidebarItem href="/admin/exams" icon={<FileText size={18} />} label="Ngân hàng đề thi" />
          <SidebarItem href="/admin/students" icon={<Users size={18} />} label="Học sinh" />
        </div>
        <hr className="border-slate-100" />
        <div className="space-y-4">
            <div className="flex items-center justify-between px-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bộ lọc chi tiết</h3>
                <button onClick={handleResetFilters} className="text-[10px] font-bold uppercase text-[#2463eb] hover:underline">LÀM MỚI</button>
            </div>

          {(isQuestionsPage || isExamsPage) && (
            <>
              <FilterSection icon={<GraduationCap size={16} />} title="Khối lớp" defaultOpen><div className="grid grid-cols-2 gap-2">{grades.map(g => <RadioItem key={g} label={g} name="grade" value={g} checked={selectedGrade === g} onChange={() => setSelectedGrade(g)} />)}</div></FilterSection>
              
              {isQuestionsPage && (
                  <FilterSection icon={<BookOpen size={16} />} title="Môn học" defaultOpen><div className="space-y-2">{subjects.map(s => <RadioItem key={s} label={s} name="subject" value={s} checked={selectedSubject === s} onChange={() => setSelectedSubject(s)} />)}</div></FilterSection>
              )}
              
              <FilterSection icon={<BarChart2 size={16} />} title="Mức độ" defaultOpen><div className="space-y-2">{difficulties.map(d => <RadioItem key={d} label={d} name="difficulty" value={d} checked={selectedDifficulty === d} onChange={() => setSelectedDifficulty(d)} />)}</div></FilterSection>
              
              {isQuestionsPage && (
                <FilterSection icon={<Type size={16} />} title="Loại câu hỏi" defaultOpen><div className="space-y-2">{questionTypes.map(t => <RadioItem key={t} label={t} name="type" value={t} checked={selectedType === t} onChange={() => setSelectedType(t)} />)}</div></FilterSection>
              )}
              
              {isExamsPage && (
                <FilterSection icon={<Type size={16} />} title="Loại đề thi" defaultOpen><div className="space-y-2">{examTypes.map(t => <RadioItem key={t} label={t} name="examType" value={t} checked={selectedType === t} onChange={() => setSelectedType(t)} />)}</div></FilterSection>
              )}
            </>
          )}
        </div>
      </nav>
    </aside>
  );
}

function UserProfile() {
  const { user, loading, logout } = useAuth();

  if (loading) return <div className="h-10 w-48 bg-slate-200 animate-pulse rounded-md"></div>;
  if (!user) return <Link href="/login">Đăng nhập</Link>;

  return (
    <div className="flex items-center gap-3">
       <button onClick={logout} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors" title="Đăng xuất"><LogOut size={20} /></button>
      <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block"><p className="text-xs font-semibold">{user.name || 'Người dùng'}</p><p className="text-[10px] text-slate-500">{user.role || 'Quản trị viên'}</p></div>
          <div className="h-10 w-10 rounded-full bg-[#2463eb]/10 flex items-center justify-center text-[#2463eb] font-bold border border-[#2463eb]/20 overflow-hidden">
             {user.picture ? <Image alt="User avatar" className="w-full h-full object-cover" src={user.picture} width={40} height={40} referrerPolicy="no-referrer" /> : <span>{user.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>}
          </div>
      </div>
    </div>
  );
}

function AdminLayout({ children }) {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith('/admin/questions')) return 'Ngân hàng câu hỏi';
    if (pathname.startsWith('/admin/exams')) return 'Ngân hàng đề thi';
    if (pathname.startsWith('/admin/students')) return 'Quản lý học sinh';
    if (pathname.startsWith('/admin/dashboard')) return 'Bảng điều khiển';
    return 'Admin';
  };

  return (
    <FilterProvider>
      <div className="min-h-screen flex flex-col bg-white">
        <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
          <div className="px-6 h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/admin/dashboard" className="flex items-center gap-2 text-[#2463eb]">
                <div className="bg-[#2463eb] text-white p-1 rounded"><LayoutDashboard size={20} /></div>
                <h1 className="text-xl font-bold tracking-tight hidden md:block">Math EdTech</h1>
              </Link>
              <div className="h-6 w-px bg-slate-200 mx-2"></div>
              <h2 className="text-lg font-semibold text-slate-700">{getPageTitle()}</h2>
            </div>
            <div className="flex-1 max-w-md hidden lg:block"></div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><Bell size={20} /></button>
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors mr-2"><Settings size={20} /></button>
              <UserProfile />
            </div>
          </div>
        </header>

        <div className="flex-1 w-full max-w-screen-2xl mx-auto">
          <div className="flex h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-6 bg-[#f7f8fa]">
              {children} 
            </main>
          </div>
        </div>

      </div>
    </FilterProvider>
  );
}

export default AdminLayout;
