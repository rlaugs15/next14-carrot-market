import Tabbar from "@/components/tab-bar";

interface TabLayoutProps {
  childeren: React.ReactNode;
}

export default function TabLayout({ childeren }: TabLayoutProps) {
  return (
    <div>
      {childeren}
      <Tabbar />
    </div>
  );
}
