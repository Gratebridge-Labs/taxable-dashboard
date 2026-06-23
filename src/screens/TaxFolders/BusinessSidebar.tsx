'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export type BusinessSection = {
  key: string;
  label: string;
  route: string | null;
  children?: BusinessSection[];
};

interface BusinessSidebarProps {
  sections: BusinessSection[];
  activeSection: string;
  activeSubSection?: string;
  onSubSectionChange?: (key: string) => void;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

export function BusinessSidebar({
  sections,
  activeSection,
  activeSubSection,
  onSubSectionChange,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}: BusinessSidebarProps) {
  const router = useRouter();

  const handleSectionClick = (section: BusinessSection) => {
    if (section.route) {
      router.push(section.route);
    }
    setMobileSidebarOpen(false);
  };

  const handleSubClick = (section: BusinessSection, child: BusinessSection) => {
    if (child.route) {
      router.push(child.route);
    } else if (onSubSectionChange) {
      onSubSectionChange(child.key);
    }
    setMobileSidebarOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 bg-taxable-blue rounded-full shadow-lg flex items-center justify-center text-white"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {mobileSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`
          md:w-[260px] md:flex-shrink-0 md:flex md:flex-col md:sticky md:top-24
          fixed md:relative inset-y-0 left-0 z-50 bg-neutral-100 md:bg-transparent
          transform transition-transform duration-300 ease-in-out font-sans
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          w-[280px] flex flex-col p-4 shadow-xl md:shadow-none
        `}
      >
        <button
          onClick={() => setMobileSidebarOpen(false)}
          className="md:hidden absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-neutral-500" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="bg-white rounded-[20px] p-[8px] border-[0.6px] border-neutral-100 flex flex-col gap-[2px]">
          <span className="text-2 font-medium text-neutral-400 px-[8px] pt-[4px] pb-[4px]">
            {sections.length > 0 ? 'Sections' : 'Menu'}
          </span>
          {sections.map((section) => (
            <React.Fragment key={section.key}>
              {section.children && section.children.length > 0 ? (
                <>
                  <button
                    onClick={() => handleSectionClick(section)}
                    className={`w-full flex items-center justify-between px-[8px] py-[12px] rounded-[10px] transition-all ${
                      activeSection === section.key ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                    }`}
                  >
                    <span
                      className={`text-2 ${
                        activeSection === section.key ? 'font-semibold' : 'font-medium'
                      } text-neutral-800`}
                    >
                      {section.label}
                    </span>
                    {activeSection === section.key && (
                      <svg
                        className="text-neutral-400 transition-transform duration-200 rotate-90"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    )}
                  </button>
                  {activeSection === section.key && (
                    <div className="ml-3 border-l border-neutral-100 pl-3 flex flex-col gap-[2px]">
                      {section.children.map((child) => {
                        const isActive =
                          activeSubSection === child.key ||
                          (child.route && typeof window !== 'undefined' && window.location.pathname === child.route);
                        return (
                          <button
                            key={child.key}
                            onClick={() => handleSubClick(section, child)}
                            className={`w-full flex items-center justify-between px-[8px] py-[10px] rounded-[10px] transition-all text-left ${
                              isActive ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                            }`}
                          >
                            <span
                              className={`text-2 ${
                                isActive ? 'font-semibold text-neutral-800' : 'font-medium text-neutral-500'
                              }`}
                            >
                              {child.label}
                            </span>
                            {isActive && <ChevronRight size={14} className="text-neutral-800 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={() => handleSectionClick(section)}
                  className={`w-full flex items-center justify-between px-[8px] py-[12px] rounded-[10px] transition-all ${
                    activeSection === section.key ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                  }`}
                >
                  <span
                    className={`text-2 ${
                      activeSection === section.key ? 'font-semibold' : 'font-medium'
                    } text-neutral-800`}
                  >
                    {section.label}
                  </span>
                  {activeSection === section.key && (
                    <ChevronRight size={16} className="text-neutral-800 flex-shrink-0" />
                  )}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
