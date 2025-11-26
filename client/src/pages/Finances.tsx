import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, CreditCard, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Transaction, InsertTransaction } from "@shared/schema";
import { format } from "date-fns";

const expenseCategories = [
  { name: 'Labor', color: '#3b82f6' },
  { name: 'Disposal Fees', color: '#f97316' },
  { name: 'Fuel', color: '#ef4444' },
  { name: 'Equipment', color: '#10b981' },
  { name: 'Marketing', color: '#8b5cf6' },
  { name: 'Other', color: '#64748b' },
];

export default function Finances() {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ description: "", amount: "", category: "Fuel" });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: transactions = [] } = useQuery<Transaction[]>({
    queryKey: ["/api/transactions"],
  });

  const createTransactionMutation = useMutation({
    mutationFn: async (transaction: InsertTransaction) => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error("Failed to create transaction");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      toast({ title: "Success", description: "Expense logged successfully" });
    },
  });

  const handleAddExpense = () => {
    if (!newExpense.description || !newExpense.amount) return;

    const transaction: InsertTransaction = {
      description: newExpense.description,
      amount: newExpense.amount,
      type: "expense",
      category: newExpense.category,
      date: new Date(),
      jobId: null,
    };

    createTransactionMutation.mutate(transaction);
    setExpenseDialogOpen(false);
    setNewExpense({ description: "", amount: "", category: "Fuel" });
  };

  // Calculate totals
  const totalRevenue = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  
  const netProfit = totalRevenue - totalExpenses;

  // Expense breakdown by category
  const expenseBreakdown = expenseCategories.map(cat => ({
    name: cat.name,
    value: transactions
      .filter(t => t.type === 'expense' && t.category === cat.name)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0),
    color: cat.color
  })).filter(item => item.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Finances</h1>
          <p className="text-slate-500">Track your revenue, expenses, and profit margins.</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700 text-white gap-2">
                <Plus className="h-4 w-4" /> Log Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log New Expense</DialogTitle>
                <DialogDescription>
                  Enter the details of the business expense here.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    placeholder="e.g., Shell Gas Station"
                    className="col-span-3"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    className="col-span-3"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Select 
                    value={newExpense.category} 
                    onValueChange={(value) => setNewExpense({ ...newExpense, category: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddExpense} className="bg-red-600 hover:bg-red-700 text-white">Save Expense</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Select defaultValue="this-month">
            <SelectTrigger className="w-[160px] bg-white">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FinancialCard 
          title="Total Revenue" 
          amount={`$${totalRevenue.toFixed(2)}`} 
          change="+12.5%" 
          isPositive={true}
          icon={DollarSign}
          color="bg-blue-500"
        />
        <FinancialCard 
          title="Total Expenses" 
          amount={`$${totalExpenses.toFixed(2)}`} 
          change="+5.2%" 
          isPositive={false}
          icon={Wallet}
          color="bg-red-500"
        />
        <FinancialCard 
          title="Net Profit" 
          amount={`$${netProfit.toFixed(2)}`} 
          change="+22.4%" 
          isPositive={netProfit >= 0}
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
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>No expense data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest income and expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {transactions.length === 0 ? (
                 <div className="text-center py-8 text-slate-400">
                   <p>No transactions yet</p>
                 </div>
               ) : (
                 transactions.slice(0, 5).map((t) => (
                   <div key={t.id} className="flex items-center justify-between p-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors rounded-lg">
                     <div className="flex items-center gap-3">
                       <div className={`h-10 w-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                         {t.type === 'income' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-slate-900">{t.description}</p>
                         <p className="text-xs text-slate-500">{format(new Date(t.date), 'MMM d, yyyy')}</p>
                       </div>
                     </div>
                     <span className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-slate-900'}`}>
                       {t.type === 'income' ? '+' : '-'}${parseFloat(t.amount).toFixed(2)}
                     </span>
                   </div>
                 ))
               )}
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
