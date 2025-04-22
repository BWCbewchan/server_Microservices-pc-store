export default function RecentSales() {
    const sales = [
        { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+$1,999.00" },
        { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+$39.00" },
        { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+$299.00" },
        { name: "William Kim", email: "will@email.com", amount: "+$99.00" },
        { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+$39.00" },
    ];

    return (
        <div className=" p-6 rounded-xl max-w-md shadow-lg">
            <h2 className="text-lg font-semibold">Recent Sales</h2>
            <p className="text-sm text-gray-400">You made 265 sales this month.</p>
            <div className="mt-4 space-y-4">
                {sales.map((sale, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-white">
                                <span className="text-sm font-medium">{sale.name.charAt(0)}</span>
                            </div>
                            <div>
                                <p className="font-medium">{sale.name}</p>
                                <p className="text-sm text-gray-400">{sale.email}</p>
                            </div>
                        </div>
                        <p className="text-green-400 font-medium">{sale.amount}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
