import Workspace from "@/components/workspace";
import { demoData } from "@/features/demo/data";
export const metadata = {
  title: "Demonstration | Swim Forward",
  robots: { index: false, follow: false },
};
export default function Demo() {
  return <Workspace initial={demoData} demo />;
}
