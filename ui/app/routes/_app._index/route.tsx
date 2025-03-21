import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <div className="flex flex-col px-8 py-12 gap-8 overflow-y-scroll min-h-full">
      <h1 className="text-center text-3xl font-semibold">Home</h1>
    </div>
  );
}
