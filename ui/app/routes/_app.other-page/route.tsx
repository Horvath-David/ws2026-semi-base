import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  return (
    <h1 className="text-center text-3xl font-semibold mt-12">Other page</h1>
  );
}
