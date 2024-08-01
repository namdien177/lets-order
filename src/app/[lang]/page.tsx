import ActiveOrders from "@/app/[lang]/_components/active-order";

export default function HomePage() {
	return (
		<main className="container mx-auto flex min-h-screen flex-col gap-8 p-8">
			<h1 className="text-3xl">Active Orders</h1>
			<hr />
			<div className="flex flex-col gap-4">
				<ActiveOrders />
			</div>
		</main>
	);
}
