import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient, updatePatient, calculateBMI } from "@/lib/database";
import { toast } from "@/hooks/use-toast";
import { Save, X } from "lucide-react";

interface PatientDetailsEditProps {
  patient: Patient;
  onCancel: () => void;
  onSave: (updatedPatient: Patient) => void;
}

export const PatientDetailsEdit = ({ patient, onCancel, onSave }: PatientDetailsEditProps) => {
  const [formData, setFormData] = useState({
    name: patient.name,
    age: patient.age?.toString() || "",
    dob: patient.dob || "",
    gender: patient.gender || "",
    phone: patient.phone || "",
    address: patient.address || "",
    height: patient.height?.toString() || "",
    weight: patient.weight?.toString() || "",
    blood_group: patient.blood_group || "",
    physician: patient.physician || "",
    allergies: patient.allergies || "",
    notes: patient.notes || ""
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const height = formData.height ? parseFloat(formData.height) : undefined;
      const weight = formData.weight ? parseFloat(formData.weight) : undefined;
      const bmi = height && weight ? calculateBMI(height, weight) : undefined;

      const updates: Partial<Patient> = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : undefined,
        dob: formData.dob || undefined,
        gender: formData.gender || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        height,
        weight,
        bmi,
        blood_group: formData.blood_group || undefined,
        physician: formData.physician || undefined,
        allergies: formData.allergies || undefined,
        notes: formData.notes || undefined
      };

      const updatedPatient = await updatePatient(patient.id, updates);
      
      toast({
        title: "Success",
        description: "Patient details updated successfully"
      });

      onSave(updatedPatient);
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Error",
        description: "Failed to update patient details",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Patient Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>

            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({...formData, age: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={(value) => setFormData({...formData, gender: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="blood_group">Blood Group</Label>
              <Select 
                value={formData.blood_group} 
                onValueChange={(value) => setFormData({...formData, blood_group: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select blood group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({...formData, height: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({...formData, weight: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="physician">Physician</Label>
              <Input
                id="physician"
                value={formData.physician}
                onChange={(e) => setFormData({...formData, physician: e.target.value})}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
