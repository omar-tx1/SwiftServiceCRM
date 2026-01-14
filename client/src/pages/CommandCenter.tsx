import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useNotifications } from "@/lib/notifications";
import {
  KanbanSquare,
  BadgeCheck,
  DollarSign,
  Users,
  ShieldCheck,
  Bot,
  CalendarClock,
  Repeat,
  ClipboardList,
} from "lucide-react";

type LeadStage = "New" | "Contacted" | "Qualified" | "Won" | "Lost";

interface Lead {
  id: number;
  name: string;
  stage: LeadStage;
  value: string | number;
  nextStep?: string;
  source?: string | null;
}

interface Invoice {
  id: number;
  customerName: string;
  jobTitle?: string | null;
  amount: string | number;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  dueDate?: string | null;
}

interface CrewJob {
  id: number;
  title: string;
  crew: string[];
  window: string;
  route: string;
}

export default function CommandCenter() {
  const { addNotification } = useNotifications();
  const { data: leads = [] } = useQuery<Lead[]>({ queryKey: ["/api/leads"] });
  const { data: invoices = [] } = useQuery<Invoice[]>({ queryKey: ["/api/invoices"] });
  const [crewBoard] = useState<CrewJob[]>([
    { id: 501, title: "Downtown condo pickup", crew: ["Mia", "Andre"], window: "8a - 10a", route: "Stop 1 of 5" },
    { id: 502, title: "Garage cleanout", crew: ["Sam", "Priya"], window: "11a - 1p", route: "Stop 3 of 5" },
    { id: 503, title: "Warehouse sweep", crew: ["Gus", "Lena"], window: "2p - 4p", route: "Stop 5 of 5" },
  ]);

  const pipelineStages: LeadStage[] = ["New", "Contacted", "Qualified", "Won", "Lost"];

  const updateLead = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Lead> }) => {
      const response = await apiRequest("PATCH", `/api/leads/${id}`, data);
      return (await response.json()) as Lead;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      if (updated.stage === "Won") {
        void addNotification({
          type: "lead",
          title: "Lead won",
          message: `${updated.name} marked as won. Convert to job + invoice?`,
        });
      }
    },
  });

  const addLead = useMutation({
    mutationFn: async ({ name, value, nextStep }: { name: string; value: number; nextStep: string }) => {
      const response = await apiRequest("POST", "/api/leads", {
        name,
        value,
        nextStep,
        stage: "New",
      });
      return (await response.json()) as Lead;
    },
    onSuccess: async (created) => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      await addNotification({
        type: "lead",
        title: "New lead logged",
        message: `${created.name} added to the pipeline`,
      });
    },
  });

  const updateInvoiceStatus = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Invoice["status"] }) => {
      const response = await apiRequest("PATCH", `/api/invoices/${id}`, { status });
      return (await response.json()) as Invoice;
    },
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      if (invoice.status === "Paid") {
        void addNotification({
          type: "success",
          title: "Invoice paid",
          message: `${invoice.customerName} paid ${formatCurrency(invoice.amount)}`,
        });
      }
    },
  });

  const moveLead = (lead: Lead, direction: 1 | -1) => {
    const currentIndex = pipelineStages.indexOf(lead.stage);
    const nextIndex = currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= pipelineStages.length) return;
    updateLead.mutate({ id: lead.id, data: { stage: pipelineStages[nextIndex] } });
  };

  const pipelineTotals = useMemo(() => {
    return pipelineStages.reduce<Record<string, number>>((acc, stage) => {
      acc[stage] = leads
        .filter((lead) => lead.stage === stage)
        .reduce((sum, lead) => sum + Number(lead.value ?? 0), 0);
      return acc;
    }, {});
  }, [leads]);

  const formatCurrency = (amount: string | number | null | undefined) => {
    return Number(amount ?? 0).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500 uppercase tracking-wide">Operations Command Center</p>
          <h1 className="text-3xl font-bold text-slate-900">Simplicity-first CRM for junk removal</h1>
          <p className="text-slate-500 mt-1 max-w-2xl">
            Lead pipeline, invoicing, crews, automation, and security guardrails live together so the day stays calm—even when
            the jobs are messy.
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-blue-600 text-white">Log new lead</Button>
          <Button variant="outline" className="border-slate-300">Export day plan</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900"><KanbanSquare className="h-5 w-5" /> Lead pipeline</CardTitle>
              <CardDescription>Swipe leads from new to won and keep the next action obvious.</CardDescription>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">{leads.length} active</Badge>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {pipelineStages.map((stage) => (
                <div key={stage} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-700">{stage}</p>
                    <span className="text-xs text-slate-500">${pipelineTotals[stage]?.toLocaleString() || 0}</span>
                  </div>
                  <div className="space-y-3">
                    {leads
                      .filter((lead) => lead.stage === stage)
                      .map((lead) => (
                        <div key={lead.id} className="bg-white border border-slate-200 rounded-md p-3 space-y-2 shadow-xs">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium text-sm text-slate-900">{lead.name}</p>
                            <Badge variant="outline" className="text-xs">${Number(lead.value ?? 0).toLocaleString()}</Badge>
                          </div>
                          <p className="text-xs text-slate-500">Next: {lead.nextStep || "No next step yet"}</p>
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => moveLead(lead, -1)}>
                              ←
                            </Button>
                            <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => moveLead(lead, 1)}>
                              →
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900"><BadgeCheck className="h-5 w-5" /> Quick add lead</CardTitle>
            <CardDescription>Drop a lead in and the team will get nudges to progress it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <LeadForm
              onSubmit={(name, value, nextStep) =>
                addLead.mutateAsync({ name, value, nextStep })
              }
            />
            <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Automations:</p>
              <p>• Auto-create job + quote when stage hits “Won”.</p>
              <p>• Send SMS reminder if no activity for 48 hours.</p>
              <p>• Tag junk removal vs demolition to keep pricing simple.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2 shadow-sm border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-slate-900"><DollarSign className="h-5 w-5" /> Invoices & payments</CardTitle>
              <CardDescription>Keep quotes moving to paid with one click statuses.</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">Stripe/Square ready</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-5 text-xs text-slate-500 font-semibold">
              <div>Customer</div>
              <div>Job</div>
              <div>Amount</div>
              <div>Status</div>
              <div>Due</div>
            </div>
            <div className="space-y-2">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="grid grid-cols-5 items-center text-sm bg-white border border-slate-200 rounded-md p-2">
                  <p className="font-medium text-slate-800">{invoice.customerName}</p>
                  <p className="text-slate-600">{invoice.jobTitle}</p>
                  <p className="text-slate-800">{formatCurrency(invoice.amount)}</p>
                  <div className="flex gap-2 flex-wrap">
                    {["Draft", "Sent", "Paid", "Overdue"].map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={invoice.status === status ? "default" : "outline"}
                        className="h-8"
                        onClick={() => updateInvoiceStatus.mutate({ id: invoice.id, status: status as Invoice["status"] })}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                  <p className="text-slate-600">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : "—"}</p>
                </div>
              ))}
            </div>
            <div className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-md p-3">
              Payments tie back to jobs and quotes. Record deposits, mark paid on-site, and keep overdue balances visible for next visits.
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900"><CalendarClock className="h-5 w-5" /> Crew & routes</CardTitle>
            <CardDescription>Assign techs, keep windows tight, and avoid backtracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {crewBoard.map((job) => (
              <div key={job.id} className="border border-slate-200 rounded-md p-3 bg-white space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-sm text-slate-900">{job.title}</p>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-800 border-blue-100">{job.window}</Badge>
                </div>
                <p className="text-xs text-slate-600">Crew: {job.crew.join(", ")}</p>
                <p className="text-xs text-slate-500">Route: {job.route}</p>
              </div>
            ))}
            <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Field ops:</p>
              <p>• Recurring jobs and checklists keep visits consistent.</p>
              <p>• Upload before/after photos and collect signatures on site.</p>
              <p>• Route stops auto-sort for less drive time.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900"><Bot className="h-5 w-5" /> Automations</CardTitle>
            <CardDescription>Simple toggles to keep follow-ups and syncs consistent.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <ToggleRow label="SMS reminders for expiring quotes" defaultChecked />
            <ToggleRow label="Webhook: new job → Google Calendar" defaultChecked />
            <ToggleRow label="Export paid invoices to QuickBooks" defaultChecked />
            <ToggleRow label="New lead → Mailchimp welcome series" />
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900"><Users className="h-5 w-5" /> Customer portal</CardTitle>
            <CardDescription>Share quotes, invoices, and job status without extra calls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Self-service link</p>
                <p className="text-xs text-slate-500">View quotes, pay invoices, rebook</p>
              </div>
              <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">Active</Badge>
            </div>
            <Textarea defaultValue="https://portal.haulmate.app/client/wilson-family" className="text-sm" />
            <div className="rounded-md bg-slate-50 border border-slate-200 p-3 space-y-1 text-xs text-slate-600">
              <p>• Optional PIN before viewing documents.</p>
              <p>• Surveys fire automatically after job completion.</p>
              <p>• Portal logins sync to the customer profile.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900"><ShieldCheck className="h-5 w-5" /> Roles & safety</CardTitle>
            <CardDescription>Keep data safe with simple roles and audit trails.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <RoleRow role="Admin" permissions="Billing, scheduling, user management" />
            <RoleRow role="Dispatcher" permissions="Schedule, crew assignment, SMS" />
            <RoleRow role="Field tech" permissions="Mobile app, photos, signatures" />
            <div className="rounded-md bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <p>Multi-factor login, audit logs, and IP alerts are enabled by default to keep customer and payment data safe.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900"><Repeat className="h-5 w-5" /> Simplicity playbook</CardTitle>
          <CardDescription>Guardrails to keep the CRM usable on day one.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700">
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Daily focus</p>
            <p>Home view shows only today's jobs, overdue invoices, and leads needing contact—no clutter.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Templates</p>
            <p>Quote and checklist templates tuned for junk removal keep pricing and scope consistent without overbuilding.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-900">Onboarding</p>
            <p>Copy/paste CSV import for customers and leads plus a toggle to enable payment capture when ready.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function LeadForm({ onSubmit }: { onSubmit: (name: string, value: number, nextStep: string) => Promise<unknown> }) {
  const [name, setName] = useState("");
  const [value, setValue] = useState("500");
  const [nextStep, setNextStep] = useState("Call to schedule estimate");

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="lead-name">Lead name</Label>
        <Input
          id="lead-name"
          placeholder="e.g. Garage cleanout - Parker"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lead-value">Estimated value</Label>
        <Input
          id="lead-value"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lead-next">Next step</Label>
        <Input
          id="lead-next"
          placeholder="Text photo request"
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
        />
      </div>
      <Button
        className="w-full bg-blue-600 text-white"
        onClick={async () => {
          if (!name.trim()) return;
          await onSubmit(name, Number(value || 0), nextStep);
          setName("");
          setValue("500");
          setNextStep("Call to schedule estimate");
        }}
      >
        Add lead
      </Button>
    </div>
  );
}

function ToggleRow({ label, defaultChecked }: { label: string; defaultChecked?: boolean }) {
  const [enabled, setEnabled] = useState(!!defaultChecked);
  return (
    <div className="flex items-center justify-between border border-slate-200 rounded-md p-3 bg-white">
      <div>
        <p className="font-medium text-slate-800">{label}</p>
        <p className="text-xs text-slate-500">{enabled ? "Active" : "Off"}</p>
      </div>
      <Button variant={enabled ? "default" : "outline"} onClick={() => setEnabled((v) => !v)}>
        {enabled ? "On" : "Off"}
      </Button>
    </div>
  );
}

function RoleRow({ role, permissions }: { role: string; permissions: string }) {
  return (
    <div className="border border-slate-200 rounded-md p-3 bg-white space-y-1">
      <div className="flex items-center gap-2">
        <ClipboardList className="h-4 w-4 text-blue-600" />
        <p className="font-semibold text-slate-900">{role}</p>
      </div>
      <p className="text-xs text-slate-600">{permissions}</p>
    </div>
  );
}
