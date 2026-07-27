// app/(dashboard)/dashboard/tasks/page.tsx
import { TaskBoardView } from "./_modules/TaskBoardView";

export const dynamic = "force-dynamic";

export default function TaskBoardPage() {
  return <TaskBoardView />;
}
