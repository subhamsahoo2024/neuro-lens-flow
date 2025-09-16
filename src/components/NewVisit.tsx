import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calculator, Heart, Activity } from "lucide-react";
import { EpwvCalculator } from "./EpwvCalculator";

interface NewVisitProps {
  onBack: () => void;
}

export const NewVisit = ({ onBack }: NewVisitProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [visitData, setVisitData] = useState({
    reason: "",
    technician: "",
    location: "",
    age: "",
    heartRate: "",
    systolic: "",
    diastolic: "",
    height: "",
    weight: "",
    temperature: "",
    spO2: "",
    diabetes: false,
    hypertension: false,
    atrialFib: false,
    smoking: false,
    cholesterol: false
  });

  const getMeanBP = () => {
    const sys = parseFloat(visitData.systolic);
    const dia = parseFloat(visitData.diastolic);
    if (sys && dia) {
      return ((sys + 2 * dia) / 3).toFixed(1);
    }
    return null;
  };

  const steps = [
    { title: "Visit Information", icon: Activity },
    { title: "Vital Signs", icon: Heart },
    { title: "Medical History", icon: Activity },
    { title: "ePWV Analysis", icon: Calculator }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Visit Information</CardTitle>
              <CardDescription>Basic information about this visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Input
                  id="reason"
                  value={visitData.reason}
                  onChange={(e) => setVisitData({ ...visitData, reason: e.target.value })}
                  placeholder="e.g., Routine screening, Follow-up"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="technician">Technician</Label>
                  <Input
                    id="technician"
                    value={visitData.technician}
                    onChange={(e) => setVisitData({ ...visitData, technician: e.target.value })}
                    placeholder="Technician name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Select onValueChange={(value) => setVisitData({ ...visitData, location: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="clinic-a">Clinic A</SelectItem>
                      <SelectItem value="clinic-b">Clinic B</SelectItem>
                      <SelectItem value="mobile-unit">Mobile Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>Record patient's current vital measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Age (years) *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={visitData.age}
                    onChange={(e) => setVisitData({ ...visitData, age: e.target.value })}
                    placeholder="Enter age"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
                  <Input
                    id="heartRate"
                    type="number"
                    value={visitData.heartRate}
                    onChange={(e) => setVisitData({ ...visitData, heartRate: e.target.value })}
                    placeholder="Enter heart rate"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="systolic">Systolic BP (mmHg) *</Label>
                  <Input
                    id="systolic"
                    type="number"
                    value={visitData.systolic}
                    onChange={(e) => setVisitData({ ...visitData, systolic: e.target.value })}
                    placeholder="Enter systolic BP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diastolic">Diastolic BP (mmHg) *</Label>
                  <Input
                    id="diastolic"
                    type="number"
                    value={visitData.diastolic}
                    onChange={(e) => setVisitData({ ...visitData, diastolic: e.target.value })}
                    placeholder="Enter diastolic BP"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={visitData.height}
                    onChange={(e) => setVisitData({ ...visitData, height: e.target.value })}
                    placeholder="Enter height"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={visitData.weight}
                    onChange={(e) => setVisitData({ ...visitData, weight: e.target.value })}
                    placeholder="Enter weight"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input
                    id="temperature"
                    type="number"
                    step="0.1"
                    value={visitData.temperature}
                    onChange={(e) => setVisitData({ ...visitData, temperature: e.target.value })}
                    placeholder="Enter temperature"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="spO2">SpO₂ (%)</Label>
                  <Input
                    id="spO2"
                    type="number"
                    value={visitData.spO2}
                    onChange={(e) => setVisitData({ ...visitData, spO2: e.target.value })}
                    placeholder="Enter oxygen saturation"
                  />
                </div>
              </div>
              {getMeanBP() && (
                <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
                  <p className="text-sm">
                    <span className="font-medium">Mean Blood Pressure:</span> {getMeanBP()} mmHg
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
              <CardDescription>Select relevant medical conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: "diabetes", label: "Diabetes" },
                  { key: "hypertension", label: "Hypertension" },
                  { key: "atrialFib", label: "Atrial Fibrillation" },
                  { key: "smoking", label: "Smoking History" },
                  { key: "cholesterol", label: "High Cholesterol" }
                ].map((condition) => (
                  <div key={condition.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={condition.key}
                      checked={visitData[condition.key as keyof typeof visitData] as boolean}
                      onCheckedChange={(checked) =>
                        setVisitData({ ...visitData, [condition.key]: checked })
                      }
                    />
                    <Label htmlFor={condition.key}>{condition.label}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      case 4:
        const age = parseFloat(visitData.age);
        const mbp = parseFloat(getMeanBP() || "0");
        return (
          <EpwvCalculator age={age} mbp={mbp} />
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return visitData.reason.trim() !== "";
      case 2:
        return visitData.age && visitData.systolic && visitData.diastolic;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">New Visit</h1>
            <p className="text-muted-foreground">Start a new patient assessment</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = currentStep === stepNumber;
            const isCompleted = currentStep > stepNumber;
            const Icon = step.icon;

            return (
              <div key={stepNumber} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                    ${isActive 
                      ? 'bg-primary border-primary text-primary-foreground' 
                      : isCompleted 
                        ? 'bg-success border-success text-success-foreground'
                        : 'bg-muted border-muted-foreground/30 text-muted-foreground'
                    }
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-xs mt-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 ${isCompleted ? 'bg-success' : 'bg-muted'}`} />
                )}
              </div>
            );
          })}
        </div>

        {renderStepContent()}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : onBack()}
          >
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>
          <Button
            onClick={() => currentStep < 4 ? setCurrentStep(currentStep + 1) : onBack()}
            disabled={!canProceed()}
            className="bg-primary hover:bg-primary/90"
          >
            {currentStep === 4 ? "Complete Visit" : "Next Step"}
          </Button>
        </div>
      </div>
    </div>
  );
};