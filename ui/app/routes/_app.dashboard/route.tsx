import {
  addToast,
  Button,
  Chip,
  Divider,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  BsArrowRight,
  BsCheck,
  BsClock,
  BsPerson,
  BsPlus,
  BsStop,
  BsStopFill,
} from "react-icons/bs";
import { FaBox } from "react-icons/fa";
import { FaPerson } from "react-icons/fa6";
import { IoPerson } from "react-icons/io5";
import { LuClock, LuTimer } from "react-icons/lu";
import { useNavigate } from "react-router";
import { API_URL } from "~/constants";

interface Session {
  id: string;
  startedAt: string;
  sessionType: "Gatherer" | "Transporter";
}

interface Task {
  startedAt: string;
  orderId: string;
  partnerName: string;
  orderItems: OrderItem[];
}

interface OrderItem {
  productName: string;
  quantity: number;
}

export default function Home() {
  const [newLoading, setNewLoading] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);

  const qc = useQueryClient();
  const navigate = useNavigate();

  const [currentTask, setCurrentTask] = useState<Task | null>();
  const [currentLoading, setCurrentLoading] = useState(false);

  const { data, isFetching } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/work-sessions/start`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        method: "POST",
      });
      if (!res.ok) throw Error(res.statusText);
      return (await res.json()) as Session;
    },
    refetchOnReconnect: false,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  async function fetchCurrent() {
    setCurrentLoading(true);
    const res = await fetch(`${API_URL}/work-sessions/${data?.id}/items/next`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!res.ok) {
      // addToast({
      //   title: "Failed to get current task",
      //   color: "danger",
      // });
      return;
    }
    if (res.status === 204) {
      setCurrentTask(null);
      setCurrentLoading(false);
      return;
    }
    setCurrentTask((await res.json()) as Task);
    setCurrentLoading(false);
  }

  const popup = useDisclosure();

  useEffect(() => {
    if (data?.id) {
      console.log(data?.id);
      fetchCurrent();
    }
  }, [data]);

  useEffect(() => {
    console.log(currentTask);
  }, [currentTask]);

  async function markAsDone() {
    setNewLoading(true);

    const res = await fetch(`${API_URL}/work-sessions/${data?.id}/items/done`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!res.ok) {
      addToast({
        title: "Error marking as complete",
        description: res.status === 500 ? await res.text() : await res.json(),
        color: "danger",
      });
      setStopLoading(false);
      return;
    }
    addToast({
      title: "Marked as complete successfully",
      color: "success",
    });
    popup.onClose();

    await fetchCurrent();

    setNewLoading(false);
  }

  async function stopSession() {
    setStopLoading(true);

    const res = await fetch(`${API_URL}/work-sessions/${data?.id}/stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!res.ok) {
      addToast({
        title: "Error stopping session",
        description: res.status === 500 ? await res.text() : await res.json(),
        color: "danger",
      });
      setStopLoading(false);
      return;
    }
    qc.invalidateQueries({
      queryKey: ["session"],
    });
    addToast({
      title: "Session stopped successfully",
      color: "success",
    });
    navigate("/");
  }

  if (isFetching)
    return (
      <div className="w-full h-full flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="flex flex-col w-full px-6 mt-6">
      <div className="flex gap-4 items-center">
        <div className="bg-content2 size-10 rounded-lg flex items-center justify-center">
          <FaBox size={12} />
        </div>
        <span className="font-semibold text-xl">Dashboard</span>
        <Button
          onPress={() => {
            localStorage.removeItem("accessToken");
            window.location.pathname = "/";
          }}
          size="sm"
          className="ml-auto"
          variant="flat"
        >
          Log out
        </Button>
      </div>
      <Divider className="mt-6 mb-6" />

      <div className="bg-content2 p-4 rounded-xl mb-2">
        <div className="flex justify-between items-center w-full mb-2">
          <span className="font-semibold text-lg">Active Session</span>
          <Chip color="success" variant="flat">
            {data?.sessionType}
          </Chip>
        </div>
        <div className="text-foreground-500 flex items-center gap-2">
          <LuClock />
          Started: {new Date(data?.startedAt ?? 0).toLocaleString()}
        </div>
      </div>

      <Button
        color="primary"
        className="w-full mt-2"
        isLoading={newLoading}
        onPress={markAsDone}
        isDisabled={currentTask == null}
      >
        <BsPlus size={20} /> Request New Work Item
      </Button>
      <Button
        variant="bordered"
        className="w-full mt-4"
        isLoading={stopLoading}
        onPress={stopSession}
      >
        <BsStopFill size={20} /> Stop Session
      </Button>

      <Divider className="mt-6 mb-6" />

      {currentLoading && (
        <div className="w-full flex justify-center">
          <Spinner />
        </div>
      )}

      {currentTask && !currentLoading && (
        <>
          <div className="bg-content2 p-4 rounded-xl" onClick={popup.onOpen}>
            <div className="flex justify-between items-center w-full mb-2">
              <span className="font-semibold text-lg">Current Task</span>
            </div>
            <Chip color="success" variant="flat" className="mb-2 -ml-1">
              In progress
            </Chip>
            <div className="text-foreground-500 flex items-center gap-2">
              <IoPerson size={14} />
              Partner: {currentTask?.partnerName}
            </div>
            <div className="text-foreground-500 flex items-center gap-2">
              <LuClock />
              Started: {new Date(currentTask?.startedAt ?? 0).toLocaleString()}
            </div>
            <div className="text-foreground-500 flex items-center gap-2">
              <FaBox size={14} />
              Items to collect: {currentTask?.orderItems.length}
            </div>
          </div>
        </>
      )}

      {!currentLoading && currentTask === null && (
        <>
          <div className="bg-content2 p-4 rounded-xl">
            <div className="flex justify-between items-center w-full">
              <span className="font-semibold text-lg">No tasks left!</span>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={popup.isOpen}
        onClose={popup.onClose}
        onOpenChange={popup.onOpenChange}
      >
        <ModalContent>
          <ModalHeader>
            Current Task{" "}
            <Chip className="ml-4">
              {data?.sessionType == "Gatherer" ? "Gather" : "Transport"}
            </Chip>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col">
              <div className="text-foreground-500 flex items-center gap-2">
                <IoPerson size={14} />
                Partner: {currentTask?.partnerName}
              </div>
              <div className="text-foreground-500 flex items-center gap-2">
                <LuClock />
                Started:{" "}
                {new Date(currentTask?.startedAt ?? 0).toLocaleString()}
              </div>
              <div className="text-foreground-500 flex items-center gap-2">
                <FaBox size={14} />
                Items to collect: {currentTask?.orderItems.length}
              </div>
            </div>

            <span className="font-semibold text-lg mt-2">
              Products to {data?.sessionType == "Gatherer" ? "Gather" : "Ship"}
            </span>
            {currentTask?.orderItems.map((item) => (
              <div
                className="bg-content2 p-2 px-4 rounded-xl flex items-center justify-between"
                key={item.productName}
              >
                <span>{item.productName}</span>
                <div className="flex flex-col items-center">
                  <span className="font-semibold text-xl">
                    {item?.quantity}
                  </span>
                  <span className="text-foreground-500 text-xs">units</span>
                </div>
              </div>
            ))}
          </ModalBody>
          <ModalFooter>
            <Button
              className="w-full"
              color="primary"
              isLoading={newLoading}
              onPress={markAsDone}
            >
              <BsCheck size={20} />
              Mark as Completed
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
