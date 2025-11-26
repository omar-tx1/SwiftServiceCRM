import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, CreditCard } from "lucide-react";

const data = [
  { name: 'Labor', value: 3500, color: '#3b82f6' }, // blue-500
  { name: 'Disposal Fees', value: 2100, color: '#f97316' }, // orange-500
  { name: 'Fuel', value: 850, color: '#ef4444' }, // red-500
  { name: 'Equipment', value: 450, color: '#10b981' }, // green-500
  { name: 'Marketing', value: 600, color: '#8b5cf6' }, // violet-500
];

export default function Finances() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Finances</h1>
          <p className="text-slate-500">Track your revenue, expenses, and profit margins.</p>
        </div>
        <Select defaultValue="this-month">
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="this-month">This Month</SelectItem>
            <SelectItem value="last-month">Last Month</SelectItem>
            <SelectItem value="this-year">This Year</SelectItem>
            <SelectItem value="last-year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard 
          title="Total Revenue" 
          amount="$12,450.00" 
          change="+12.5%" 
          isPositive={true}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <FinancialCard 
          title="Total Expenses" 
          amount="$7,500.00" 
          change="+5.2%" 
          isPositive={false} // Expenses going up is usually "bad" or just neutral
          icon={Wallet}
          color="bg-red-500"
        />
        <FinancialCard 
          title="Net Profit" 
          amount="$4,950.00" 
          change="+22.4%" 
          isPositive={true}
          icon={CreditCard}
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Where your money is going this month.</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`$${value}`, 'Amount']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest income and expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {[
                 { label: "Job #1024 - Sarah Johnson", date: "Today, 2:30 PM", amount: "+$450.00", type: "income" },
                 { label: "Dump Fee - Metro Waste", date: "Today, 1:15 PM", amount: "-$125.00", type: "expense" },
                 { label: "Fuel - Shell Station", date: "Today, 9:45 AM", amount: "-$85.50", type: "expense" },
                 { label: "Job #1022 - David Wong", date: "Yesterday", amount: "+$650.00", type: "income" },
                 { label: "Equipment Maintenance", date: "Yesterday", amount: "-$240.00", type: "expense" },
               ].map((t, i) => (
                 <div key={i} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded-lg">
                   <div className="flex items-center gap-3">
                     <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                       {t.type === 'income' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                     </div>
                     <div>
                       <p className="text-sm font-medium text-slate-900">{t.label}</p>
                       <p className="text-xs text-slate-500">{t.date}</p>
                     </div>
                   </div>
                   <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                     {t.amount}
                   </span>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinancialCard({ title, amount, change, isPositive, icon: Icon, color }: any) {
  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="font-heading text-3xl font-bold text-slate-900 mt-2">{amount}</h3>
          </div>
          <div className={`p-3 rounded-xl text-white ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-4">
          <span className={`flex items-center text-xs font-bold px-1.5 py-0.5 rounded ${isPositive ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {change}
          </span>
          <span className="text-xs text-slate-400">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}