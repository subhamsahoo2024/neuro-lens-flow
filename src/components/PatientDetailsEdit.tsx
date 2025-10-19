import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient, updatePatient, calculateBMI } from "@/lib/database";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const patientEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dob: z.string().optional(),
  gender: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  height: z.string().optional(),
  weight: z.string().optional(),
  blood_group: z.string().optional(),
  physician: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

type PatientEditFormData = z.infer<typeof patientEditSchema>;

interface PatientDetailsEditProps {
  patient: Patient;
  onSave: (updatedPatient: Patient) => void;
  onCancel: () => void;
}

export const PatientDetailsEdit = ({ patient, onSave, onCancel }: PatientDetailsEditProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PatientEditFormData>({
    resolver: zodResolver(patientEditSchema),
    defaultValues: {
      name: patient.name || "",
      dob: patient.dob || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      address: patient.address || "",
      height: patient.height?.toString() || "",
      weight: patient.weight?.toString() || "",
      blood_group: patient.blood_group || "",
      physician: patient.physician || "",
      allergies: patient.allergies || "",
      notes: patient.notes || "",
    },
  });

  const height = watch("height");
  const weight = watch("weight");

  const onSubmit = async (data: PatientEditFormData) => {
    try {
      const updates: Partial<Patient> = {
        name: data.name,
        dob: data.dob || null,
        gender: data.gender || null,
        phone: data.phone || null,
        address: data.address || null,
        height: data.height ? parseFloat(data.height) : null,
        weight: data.weight ? parseFloat(data.weight) : null,
        blood_group: data.blood_group || null,
        physician: data.physician || null,
        allergies: data.allergies || null,
        notes: data.notes || null,
      };

      // Calculate BMI if both height and weight are provided
      if (updates.height && updates.weight) {
        updates.bmi = calculateBMI(updates.height, updates.weight);
      }

      const updatedPatient = await updatePatient(patient.id, updates);

      toast({
        title: "Profile Updated",
        description: "Patient profile has been updated successfully.",
      });

      onSave(updatedPatient);
    } catch (error) {
      console.error('Error updating patient:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update patient profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculatedBMI =
    height && weight
      ? calculateBMI(parseFloat(height), parseFloat(weight)).toFixed(1)
      : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Edit Patient Profile</CardTitle>
          <CardDescription>Update patient information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" {...register("dob")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  defaultValue={patient.gender || ""}
                  onValueChange={(value) => {
                    const event = {
                      target: { name: "gender", value },
                    } as any;
                    register("gender").onChange(event);
                  }}
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
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Select
                  defaultValue={patient.blood_group || ""}
                  onValueChange={(value) => {
                    const event = {
                      target: { name: "blood_group", value },
                    } as any;
                    register("blood_group").onChange(event);
                  }}
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
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" {...register("address")} />
              </div>
            </div>
          </div>

          {/* Physical Measurements */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Physical Measurements</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  {...register("height")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  {...register("weight")}
                />
              </div>
              {calculatedBMI && (
                <div className="space-y-2">
                  <Label>BMI (calculated)</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50">
                    <span className="font-medium">{calculatedBMI}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Medical Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="physician">Physician</Label>
                <Input id="physician" {...register("physician")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea id="allergies" {...register("allergies")} rows={2} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...register("notes")} rows={3} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};
