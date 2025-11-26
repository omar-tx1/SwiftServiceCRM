import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function Schedule() {
  const timeSlots = Array.from({ length: 10 }, (_, i) => i + 8); // 8 AM to 5 PM

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-heading text-3xl font-bold text-slate-900">Schedule</h1>
          <p className="text-slate-500">November 2025</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white border rounded-md shadow-sm">
            <Button variant="ghost" size="icon" className="h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
            <span className="px-4 font-medium text-sm">Nov 24 - Nov 30</span>
            <Button variant="ghost" size="icon" className="h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-4 w-4 mr-1" /> Add Job
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden border-slate-200 shadow-sm flex flex-col">
        <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
          <div className="p-3 text-xs font-medium text-slate-500 text-center border-r border-slate-200">Time</div>
          {["Mon 24", "Tue 25", "Wed 26", "Thu 27", "Fri 28", "Sat 29", "Sun 30"].map((day, i) => (
            <div key={day} className={`p-3 text-center border-r border-slate-200 last:border-r-0 ${i === 0 ? 'bg-blue-50/50' : ''}`}>
              <span className={`text-sm font-bold ${i === 0 ? 'text-blue-700' : 'text-slate-700'}`}>{day.split(' ')[0]}</span>
              <span className={`block text-xs ${i === 0 ? 'text-blue-500' : 'text-slate-500'}`}>{day.split(' ')[1]}</span>
            </div>
          ))}
        </div>
        
        <div className="overflow-auto flex-1 relative bg-white">
          {timeSlots.map((hour) => (
            <div key={hour} className="grid grid-cols-8 h-24 border-b border-slate-100 last:border-b-0">
              <div className="border-r border-slate-100 p-2 text-xs text-slate-400 text-center">
                {hour > 12 ? `${hour - 12} PM` : `${hour} ${hour === 12 ? 'PM' : 'AM'}`}
              </div>
              {/* Days columns */}
              {[0,1,2,3,4,5,6].map((day) => (
                <div key={day} className="border-r border-slate-100 relative group hover:bg-slate-50/50 transition-colors">
                  {/* Mock Events */}
                  {day === 0 && hour === 9 && (
                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-blue-100 border-l-4 border-blue-500 rounded-sm p-1.5 cursor-pointer hover:shadow-md transition-all z-10">
                      <p className="text-xs font-bold text-blue-800 truncate">Smith Removal</p>
                      <p className="text-[10px] text-blue-600 truncate">Full Truck</p>
                    </div>
                  )}
                  
                  {day === 1 && hour === 11 && (
                    <div className="absolute top-1 left-1 right-1 h-[180%] bg-green-100 border-l-4 border-green-500 rounded-sm p-1.5 cursor-pointer hover:shadow-md transition-all z-10">
                      <p className="text-xs font-bold text-green-800 truncate">Office Cleanout</p>
                      <p className="text-[10px] text-green-600 truncate">Downtown</p>
                    </div>
                  )}

                   {day === 3 && hour === 14 && (
                    <div className="absolute top-1 left-1 right-1 bottom-1 bg-amber-100 border-l-4 border-amber-500 rounded-sm p-1.5 cursor-pointer hover:shadow-md transition-all z-10">
                      <p className="text-xs font-bold text-amber-800 truncate">Estimate</p>
                      <p className="text-[10px] text-amber-600 truncate">Riverside Dr</p>
                    </div>
                  )}

                </div>
              ))}
            </div>
          ))}
          
          {/* Current Time Indicator Mock */}
          <div className="absolute left-0 right-0 top-[140px] border-t-2 border-red-400 z-20 pointer-events-none opacity-60">
            <div className="absolute -left-1 -top-1.5 h-3 w-3 rounded-full bg-red-400"></div>
          </div>
        </div>
      </Card>
    </div>
  );
}
