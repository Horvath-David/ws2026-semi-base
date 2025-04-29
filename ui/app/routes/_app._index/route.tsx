import { Button, Link } from "@heroui/react";
import { useState } from "react";
import { BsArrowRight } from "react-icons/bs";
import { FaBox } from "react-icons/fa";

export default function Home() {
  const [loading, setLoading] = useState(false);

  return (
    <>
      <div className="flex h-full justify-center flex-col gap-4 p-6 items-center rounded-2xl w-full max-w-lg">
        <div className="bg-content2 size-18 rounded-2xl flex items-center justify-center">
          <FaBox size={24} />
        </div>
        <h1 className="text-2xl text-center font-semibold">
          Welcome to Warehouse
        </h1>
        <p className="mb-2 -mt-3">Manage your orders efficiently</p>

        <Button
          as={Link}
          href="/dashboard"
          type="submit"
          color="primary"
          className="w-full mt-2"
          isLoading={loading}
          onPress={() => {
            setLoading(true);
          }}
        >
          Start Managing <BsArrowRight size={16} />
        </Button>
      </div>
    </>
  );
}
