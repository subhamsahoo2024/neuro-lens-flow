import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Camera, Plus, RefreshCw, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { PatientRegistration } from "./PatientRegistration";
import { NewVisit } from "./NewVisit";
import { CameraInterface } from "./CameraInterface";

export const Dashboard = () => {
  const [activeView, setActiveView] = useState<"dashboard" | "newPatient" | "newVisit" | "camera">("dashboard");
  const [username] = useState("Dr. Smith"); // Mock username

  if (activeView === "newPatient") {
    return <PatientRegistration onBack={() => setActiveView("dashboard")} />;
  }

  if (activeView === "newVisit") {
    return <NewVisit onBack={() => setActiveView("dashboard")} />;
  }

  if (activeView === "camera") {
    return <CameraInterface onBack={() => setActiveView("dashboard")} />;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hi {username}</h1>
            <p className="text-muted-foreground">Welcome to NeuroLens</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              <Activity className="w-3 h-3 mr-1" />
              System Online
            </Badge>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            onClick={() => setActiveView("newPatient")} 
            className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-5 h-5 mr-2" />
            New Patient
          </Button>
          <Button 
            onClick={() => setActiveView("newVisit")} 
            variant="secondary" 
            className="h-16"
          >
            <Users className="w-5 h-5 mr-2" />
            New Visit
          </Button>
          <Button 
            onClick={() => setActiveView("camera")} 
            variant="outline" 
            className="h-16 border-accent text-accent hover:bg-accent/10"
          >
            <Camera className="w-5 h-5 mr-2" />
            Camera
          </Button>
          <Button variant="outline" className="h-16">
            <RefreshCw className="w-5 h-5 mr-2" />
            Sync Pending
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Scans</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                +3 from yesterday
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High-Risk Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">3</div>
              <p className="text-xs text-muted-foreground">
                Require follow-up
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Sync</CardTitle>
              <RefreshCw className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">5</div>
              <p className="text-xs text-muted-foreground">
                Ready to upload
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest patient visits and assessments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { patient: "John Doe", age: 67, risk: "High", time: "2 hours ago", epwv: "12.4 m/s" },
                { patient: "Sarah Johnson", age: 54, risk: "Medium", time: "4 hours ago", epwv: "9.2 m/s" },
                { patient: "Michael Brown", age: 45, risk: "Low", time: "1 day ago", epwv: "7.8 m/s" },
              ].map((visit, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg bg-card/50">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Users className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{visit.patient}, {visit.age}y</p>
                      <p className="text-sm text-muted-foreground">ePWV: {visit.epwv}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={visit.risk === "High" ? "destructive" : visit.risk === "Medium" ? "default" : "secondary"}
                      className={visit.risk === "Medium" ? "bg-warning text-warning-foreground" : ""}
                    >
                      {visit.risk} Risk
                    </Badge>
                    <span className="text-sm text-muted-foreground">{visit.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};