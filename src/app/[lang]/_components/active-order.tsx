"use client";

import { useQuery } from "@tanstack/react-query";
import eden from "@/eden";

const ActiveOrders = () => {
	const { data: response } = useQuery({
		queryKey: ["active-orders"],
		queryFn: () => eden.api.order.active.get(),
	});

	return (
		<>
			{response?.data?.map((order) => (
				<div key={order.id} className="flex flex-col">
					<h2>{order.name}</h2>
					<p>{order.description}</p>
				</div>
			))}
		</>
	);
};

export default ActiveOrders;
