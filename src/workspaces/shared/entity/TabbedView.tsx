import { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface TabItem {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
}

interface Props {
  tabs: TabItem[];
  defaultTab?: string;
  /** Called when active tab changes */
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export function TabbedView({ tabs, defaultTab, onTabChange, className }: Props) {
  return (
    <Tabs
      defaultValue={defaultTab ?? tabs[0]?.id}
      onValueChange={onTabChange}
      className={className}
    >
      <TabsList>
        {tabs.map((tab) => (
          <TabsTrigger key={tab.id} value={tab.id} disabled={tab.disabled}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id} className="mt-4">
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
