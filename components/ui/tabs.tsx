"use client";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="border-b border-dark-200 dark:border-dark-700">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-6 py-3 font-medium text-sm transition-colors
              ${
                activeTab === tab.id
                  ? "text-primary-500 border-b-2 border-primary-500"
                  : "text-dark-600 dark:text-dark-400 hover:text-dark-900 dark:hover:text-dark-100"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}



