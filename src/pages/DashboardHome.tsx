import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Globe,
  MapPin,
  Phone,
  Clock,
  Calendar,
  Settings,
  Plus,
  X,
  ChevronDown,
  Mail,
  MessageSquare,
  Check,
} from "lucide-react";

export const DashboardHome: React.FC = () => {
  const [businessPromptEnabled, setBusinessPromptEnabled] = useState(true);
  const [appointmentEnabled, setAppointmentEnabled] = useState(false);
  const [callTransferEnabled, setCallTransferEnabled] = useState(false);
  const [availability, setAvailability] = useState("custom");
  const [services, setServices] = useState(["establishment", "point_of_interest"]);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [callerName, setCallerName] = useState(true);
  const [callerEmail, setCallerEmail] = useState(true);
  const [businessPrompt, setBusinessPrompt] = useState(`# Company Name
Neodynatech Solutions Inc.

# Tagline
Innovative Tech Solutions for Your Business Growth

# Website
[https://www.neodynatech.com/](https://www.neodynatech.com/)

# Contact
(647) 216-4123`);

  const weekDays = [
    { name: "Monday", open: "9:00 AM", close: "6:00 PM", isOpen: true },
    { name: "Tuesday", open: "9:00 AM", close: "6:00 PM", isOpen: true },
    { name: "Wednesday", open: "9:00 AM", close: "6:00 PM", isOpen: true },
    { name: "Thursday", open: "9:00 AM", close: "6:00 PM", isOpen: true },
    { name: "Friday", open: "9:00 AM", close: "6:00 PM", isOpen: true },
    { name: "Saturday", open: "Start time", close: "End time", isOpen: false },
    { name: "Sunday", open: "Start time", close: "End time", isOpen: false },
  ];

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Home</h1>
      </div>

      {/* Training Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Training Sources</CardTitle>
          <p className="text-muted-foreground text-sm">
            Benny uses these sources to learn about your business and handle calls effectively.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Google Business</p>
                <p className="text-sm text-muted-foreground truncate">
                  https://www.google.com/maps/place/?q=place_id:ChlJJ8by...
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Business Website</p>
                <p className="text-sm text-muted-foreground">
                  https://www.neodynatech.com/
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assigned Number */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Assigned Number</CardTitle>
          <p className="text-muted-foreground text-sm">
            Your dedicated business line for Benny to handle incoming calls.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            <Phone className="h-5 w-5 text-primary" />
            <span className="font-medium text-lg">1 (368) 210-0725</span>
          </div>
        </CardContent>
      </Card>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Business Information</CardTitle>
          <p className="text-muted-foreground text-sm">
            Core details about your business that help Benny handle calls effectively.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Business Name</Label>
              <Input value="Neodynatech Solutions Inc." className="bg-secondary/30" readOnly />
            </div>
            <div className="space-y-2">
              <Label>Business Phone</Label>
              <Input value="16472164123" className="bg-secondary/30" readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Train Benny */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Train Benny with your Business Overview</CardTitle>
          <p className="text-muted-foreground text-sm">
            When enabled, Benny will be fully trained based on the information provided in the Business Overview section.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Business Prompt (Additional information Benny uses to assist callers)</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Tip: AI generation uses your business details for better results
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={businessPromptEnabled} onCheckedChange={setBusinessPromptEnabled} />
              <span className="text-sm">{businessPromptEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">{businessPrompt.length}/800 words</span>
              <Button variant="outline" size="sm">
                Generate with AI
              </Button>
            </div>
            <Textarea
              value={businessPrompt}
              onChange={(e) => setBusinessPrompt(e.target.value)}
              className="min-h-32 font-mono text-sm"
              placeholder="Enter business information..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Business Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Business Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
            <MapPin className="h-5 w-5 text-primary" />
            <span>201 King St, London, ON N6A 1C9, Canada</span>
          </div>
        </CardContent>
      </Card>

      {/* Appointment/Reservation Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Appointment / Reservation Link</CardTitle>
          <p className="text-muted-foreground text-sm">
            When enabled, Benny will offer your booking link to callers asking about appointments.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Booking URL</Label>
            <div className="flex items-center gap-2">
              <Switch checked={appointmentEnabled} onCheckedChange={setAppointmentEnabled} />
              <span className="text-sm">{appointmentEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
          <Input
            placeholder="Example: https://calendar.app.google/CNb6nX6N1QzPyedQA"
            className="bg-secondary/30"
          />
        </CardContent>
      </Card>

      {/* Call Transfer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Call Transfer</CardTitle>
          <p className="text-muted-foreground text-sm">
            Benny will transfer callers who request to speak with your staff.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Enable Call Transfer</Label>
            <div className="flex items-center gap-2">
              <Switch checked={callTransferEnabled} onCheckedChange={setCallTransferEnabled} />
              <span className="text-sm">{callTransferEnabled ? "Enabled" : "Disabled"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Core Services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Core Services</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {services.map((service, index) => (
              <div key={index} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                <span className="text-sm">{service}</span>
                <button className="ml-1 hover:bg-destructive/20 rounded-full p-1">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Add a service..." className="flex-1" />
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Benny Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Benny Hours</CardTitle>
          <p className="text-muted-foreground text-sm">
            Set the hours Benny will answer calls for your business.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="24-7"
                name="availability"
                checked={availability === "24-7"}
                onChange={() => setAvailability("24-7")}
              />
              <Label htmlFor="24-7">24/7 Availability</Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="custom"
                name="availability"
                checked={availability === "custom"}
                onChange={() => setAvailability("custom")}
              />
              <Label htmlFor="custom">Custom Hours</Label>
            </div>
          </div>
          
          {availability === "24-7" && (
            <p className="text-sm text-muted-foreground">
              Always available - Benny will answer calls anytime, any day
            </p>
          )}

          {availability === "custom" && (
            <div className="space-y-3">
              {weekDays.map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-20 font-medium">{day.name}</span>
                    <Select defaultValue={day.open}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9:00 AM">9:00 AM</SelectItem>
                        <SelectItem value="Start time">Start time</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select defaultValue={day.close}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6:00 PM">6:00 PM</SelectItem>
                        <SelectItem value="End time">End time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {day.isOpen ? "Open" : "Closed"}
                    </span>
                    <Switch checked={day.isOpen} />
                  </div>
                </div>
              ))}
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="eastern">
                  <SelectTrigger>
                    <SelectValue placeholder="Eastern Time (ET)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eastern">Eastern Time (ET)</SelectItem>
                    <SelectItem value="pacific">Pacific Time (PT)</SelectItem>
                    <SelectItem value="central">Central Time (CT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Call Script */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Call Script</CardTitle>
          <p className="text-muted-foreground text-sm">
            Configure the first message and information Benny collects during calls.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Agent Name</Label>
            <Input defaultValue="Benny" />
            <p className="text-xs text-muted-foreground">
              This is the name your AI agent will use when introducing itself to callers. Default is "Benny".
            </p>
          </div>

          <div className="space-y-2">
            <Label>First Message</Label>
            <Textarea
              defaultValue="Hello, thank you for calling. This is Benny, your virtual assistant."
              className="min-h-20"
            />
            <p className="text-xs text-muted-foreground">
              First message after greeting. Should match your agent's name and selected language.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Language</Label>
            <Select defaultValue="english">
              <SelectTrigger>
                <SelectValue placeholder="English" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="spanish">Spanish</SelectItem>
                <SelectItem value="french">French</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select the language Benny will use for calls. Benny supports over 30 languages.
            </p>
          </div>

          <div>
            <Label className="text-base font-semibold">Required Information</Label>
            <div className="space-y-3 mt-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Caller Name</p>
                  <p className="text-sm text-muted-foreground">Ask for the caller's name during the call.</p>
                </div>
                <Switch checked={callerName} onCheckedChange={setCallerName} />
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Caller Email Address</p>
                  <p className="text-sm text-muted-foreground">Ask for the caller's email address during the call.</p>
                </div>
                <Switch checked={callerEmail} onCheckedChange={setCallerEmail} />
              </div>
            </div>
          </div>

          <div>
            <Label className="text-base font-semibold">Specific Questions</Label>
            <div className="mt-3">
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add a new question...
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Call Notifications</CardTitle>
          <p className="text-muted-foreground text-sm">
            Get notified when calls conclude with a summary of the conversation.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive call summaries at neodynatechsolutions@gmail.com</p>
              </div>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-muted-foreground">Receive text messages with call summaries</p>
              </div>
            </div>
            <Switch checked={smsNotifications} onCheckedChange={setSmsNotifications} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-base font-semibold">Additional Recipients</Label>
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-muted-foreground">Verified</span>
              </div>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <span className="font-medium">1 (647) 216-4123</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Changes Button */}
      <div className="flex justify-end">
        <Button size="lg" className="px-8">
          Save Changes
        </Button>
      </div>
    </div>
  );
};
