"use client";

import { type DayOrder } from "@/app/new/board/[id]/type";
import { useOrderBoard } from "@/store/order-board/index";
import { useEffect } from "react";

type Props = {
  initial: Array<DayOrder>;
};

const OrderBoardLoader = ({ initial }: Props) => {
  const loadTable = useOrderBoard((s) => s.load);
  const fetchStatus = useOrderBoard((s) => s.fetchStatus);

  useEffect(() => {
    fetchStatus({ isLoading: true });
    loadTable(initial);
    fetchStatus({ isLoading: false });
  }, [fetchStatus, initial, loadTable]);
  return null;
};

export default OrderBoardLoader;
